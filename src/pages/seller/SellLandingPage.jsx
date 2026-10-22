import { BadgeCheck, ClipboardList, IndianRupee, MapPin, MessageCircle, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Button from '../../components/ui/Button';
import ErrorState from '../../components/ui/ErrorState';
import PageHeader from '../../components/ui/PageHeader';
import Skeleton from '../../components/ui/Skeleton';
import { useMe } from '../../queries/me';
import { useBecomeSeller } from '../../queries/seller';
import { useAuthStore } from '../../stores/auth';
import { authErrorMessage, withNext } from '../auth/authHelpers';

const ONBOARDING = '/seller/onboarding';

const BENEFITS = [
  { Icon: MapPin, title: 'Be found nearby', text: 'Customers in your area discover you on Home and Search.' },
  { Icon: MessageCircle, title: 'Enquiries on WhatsApp', text: 'Buyers call, chat or message you directly.' },
  { Icon: IndianRupee, title: 'Free to list', text: 'Put your shop and products on Tibu at no cost.' },
];

const STEPS = [
  { Icon: UserPlus, title: 'Create your account', text: 'Sign up with your email.' },
  { Icon: ClipboardList, title: 'Set up your shop', text: 'Add your details, photos and products.' },
  { Icon: BadgeCheck, title: 'Get approved', text: 'We review every shop before it goes live.' },
];

function CtaSkeleton() {
  return (
    <div role="status" aria-label="Loading">
      <Skeleton className="h-[52px] w-full rounded-full" />
    </div>
  );
}

/** The call to action changes with who is looking: guest, customer, seller (or admin). */
function SellCta() {
  const navigate = useNavigate();
  const authStatus = useAuthStore((s) => s.status);
  const { data: profile, isLoading, isError, error, refetch } = useMe();
  const becomeSeller = useBecomeSeller();

  if (authStatus === 'loading') return <CtaSkeleton />;
  if (authStatus === 'guest') {
    return (
      <Button to={withNext('/signup', ONBOARDING, { as: 'seller' })} size="lg" className="w-full">
        Create seller account
      </Button>
    );
  }
  if (isLoading) return <CtaSkeleton />;
  if (isError) return <ErrorState error={error} onRetry={() => refetch()} className="py-4" />;
  if (!profile) return <CtaSkeleton />;

  if (profile.role === 'seller') {
    return <Button to="/seller" size="lg" className="w-full">Go to your seller area</Button>;
  }
  if (profile.role === 'admin') {
    return <Button to="/admin" size="lg" className="w-full">Open the admin panel</Button>;
  }

  function handleStart() {
    becomeSeller.mutate(undefined, {
      onSuccess: () => navigate(ONBOARDING),
      onError: (err) => toast.error(authErrorMessage(err)),
    });
  }

  return (
    <Button size="lg" className="w-full" loading={becomeSeller.isPending} onClick={handleStart}>
      Start selling
    </Button>
  );
}

/** /sell — public pitch for sellers, with the sign-up / become-a-seller call to action. */
export default function SellLandingPage() {
  return (
    <div className="min-h-svh bg-bg">
      <PageHeader title="Sell on Tibu" titleAs="p" fallbackTo="/profile" />
      <main className="flex flex-col gap-8 px-screen pt-6 pb-10">
        <section className="rounded-card-lg bg-blush p-5">
          <h1 className="font-heading text-2xl font-bold text-ink">Sell your homegrown business on Tibu</h1>
          <p className="mt-2 font-body text-sm text-body">
            Reach customers near you, get enquiries on WhatsApp, and list your shop for free.
          </p>
          <div className="mt-5">
            <SellCta />
          </div>
        </section>

        <section aria-labelledby="sell-why">
          <h2 id="sell-why" className="font-heading text-lg font-bold text-ink">Why Tibu</h2>
          <ul className="mt-3 flex flex-col gap-3">
            {BENEFITS.map(({ Icon, title, text }) => (
              <li key={title} className="flex items-start gap-3 rounded-card border border-border bg-surface p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mint text-primary" aria-hidden="true">
                  <Icon size={20} />
                </span>
                <div>
                  <h3 className="font-body text-sm font-semibold text-ink">{title}</h3>
                  <p className="font-body text-sm text-body">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="sell-steps">
          <h2 id="sell-steps" className="font-heading text-lg font-bold text-ink">How it works</h2>
          <ol className="mt-3 flex flex-col gap-3">
            {STEPS.map(({ Icon, title, text }, index) => (
              <li key={title} className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary font-body text-sm font-bold text-primary-fg">
                  {index + 1}
                </span>
                <div>
                  <h3 className="flex items-center gap-2 font-body text-sm font-semibold text-ink">
                    <Icon size={16} className="text-primary" aria-hidden="true" />
                    {title}
                  </h3>
                  <p className="font-body text-sm text-body">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </main>
    </div>
  );
}
