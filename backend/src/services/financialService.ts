import mongoose from 'mongoose';
import { ProjectFinancials, IProjectFinancials } from '../models/ProjectFinancials.js';
import { CostEntry, ICostEntry } from '../models/CostEntry.js';
import { PaymentRecord, IPaymentRecord } from '../models/PaymentRecord.js';
import { Submission } from '../models/Submission.js';
import {
  calcGrossProfit,
  calcGrossMarginPercent,
  calcMarkupPercent,
} from '@shared/utils/currency.js';
import {
  ProjectFinancialsDTO,
  FinancialAnalyticsDashboardDTO,
  CostCategory,
} from '@shared/types/index.js';
import { serializeProjectFinancials } from '../utils/serializers.js';

export class FinancialService {
  /**
   * Recalculate project totals after adding/updating costs or payments
   */
  static async recalculateProjectFinancials(submissionId: string): Promise<IProjectFinancials> {
    const subObjId = new mongoose.Types.ObjectId(submissionId);

    // Sum estimated and actual costs
    const costs = await CostEntry.find({ submissionId: subObjId });
    let estimatedCostPaise = 0;
    let actualCostPaise = 0;

    for (const cost of costs) {
      if (cost.isActual) {
        actualCostPaise += cost.amountPaise;
      } else {
        estimatedCostPaise += cost.amountPaise;
      }
    }

    // Sum received payments
    const payments = await PaymentRecord.find({
      submissionId: subObjId,
      status: 'received',
    });
    let collectedPaise = 0;
    for (const p of payments) {
      collectedPaise += p.amountPaise;
    }

    const fin = await ProjectFinancials.findOne({ submissionId: subObjId });
    if (!fin) {
      throw new Error('Financial record not found for this project.');
    }

    fin.estimatedDirectCostPaise = estimatedCostPaise;
    fin.actualDirectCostPaise = actualCostPaise;
    fin.collectedRevenuePaise = collectedPaise;

    const revenueForCalc =
      fin.approvedRevenuePaise > 0 ? fin.approvedRevenuePaise : fin.quotedRevenuePaise;

    fin.estimatedGrossProfitPaise = calcGrossProfit(revenueForCalc, estimatedCostPaise);
    fin.actualGrossProfitPaise = calcGrossProfit(revenueForCalc, actualCostPaise);
    fin.grossMarginPercent = calcGrossMarginPercent(revenueForCalc, actualCostPaise);
    fin.markupPercent = calcMarkupPercent(revenueForCalc, actualCostPaise);

    await fin.save();
    return fin;
  }

  static async getProjectFinancialsBySubmissionId(
    submissionId: string
  ): Promise<ProjectFinancialsDTO | null> {
    const subObjId = new mongoose.Types.ObjectId(submissionId);
    const fin = await ProjectFinancials.findOne({ submissionId: subObjId });
    if (!fin) return null;

    const submission = await Submission.findById(subObjId);
    if (!submission) return null;

    const costEntries = await CostEntry.find({ submissionId: subObjId }).sort({ date: -1 });
    const paymentRecords = await PaymentRecord.find({ submissionId: subObjId }).sort({
      paymentDate: -1,
    });

    return serializeProjectFinancials(fin, submission, costEntries, paymentRecords);
  }

  static async addCostEntry(data: {
    submissionId: string;
    category: CostCategory;
    isActual: boolean;
    amountPaise: number;
    description: string;
    date?: string;
    userId: string;
    userName: string;
  }): Promise<ICostEntry> {
    const entry = await CostEntry.create({
      submissionId: new mongoose.Types.ObjectId(data.submissionId),
      category: data.category,
      isActual: data.isActual,
      amountPaise: data.amountPaise,
      description: data.description,
      date: data.date ? new Date(data.date) : new Date(),
      loggedByUserId: new mongoose.Types.ObjectId(data.userId),
      loggedByName: data.userName,
    });

    await this.recalculateProjectFinancials(data.submissionId);
    return entry;
  }

  static async addPaymentRecord(data: {
    submissionId: string;
    quotationId?: string;
    amountPaise: number;
    paymentDate?: string;
    paymentMethod: 'bank_transfer' | 'upi' | 'card' | 'cheque' | 'other';
    status?: 'received' | 'pending' | 'failed';
    referenceNumber: string;
    notes?: string;
    userId: string;
  }): Promise<IPaymentRecord> {
    const payment = await PaymentRecord.create({
      submissionId: new mongoose.Types.ObjectId(data.submissionId),
      quotationId: data.quotationId ? new mongoose.Types.ObjectId(data.quotationId) : undefined,
      amountPaise: data.amountPaise,
      paymentDate: data.paymentDate ? new Date(data.paymentDate) : new Date(),
      paymentMethod: data.paymentMethod,
      status: data.status || 'received',
      referenceNumber: data.referenceNumber,
      notes: data.notes,
      recordedByUserId: new mongoose.Types.ObjectId(data.userId),
    });

    await this.recalculateProjectFinancials(data.submissionId);
    return payment;
  }

  static async updateTargetMargin(
    submissionId: string,
    targetMarginPercent: number,
    financialNotes?: string
  ): Promise<IProjectFinancials | null> {
    const fin = await ProjectFinancials.findOneAndUpdate(
      { submissionId: new mongoose.Types.ObjectId(submissionId) },
      {
        targetMarginPercent,
        ...(financialNotes !== undefined && { financialNotes }),
      },
      { new: true }
    );

    if (fin) {
      await this.recalculateProjectFinancials(submissionId);
    }
    return fin;
  }

  /**
   * Aggregated Profit & Margin Dashboard metrics
   */
  static async getFinancialAnalyticsDashboard(): Promise<FinancialAnalyticsDashboardDTO> {
    const allFinancials = await ProjectFinancials.find().sort({ updatedAt: -1 });
    const allSubmissions = await Submission.find();
    const subMap = new Map<string, any>();
    allSubmissions.forEach((s) => subMap.set(s._id.toString(), s));

    let totalQuotedRevenuePaise = 0;
    let totalApprovedRevenuePaise = 0;
    let totalCollectedRevenuePaise = 0;
    let totalEstimatedDirectCostPaise = 0;
    let totalActualDirectCostPaise = 0;
    let projectsBelowTargetMarginCount = 0;
    let projectsWithMissingCostsCount = 0;

    const catMetrics: Record<'website' | 'app' | 'desktop', { revenue: number; cost: number; count: number }> = {
      website: { revenue: 0, cost: 0, count: 0 },
      app: { revenue: 0, cost: 0, count: 0 },
      desktop: { revenue: 0, cost: 0, count: 0 },
    };

    const projectDTOs: ProjectFinancialsDTO[] = [];

    for (const fin of allFinancials) {
      const sub = subMap.get(fin.submissionId.toString());
      if (!sub) continue;

      totalQuotedRevenuePaise += fin.quotedRevenuePaise;
      totalApprovedRevenuePaise += fin.approvedRevenuePaise;
      totalCollectedRevenuePaise += fin.collectedRevenuePaise;
      totalEstimatedDirectCostPaise += fin.estimatedDirectCostPaise;
      totalActualDirectCostPaise += fin.actualDirectCostPaise;

      const projRev = fin.approvedRevenuePaise > 0 ? fin.approvedRevenuePaise : fin.quotedRevenuePaise;
      const cat = (sub.projectCategory || 'website') as 'website' | 'app' | 'desktop';
      if (catMetrics[cat]) {
        catMetrics[cat].revenue += projRev;
        catMetrics[cat].cost += fin.actualDirectCostPaise;
        catMetrics[cat].count += 1;
      }

      const isBelowTarget =
        fin.grossMarginPercent !== null && fin.grossMarginPercent < fin.targetMarginPercent;
      const hasMissingCosts =
        fin.actualDirectCostPaise === 0 && fin.estimatedDirectCostPaise === 0;

      if (isBelowTarget) projectsBelowTargetMarginCount++;
      if (hasMissingCosts) projectsWithMissingCostsCount++;

      const costEntries = await CostEntry.find({ submissionId: fin.submissionId }).sort({
        date: -1,
      });
      const paymentRecords = await PaymentRecord.find({ submissionId: fin.submissionId }).sort({
        paymentDate: -1,
      });

      projectDTOs.push(serializeProjectFinancials(fin, sub, costEntries, paymentRecords));
    }

    const effectiveTotalRevenue =
      totalApprovedRevenuePaise > 0 ? totalApprovedRevenuePaise : totalQuotedRevenuePaise;

    const totalEstimatedGrossProfitPaise = calcGrossProfit(
      effectiveTotalRevenue,
      totalEstimatedDirectCostPaise
    );
    const totalActualGrossProfitPaise = calcGrossProfit(
      effectiveTotalRevenue,
      totalActualDirectCostPaise
    );
    const overallGrossMarginPercent = calcGrossMarginPercent(
      effectiveTotalRevenue,
      totalActualDirectCostPaise
    );
    const overallMarkupPercent = calcMarkupPercent(
      effectiveTotalRevenue,
      totalActualDirectCostPaise
    );

    const categoryBreakdown = {
      website: {
        totalRevenuePaise: catMetrics.website.revenue,
        totalCostPaise: catMetrics.website.cost,
        totalProfitPaise: calcGrossProfit(catMetrics.website.revenue, catMetrics.website.cost),
        marginPercent: calcGrossMarginPercent(catMetrics.website.revenue, catMetrics.website.cost),
        projectCount: catMetrics.website.count,
      },
      app: {
        totalRevenuePaise: catMetrics.app.revenue,
        totalCostPaise: catMetrics.app.cost,
        totalProfitPaise: calcGrossProfit(catMetrics.app.revenue, catMetrics.app.cost),
        marginPercent: calcGrossMarginPercent(catMetrics.app.revenue, catMetrics.app.cost),
        projectCount: catMetrics.app.count,
      },
      desktop: {
        totalRevenuePaise: catMetrics.desktop.revenue,
        totalCostPaise: catMetrics.desktop.cost,
        totalProfitPaise: calcGrossProfit(catMetrics.desktop.revenue, catMetrics.desktop.cost),
        marginPercent: calcGrossMarginPercent(catMetrics.desktop.revenue, catMetrics.desktop.cost),
        projectCount: catMetrics.desktop.count,
      },
    };

    return {
      totalQuotedRevenuePaise,
      totalApprovedRevenuePaise,
      totalCollectedRevenuePaise,
      totalOutstandingReceivablesPaise: Math.max(
        0,
        totalApprovedRevenuePaise - totalCollectedRevenuePaise
      ),
      totalEstimatedDirectCostPaise,
      totalActualDirectCostPaise,
      totalEstimatedGrossProfitPaise,
      totalActualGrossProfitPaise,
      overallGrossMarginPercent,
      overallMarkupPercent,
      projectsBelowTargetMarginCount,
      projectsWithMissingCostsCount,
      projects: projectDTOs,
      categoryBreakdown,
    };
  }
}
