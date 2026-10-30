import { Inbox } from 'lucide-react';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import PageHeader from '../../components/ui/PageHeader';
import Skeleton from '../../components/ui/Skeleton';
import Tabs from '../../components/ui/Tabs';
import { useApplications } from '../../queries/admin';
import { ADMIN_TABS, groupByStatus, parseStatusParam } from './adminModel';
import ApplicationRow from './ApplicationRow';

/** /admin — seller applications in four tabs (?status=), counted from one list of every status. */
export default function AdminListPage() {
  const [params, setParams] = useSearchParams();
  const status = parseStatusParam(params.get('status'));
  const { data, isLoading, isError, error, refetch } = useApplications();
  const groups = useMemo(() => groupByStatus(data), [data]);

  const tab = ADMIN_TABS.find((t) => t.status === status);
  const items = ADMIN_TABS.map((t) => ({
    value: t.status,
    label: data ? `${t.label} (${groups[t.status].length})` : t.label,
  }));
  const rows = groups[status];

  return (
    <div className="min-h-svh bg-bg">
      <PageHeader title="Admin" fallbackTo="/profile" />
      <Tabs
        value={status}
        onChange={(value) => setParams({ status: value }, { replace: true })}
        items={items}
        className="px-screen"
      />
      <main id={`tabpanel-${status}`} role="tabpanel" aria-labelledby={`tab-${status}`} className="px-screen pt-4 pb-10">
        {isLoading && (
          <div className="flex flex-col gap-3" role="status" aria-label="Loading">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        )}
        {isError && data === undefined && <ErrorState error={error} onRetry={() => refetch()} />}
        {data && rows.length === 0 && (
          <EmptyState icon={<Inbox size={32} aria-hidden="true" />} title={tab.emptyTitle} text={tab.emptyText} />
        )}
        {data && rows.length > 0 && (
          <ul className="overflow-hidden rounded-card border border-border bg-surface">
            {rows.map((row) => (
              <ApplicationRow key={row.businessId} row={row} />
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
