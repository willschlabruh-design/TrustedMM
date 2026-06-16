import { useEffect, useState } from 'react';
import AdminShell from '../../components/layout/AdminShell';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { Table, THead, TBody, TR, TH, TD } from '../../components/ui/Table';
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

function actionBadgeVariant(
  action: string
): 'success' | 'danger' | 'warning' | 'info' | 'default' {
  if (action.includes('SUCCESS') || action.includes('VERIFICATION') || action.includes('REGISTRATION')) {
    return 'success';
  }
  if (action.includes('FAILURE')) return 'danger';
  if (action.includes('RESET')) return 'warning';
  return 'info';
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

  if (loading) {
    return (
      <AdminShell title="Audit Logs" description="Loading authentication events…">
        <SkeletonTable rows={8} />
      </AdminShell>
    );
  }

  if (!me) {
    return (
      <AdminShell title="Audit Logs">
        <Alert variant="warning">Please log in as a platform admin.</Alert>
      </AdminShell>
    );
  }

  if (me.role !== 'ADMIN') {
    return (
      <AdminShell title="Audit Logs">
        <Alert variant="error" title="Forbidden">
          You do not have permission to access this area.
        </Alert>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title="Authentication Audit Logs"
      description="Recent registration, login, verification, and password reset events."
    >
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="app-input py-2 px-3 text-sm flex-1 sm:max-w-xs"
        >
          <option value="">All auth events</option>
          {ACTION_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Button variant="primary" size="md" onClick={() => loadLogs(actionFilter)}>
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      {logs.length === 0 ? (
        <EmptyState
          icon="📜"
          title="No events recorded"
          description="No authentication events match your filter yet."
        />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Timestamp</TH>
              <TH>Event</TH>
              <TH>Email</TH>
              <TH>User ID</TH>
              <TH>IP Address</TH>
            </TR>
          </THead>
          <TBody>
            {logs.map((log) => (
              <TR key={log.id}>
                <TD className="whitespace-nowrap text-slate-300">
                  {formatTimestamp(log.createdAt)}
                </TD>
                <TD>
                  <Badge variant={actionBadgeVariant(log.action)}>{log.label}</Badge>
                </TD>
                <TD className="text-slate-300">{log.email || '—'}</TD>
                <TD className="font-mono text-xs text-slate-400">{log.userId || '—'}</TD>
                <TD className="font-mono text-xs text-slate-400">{log.ipAddress || '—'}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </AdminShell>
  );
}
