import { ExternalLink, SearchX } from 'lucide-react';
import { useParams } from 'react-router-dom';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import PageHeader from '../../components/ui/PageHeader';
import Skeleton from '../../components/ui/Skeleton';
import { formatRelativeTime } from '../../lib/format';
import { useApplication } from '../../queries/admin';
import AdminActions from './AdminActions';
import { STATUS_BADGES } from './adminModel';
import ApplicationContact from './ApplicationContact';
import ApplicationHistory from './ApplicationHistory';
import ApplicationMedia from './ApplicationMedia';
import ApplicationProfile from './ApplicationProfile';

function StatusCard({ business, row }) {
  const badge = STATUS_BADGES[business.status] ?? { label: business.status, tone: 'neutral' };
  const showReason = (business.status === 'rejected' || business.status === 'unpublished') && business.rejectionReason;
  const submittedAt = business.submittedAt ?? row.submittedAt;

  return (
    <section aria-label="Status" className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={badge.tone}>{badge.label}</Badge>
        {submittedAt && <span className="font-body text-xs text-muted">Submitted {formatRelativeTime(submittedAt)}</span>}
      </div>
      {business.status === 'draft' && <p className="font-body text-sm text-body">Draft - not submitted yet</p>}
      {showReason && (
        <div className="flex flex-col gap-0.5">
          <span className="font-body text-xs text-muted">Reason given to the seller</span>
          <p className="whitespace-pre-line font-body text-sm text-ink">{business.rejectionReason}</p>
        </div>
      )}
      <AdminActions business={business} />
      {business.status === 'approved' && (
        <Button to={`/b/${business.slug}`} variant="secondary">
          <ExternalLink size={16} aria-hidden="true" />
          View public page
        </Button>
      )}
    </section>
  );
}

/** /admin/applications/:businessId — everything needed to verify a seller, and the decision buttons. */
export default function AdminApplicationPage() {
  const { businessId } = useParams();
  const { data, isLoading, isError, error, refetch } = useApplication(businessId);

  return (
    <div className="min-h-svh bg-bg">
      <PageHeader title="Application" fallbackTo="/admin" />
      <main className="flex flex-col gap-6 px-screen pt-6 pb-10">
        {isLoading && (
          <div className="flex flex-col gap-4" role="status" aria-label="Loading">
            <Skeleton className="aspect-video w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        )}
        {isError && data === undefined && <ErrorState error={error} onRetry={() => refetch()} />}
        {data === null && (
          <EmptyState
            icon={<SearchX size={32} aria-hidden="true" />}
            title="We couldn't find that application"
            text="It may have been removed, or the link is wrong."
            action={{ label: 'Back to applications', to: '/admin' }}
          />
        )}
        {data && (
          <>
            <ApplicationProfile business={data.business} />
            <StatusCard business={data.business} row={data.row} />
            <ApplicationContact business={data.business} row={data.row} />
            <ApplicationMedia business={data.business} />
            <ApplicationHistory history={data.history} />
          </>
        )}
      </main>
    </div>
  );
}
