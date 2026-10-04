import SectionHeader from '../../components/SectionHeader';
import HorizontalScroller from '../../components/HorizontalScroller';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';

/**
 * A Home row: SectionHeader + horizontal scroller with the 4 data states.
 * "View all" is only shown once there is data to view.
 *
 * @template T
 * @param {{
 *   title: string,
 *   viewAllTo?: string,
 *   query: { data?: T[], isPending: boolean, isError: boolean, refetch: () => unknown },
 *   skeleton: React.ReactNode,
 *   errorMessage: string,
 *   empty: { icon: React.ReactNode, title: string, text?: string, action?: { label: string, onClick: () => void } },
 *   renderItem: (item: T) => React.ReactNode,
 * }} props
 */
export default function HomeSection({
  title,
  viewAllTo,
  query,
  skeleton,
  errorMessage,
  empty,
  renderItem,
}) {
  const { data, isPending, isError, refetch } = query;
  const hasData = !isPending && !isError && (data?.length ?? 0) > 0;

  let body;
  if (isPending) {
    body = (
      <div aria-busy="true">
        <span className="sr-only">Loading {title}</span>
        <HorizontalScroller className="py-1">{skeleton}</HorizontalScroller>
      </div>
    );
  } else if (isError) {
    body = <ErrorState message={errorMessage} onRetry={() => refetch()} />;
  } else if (!hasData) {
    body = <EmptyState {...empty} />;
  } else {
    body = <HorizontalScroller className="py-1">{data.map(renderItem)}</HorizontalScroller>;
  }

  return (
    <section aria-label={title} className="flex flex-col gap-1 w-full min-w-0">
      <SectionHeader title={title} viewAllTo={hasData ? viewAllTo : undefined} />
      {body}
    </section>
  );
}
