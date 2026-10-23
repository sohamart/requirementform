import React, { useState } from 'react';
import { Bell, CheckCheck, Sparkles, FolderKanban, TrendingUp } from 'lucide-react';

export const AdminNotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 'n-1',
      title: 'New Website Requirement Intake',
      message: 'Enquiry REQ-2026-ABCD submitted for Corporate Business Website.',
      type: 'submission',
      time: '15 mins ago',
      read: false,
    },
    {
      id: 'n-2',
      title: 'Target Margin Alert',
      message: 'Project REQ-2026-X7Y9 gross margin fell to 32.5% (target: 45%).',
      type: 'margin_alert',
      time: '1 hour ago',
      read: false,
    },
    {
      id: 'n-3',
      title: 'Quotation Accepted by Client',
      message: 'Quotation QTE-2026-001 approved by Acme Retail Pvt Ltd.',
      type: 'quotation',
      time: '3 hours ago',
      read: true,
    },
  ]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-500">
            ACTIVITY ALERTS
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            Notifications Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Automated alerts for new requirement submissions, quotation approvals, and margin warnings.
          </p>
        </div>

        <button
          onClick={markAllRead}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-charcoal-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 cursor-pointer self-start sm:self-auto"
        >
          <CheckCheck className="w-4 h-4" />
          <span>Mark All Read</span>
        </button>
      </div>

      <div className="glass-panel rounded-3xl border border-slate-200 dark:border-charcoal-750 overflow-hidden shadow-xl divide-y divide-slate-100 dark:divide-charcoal-750">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`p-5 flex items-start gap-4 transition-colors ${
              n.read ? 'opacity-70' : 'bg-brand-500/5'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                n.type === 'margin_alert'
                  ? 'bg-amber-500/10 text-amber-500'
                  : n.type === 'quotation'
                  ? 'bg-emerald-500/10 text-emerald-500'
                  : 'bg-brand-500/10 text-brand-500'
              }`}
            >
              {n.type === 'margin_alert' ? (
                <TrendingUp className="w-5 h-5" />
              ) : (
                <Bell className="w-5 h-5" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {n.title}
                </h4>
                <span className="text-[11px] text-slate-400">{n.time}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{n.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
