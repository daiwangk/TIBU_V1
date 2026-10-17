import { UserX } from 'lucide-react';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import PageHeader from '../../components/ui/PageHeader';
import Skeleton from '../../components/ui/Skeleton';
import { useMe } from '../../queries/me';
import EditProfileForm from './EditProfileForm';

function FormSkeleton() {
  return (
    <div className="flex flex-col gap-5" role="status" aria-label="Loading profile">
      <div className="flex items-center gap-4">
        <Skeleton variant="circle" size="xl" />
        <Skeleton className="h-11 w-36 rounded-btn" />
      </div>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-11 rounded-btn" />
        </div>
      ))}
    </div>
  );
}

/** /profile/edit (RequireAuth in App.jsx). */
export default function EditProfilePage() {
  const { data: profile, isLoading, isError, error, refetch } = useMe();

  let body;
  if (isLoading) body = <FormSkeleton />;
  else if (isError) body = <ErrorState error={error} onRetry={() => refetch()} />;
  else if (!profile) {
    body = (
      <EmptyState
        icon={<UserX size={28} aria-hidden="true" />}
        title="We couldn't find your profile"
        text="Try again in a moment."
        action={{ label: 'Try again', onClick: () => refetch() }}
      />
    );
  } else body = <EditProfileForm key={profile.id} profile={profile} />;

  return (
    <div className="min-h-svh bg-bg">
      <PageHeader title="Edit profile" fallbackTo="/profile" />
      <main className="px-screen pt-5 pb-10">{body}</main>
    </div>
  );
}
