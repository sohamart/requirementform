import React, { useState, useEffect } from 'react';
import { Activity, Database, Server, Clock, RefreshCw, CheckCircle2, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api.js';

export const AdminSystemHealthPage: React.FC = () => {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = () => {
    setLoading(true);
    api
      .get('/health')
      .then((res) => setHealth(res.data))
      .catch((err) => {
        setHealth({
          status: 'degraded',
          database: 'disconnected',
          error: err.message,
        });
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-500">
            SYSTEM DIAGNOSTICS & TELEMETRY
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            System Health & Diagnostics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time backend database connectivity, uptime status, and backup recovery documentation.
          </p>
        </div>

        <button
          onClick={checkHealth}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-charcoal-800 hover:bg-slate-200 text-slate-800 dark:text-white cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Ping Health Endpoint</span>
        </button>
      </div>

      {health && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="p-6 rounded-3xl glass-card flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase text-slate-400">System Status</p>
              <p className="text-2xl font-black text-emerald-500 mt-1 capitalize">{health.status}</p>
              <span className="text-[11px] text-slate-500">Operational</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="p-6 rounded-3xl glass-card flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase text-slate-400">Database Layer</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 capitalize">
                {health.database}
              </p>
              <span className="text-[11px] text-emerald-500 font-semibold">MongoDB ReplSet / Atlas</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Database className="w-6 h-6" />
            </div>
          </div>

          <div className="p-6 rounded-3xl glass-card flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase text-slate-400">Server Uptime</p>
              <p className="text-2xl font-black text-brand-500 mt-1">
                {health.uptimeSeconds ? `${Math.floor(health.uptimeSeconds / 60)} mins` : 'Live'}
              </p>
              <span className="text-[11px] text-slate-500">Environment: {health.environment}</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>
      )}

      {/* Database Backup & Disaster Recovery Guide */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-charcoal-750 space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-brand-500" />
          <span>Database Integrity, Backups & Disaster Recovery Procedures</span>
        </h3>

        <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            <strong>1. Automated Replica Set Parity:</strong> In local development and automated testing environments, <code>MongoMemoryReplSet</code> provides full multi-document transaction semantics identical to MongoDB Atlas replica sets.
          </p>
          <p>
            <strong>2. Production MongoDB Atlas Backups:</strong> For production deployments, continuous point-in-time recovery (PITR) and automated daily snapshots must be configured in MongoDB Atlas.
          </p>
          <p>
            <strong>3. Disaster Recovery Restoration:</strong>
          </p>
          <pre className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto">
{`# 1. Export database snapshot:
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/requirementform" --out=/backups/$(date +%F)

# 2. Restore database snapshot:
mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net/requirementform" --drop /backups/YYYY-MM-DD/requirementform`}
          </pre>
        </div>
      </div>
    </div>
  );
};
