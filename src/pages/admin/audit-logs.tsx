import React, { useEffect, useState } from 'react';
import Header from '../../components/Header';
import { AUTH_AUDIT_ACTION_LABELS } from '../../lib/audit-log';

type AuditLogEntry = {
  id: string;
  userId: string | null;
  email: string | null;
  ipAddress: string | null;
  action: string;
  label: string;
  createdAt: string;
};

const ACTION_OPTIONS = Object.entries(AUTH_AUDIT_ACTION_LABELS).map(([value, label]) => ({
  value,
  label,
}));

function formatTimestamp(value: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'medium',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function actionBadgeClass(action: string) {
  if (action.includes('SUCCESS') || action.includes('VERIFICATION') || action.includes('REGISTRATION')) {
    return 'bg-emerald-900/40 text-emerald-200 border-emerald-700/50';
  }
  if (action.includes('FAILURE')) {
    return 'bg-red-900/40 text-red-200 border-red-700/50';
  }
  if (action.includes('RESET')) {
    return 'bg-amber-900/40 text-amber-200 border-amber-700/50';
  }
  return 'bg-blue-900/40 text-blue-200 border-blue-700/50';
}

export default function AdminAuditLogs() {
  const [me, setMe] = useState<{ role?: string; username?: string } | null>(null);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState('');

  async function loadLogs(filter = actionFilter) {
    setError(null);
    const params = new URLSearchParams({ limit: '100' });
    if (filter) params.set('action', filter);

    const res = await fetch(`/api/admin/audit-logs?${params.toString()}`, {
      credentials: 'same-origin',
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Failed to load audit logs');
      setLogs([]);
      return;
    }

    const data = await res.json();
    setLogs(data.logs || []);
  }

  useEffect(() => {
    (async () => {
      const meRes = await fetch('/api/auth/me', { credentials: 'same-origin' });
      const meData = await meRes.json();
      setMe(meData.user || null);

      if (!meData.user || meData.user.role !== 'ADMIN') {
        setLoading(false);
        return;
      }

      await loadLogs('');
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="min-h-screen pt-24 px-6 text-white">Loading...</div>;
  if (!me) return <div className="min-h-screen pt-24 px-6 text-white">Please log in as a platform admin.</div>;
  if (me.role !== 'ADMIN') return <div className="min-h-screen pt-24 px-6 text-white">Forbidden</div>;

  return (
    <div>
      <Header />
      <main className="min-h-screen bg-neutral-900 text-white pt-24 px-6 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-semibold mb-1">Authentication Audit Logs</h1>
              <p className="text-slate-300 text-sm">
                Recent registration, login, verification, and password reset events.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <a href="/admin" className="px-3 py-2 rounded border border-neutral-600 text-sm hover:bg-neutral-800">
                Back to Admin
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3 py-2 rounded border bg-neutral-800 border-neutral-700 text-white text-sm"
            >
              <option value="">All auth events</option>
              {ACTION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => loadLogs(actionFilter)}
              className="px-4 py-2 rounded bg-primary text-white text-sm"
            >
              Refresh
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded bg-red-900/30 border border-red-700 text-red-200 text-sm">
              {error}
            </div>
          )}

          <div className="overflow-x-auto bg-neutral-800 p-4 rounded">
            <table className="w-full table-auto border-collapse text-sm">
              <thead>
                <tr className="text-left border-b border-neutral-700 bg-neutral-700">
                  <th className="p-3 text-white">Timestamp</th>
                  <th className="p-3 text-white">Event</th>
                  <th className="p-3 text-white">Email</th>
                  <th className="p-3 text-white">User ID</th>
                  <th className="p-3 text-white">IP Address</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-400">
                      No authentication events recorded yet.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="border-t border-neutral-700">
                      <td className="p-3 text-slate-300 whitespace-nowrap">
                        {formatTimestamp(log.createdAt)}
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-flex px-2 py-1 rounded border text-xs font-medium ${actionBadgeClass(log.action)}`}
                        >
                          {log.label}
                        </span>
                      </td>
                      <td className="p-3 text-slate-300">{log.email || '—'}</td>
                      <td className="p-3 text-slate-400 font-mono text-xs">{log.userId || '—'}</td>
                      <td className="p-3 text-slate-400 font-mono text-xs">{log.ipAddress || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
