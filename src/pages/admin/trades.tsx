import { useEffect, useMemo, useState } from 'react';
import { Package } from 'lucide-react';
import AdminShell from '../../components/layout/AdminShell';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { Table, THead, TBody, TR, TH, TD } from '../../components/ui/Table';
import StatusBadge from '../../components/trade/StatusBadge';

type Trade = {
  id: string;
  title: string;
  status: string;
  value: number | string;
};

export default function AdminTrades() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      const r = await fetch('/api/admin/trades');
      if (r.ok) {
        const j = await r.json();
        setTrades(j.trades || []);
      }
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return trades;
    return trades.filter(
      (t) =>
        t.title?.toLowerCase().includes(q) ||
        t.status?.toLowerCase().includes(q) ||
        String(t.value).includes(q) ||
        t.id.toLowerCase().includes(q)
    );
  }, [trades, search]);

  return (
    <AdminShell title="All Trades" description="Monitor and manage platform trades.">
      <div className="mb-6 max-w-md">
        <Input
          label="Search trades"
          placeholder="Title, status, value, or ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          hint={`Showing ${filtered.length} of ${trades.length} trades`}
        />
      </div>

      {loading && <SkeletonTable rows={6} />}

      {!loading && trades.length === 0 && (
        <EmptyState
          icon={<Package className="h-6 w-6" strokeWidth={2} aria-hidden />}
          title="No trades yet"
          description="Trades created on the platform will appear here."
        />
      )}

      {!loading && trades.length > 0 && filtered.length === 0 && (
        <EmptyState
          title="No matches"
          description="Try a different search term."
          actionLabel="Clear search"
          onAction={() => setSearch('')}
        />
      )}

      {!loading && filtered.length > 0 && (
        <Table>
          <THead>
            <TR>
              <TH>Title</TH>
              <TH>Status</TH>
              <TH>Value</TH>
              <TH className="text-right">Actions</TH>
            </TR>
          </THead>
          <TBody>
            {filtered.map((t) => (
              <TR key={t.id}>
                <TD>
                  <div>
                    <span className="font-medium text-white">{t.title}</span>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">{t.id}</p>
                  </div>
                </TD>
                <TD>
                  <StatusBadge status={t.status} />
                </TD>
                <TD className="text-slate-300">{t.value}</TD>
                <TD className="text-right">
                  <a href={`/admin/trades/${t.id}`}>
                    <Button variant="primary" size="sm">
                      View
                    </Button>
                  </a>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </AdminShell>
  );
}
