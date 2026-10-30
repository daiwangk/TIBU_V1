import { useMe, useUpdateMe } from '../../queries/me';
import PageHeader from '../../components/ui/PageHeader';
import Switch from '../../components/ui/Switch';
import Skeleton from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';

/**
 * Notification settings screen: toggle digest notifications without browser push permissions.
 */
export default function NotificationSettingsPage() {
  const { data: profile, isPending, isError, refetch } = useMe();
  const updateMeMutation = useUpdateMe();

  return (
    <div className="min-h-screen bg-bg pb-12">
      <PageHeader title="Notification settings" fallbackTo="/notifications" />

      <main className="px-screen pt-4">
        {isPending && (
          <div className="rounded-card border border-border bg-surface p-4" aria-busy="true">
            <Skeleton variant="text" lines={2} />
          </div>
        )}

        {isError && (
          <ErrorState
            message="We couldn't load your notification settings. Please try again."
            onRetry={() => refetch()}
          />
        )}

        {!isPending && !isError && profile && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center rounded-card border border-border bg-surface px-4 py-3">
              <Switch
                id="digest-notifications-switch"
                label="Grouped updates about new businesses near me"
                checked={profile.notifyDigest !== false}
                disabled={updateMeMutation.isPending}
                onChange={(checked) => updateMeMutation.mutate({ notifyDigest: checked })}
                className="flex-1 [&_label]:cursor-pointer [&_label]:font-body [&_label]:text-sm [&_label]:font-medium [&_label]:text-ink"
              />
            </div>
            <p className="px-1 font-body text-xs text-muted">
              Grouped updates about new businesses near your home area.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

