import { Pencil, UserRound, UserX } from 'lucide-react';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Skeleton from '../../components/ui/Skeleton';
import { useMe } from '../../queries/me';
import { useAuthStore } from '../../stores/auth';
import LogoutButton from './LogoutButton';
import ProfileRows from './ProfileRows';
import { INFO_ROWS, accountRows } from './profileForm';

function GuestCard() {
  return (
    <section className="rounded-card-lg bg-lavender p-5 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-surface text-primary" aria-hidden="true">
        <UserRound size={26} />
      </span>
      <h2 className="mt-3 font-heading text-lg font-bold text-ink">Your Tibu account</h2>
      <p className="mt-1 font-body text-sm text-body">Log in to save favourites, contact sellers and see who you&apos;ve connected with.</p>
      <div className="mt-4 flex flex-col gap-2">
        <Button to="/login?next=%2Fprofile" size="lg" className="w-full">Log in</Button>
        <Button to="/signup?next=%2Fprofile" variant="secondary" size="lg" className="w-full">Create account</Button>
      </div>
    </section>
  );
}

function HeaderSkeleton() {
  return (
    <div className="flex items-center gap-4" aria-hidden="true">
      <Skeleton variant="circle" size="xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

function MemberContent() {
  const { data: profile, isLoading, isError, error, refetch } = useMe();

  if (isLoading) return <div role="status" aria-label="Loading profile"><HeaderSkeleton /></div>;
  if (isError) return <ErrorState error={error} onRetry={() => refetch()} />;
  if (!profile) {
    return (
      <EmptyState
        icon={<UserX size={28} aria-hidden="true" />}
        title="We couldn't find your profile"
        text="Try again in a moment."
        action={{ label: 'Try again', onClick: () => refetch() }}
      />
    );
  }

  return (
    <>
      <section className="flex items-center gap-4">
        <Avatar src={profile.avatarUrl} name={profile.fullName || profile.email} size={64} />
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-heading text-xl font-bold text-ink">{profile.fullName || 'Your profile'}</h1>
          <p className="truncate font-body text-sm text-muted">{profile.email}</p>
        </div>
        <Button to="/profile/edit" variant="secondary" size="md" aria-label="Edit profile">
          <Pencil size={16} aria-hidden="true" />
          Edit
        </Button>
      </section>
      <ProfileRows title="Your activity" rows={accountRows(profile.role)} />
    </>
  );
}

/** /profile — guests get a log-in card; members get their header, activity rows and log out. */
export default function ProfilePage() {
  const status = useAuthStore((s) => s.status);

  return (
    <div className="min-h-svh bg-bg">
      <main className="flex flex-col gap-6 px-screen pt-6 pb-8">
        {status === 'loading' && <div role="status" aria-label="Loading profile"><HeaderSkeleton /></div>}
        {status === 'guest' && (
          <>
            <h1 className="font-heading text-2xl font-bold text-ink">Profile</h1>
            <GuestCard />
            <ProfileRows title="Browsing" rows={accountRows(null)} />
          </>
        )}
        {status === 'authenticated' && <MemberContent />}
        <ProfileRows title="Tibu" rows={INFO_ROWS} />
        {status === 'authenticated' && <LogoutButton />}
      </main>
    </div>
  );
}
