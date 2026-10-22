import { BadgeCheck, CircleAlert, Clock, EyeOff } from 'lucide-react';
import Button from '../../../components/ui/Button';
import RejectionReason from './RejectionReason';

const CONTENT = {
  pending: {
    Icon: Clock,
    title: 'Under review',
    text: "Thanks for submitting your shop. Tibu checks every shop before it goes live — we'll notify you when yours is reviewed.",
  },
  rejected: {
    Icon: CircleAlert,
    title: 'Changes needed',
    text: 'Tibu reviewed your shop and asked for a few changes. Make them and submit again.',
  },
  approved: {
    Icon: BadgeCheck,
    title: 'Your shop is live',
    text: 'Customers near you can now find your shop on Tibu.',
  },
  unpublished: {
    Icon: EyeOff,
    title: 'Your shop is unpublished',
    text: "It isn't visible to customers right now. Contact Tibu if you have questions.",
  },
};

/**
 * What /seller/onboarding shows once the shop has been submitted, instead of the wizard: the status,
 * Tibu's reason when it asked for changes, and the way to edit (and resubmit).
 *
 * @param {{ business: import('../../../services/contract.js').MyBusiness, onEdit: () => void }} props
 */
export default function StatusScreen({ business, onEdit }) {
  const content = CONTENT[business.status] ?? CONTENT.pending;
  const { Icon } = content;
  const rejected = business.status === 'rejected';

  return (
    <section aria-labelledby="shop-status" className="flex flex-col gap-5">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-lavender text-primary" aria-hidden="true">
          <Icon size={28} strokeWidth={1.75} />
        </span>
        <h2 id="shop-status" className="font-heading text-2xl font-bold text-ink">{content.title}</h2>
        <p className="font-body text-sm text-body">{content.text}</p>
      </div>

      {(rejected || business.status === 'unpublished') && (
        <RejectionReason reason={business.rejectionReason} title={rejected ? 'What Tibu asked you to change' : 'Reason from Tibu'} />
      )}

      <div className="flex flex-col gap-3">
        {rejected ? (
          <Button type="button" size="lg" onClick={onEdit}>Fix and resubmit</Button>
        ) : (
          <>
            {business.status === 'approved' && <Button to={`/b/${business.slug}`} size="lg">View your shop page</Button>}
            <Button to="/seller" size="lg" variant={business.status === 'approved' ? 'secondary' : 'primary'}>Go to seller home</Button>
            <Button type="button" size="lg" variant="secondary" onClick={onEdit}>Edit details</Button>
          </>
        )}
      </div>
    </section>
  );
}
