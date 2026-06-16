import { useEffect, useState } from 'react';
import AdminShell from '../../components/layout/AdminShell';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { Table, THead, TBody, TR, TH, TD } from '../../components/ui/Table';

type User = {
  id: string;
  username: string;
  email: string;
  role: string;
};

export default function AdminPanel() {
  const [me, setMe] = useState<{ username?: string; role?: string } | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRole, setEditingRole] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      const r = await fetch('/api/auth/me');
      const j = await r.json();
      setMe(j.user || null);
      if (!j.user) {
        setLoading(false);
        return;
      }
      if (j.user.role !== 'ADMIN') {
        setLoading(false);
        return;
      }
      const ru = await fetch('/api/admin/users');
      if (ru.ok) {
        const data = await ru.json();
        setUsers(data.users || []);
      }
      setLoading(false);
    })();
  }, []);

  async function ban(userId: string) {
    await fetch('/api/admin/ban', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    refresh();
  }

  async function unban(userId: string) {
    await fetch('/api/admin/unban', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    refresh();
  }

  async function refresh() {
    const ru = await fetch('/api/admin/users');
    if (ru.ok) {
      const data = await ru.json();
      setUsers(data.users || []);
    }
  }

  async function setRole(userId: string, role: string) {
    await fetch('/api/admin/set-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role }),
    });
    refresh();
  }

  function roleBadgeVariant(role: string): 'success' | 'danger' | 'info' | 'default' {
    if (role === 'ADMIN') return 'info';
    if (role === 'BANNED') return 'danger';
    return 'default';
  }

  if (loading) {
    return (
      <AdminShell title="Platform Admin" description="Loading admin panel…">
        <SkeletonTable rows={6} />
      </AdminShell>
    );
  }

  if (!me) {
    return (
      <AdminShell title="Platform Admin">
        <Alert variant="warning">Please log in as a platform admin.</Alert>
      </AdminShell>
    );
  }

  if (me.role !== 'ADMIN') {
    return (
      <AdminShell title="Platform Admin">
        <Alert variant="error" title="Forbidden">
          You do not have permission to access this area.
        </Alert>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title="Platform Admin Panel"
      description={`Signed in as ${me.username}`}
    >
      <div className="mb-6">
        <a href="/admin/audit-logs">
          <Button variant="secondary" size="sm">
            View Authentication Audit Logs
          </Button>
        </a>
      </div>

      <Card padding="sm">
        <div className="px-2 py-3 border-b border-white/8 mb-0">
          <h2 className="text-lg font-semibold text-white">Users</h2>
          <p className="text-sm text-slate-400 mt-0.5">Manage roles and account status</p>
        </div>

        {users.length === 0 ? (
          <EmptyState
            title="No users found"
            description="User accounts will appear here once registered."
          />
        ) : (
          <Table className="border-0 rounded-none">
            <THead>
              <TR>
                <TH>Username</TH>
                <TH>Email</TH>
                <TH>Role</TH>
                <TH>Actions</TH>
              </TR>
            </THead>
            <TBody>
              {users.map((u) => (
                <TR key={u.id}>
                  <TD>
                    <span className="font-medium text-white">{u.username}</span>
                  </TD>
                  <TD>
                    <span className="text-slate-400">{u.email}</span>
                  </TD>
                  <TD>
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={editingRole[u.id] ?? u.role}
                        onChange={(e) =>
                          setEditingRole({ ...editingRole, [u.id]: e.target.value })
                        }
                        className="app-input py-1.5 px-2 text-sm min-w-[7rem]"
                      >
                        <option>USER</option>
                        <option>ADMIN</option>
                        <option>BANNED</option>
                      </select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const role = editingRole[u.id] ?? u.role;
                          setRole(u.id, role);
                        }}
                      >
                        Set role
                      </Button>
                      <Badge variant={roleBadgeVariant(u.role)}>{u.role}</Badge>
                    </div>
                  </TD>
                  <TD>
                    {u.role !== 'ADMIN' && (
                      <div className="flex flex-wrap items-center gap-2">
                        <Button variant="danger" size="sm" onClick={() => ban(u.id)}>
                          Ban
                        </Button>
                        <Button variant="primary" size="sm" onClick={() => unban(u.id)}>
                          Unban
                        </Button>
                      </div>
                    )}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </Card>
    </AdminShell>
  );
}
