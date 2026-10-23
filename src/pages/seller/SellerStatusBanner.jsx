import { BadgeCheck, CircleAlert, Clock, EyeOff } from 'lucide-react';
import Button from '../../components/ui/Button';
import RejectionReason from './onboarding/RejectionReason';

const CONTENT = {
  approved: { Icon: BadgeCheck, tone: 'bg-mint', title: 'Your shop is live', text: 'Customers near you can find it on Tibu.' },
  pending: { Icon: Clock, tone: 'bg-lime', title: 'Under review', text: "Tibu is checking your shop. We'll notify you when it's reviewed." },
  rejected: { Icon: CircleAlert, tone: 'bg-blush', title: 'Changes needed', text: 'Tibu asked for a few changes. Make them and submit again.' },
  unpublished: { Icon: EyeOff, tone: 'bg-lavender', title: 'Your shop is unpublished', text: "It isn't visible to customers right now." },
};

/**
 * The shop's status at the top of the seller home: live, under review, rejected (with the reason and a
 * way to fix and resubmit) or unpublished (with the reason).
 *
 * @param {{ business: import('../../services/contract.js').MyBusiness }} props
 */
export default function SellerStatusBanner({ business }) {
  const content = CONTENT[business.status] ?? CONTENT.pending;
  const { Icon } = content;
  const showReason = business.status === 'rejected' || business.status === 'unpublished';

  return (
    <section aria-labelledby="seller-status" className="flex flex-col gap-3">
      <div className={`flex items-start gap-3 rounded-card-lg p-4 ${content.tone}`}>
        <Icon size={24} strokeWidth={1.75} className="mt-0.5 flex-shrink-0 text-ink" aria-hidden="true" />
        <div className="flex flex-col gap-0.5">
          <h2 id="seller-status" className="font-heading text-lg font-bold text-ink">{content.title}</h2>
          <p className="font-body text-sm text-ink">{content.text}</p>
        </div>
      </div>
      {showReason && <RejectionReason reason={business.rejectionReason} title={business.status === 'rejected' ? 'What Tibu asked you to change' : 'Reason from Tibu'} />}
      {business.status === 'rejected' && <Button to="/seller/onboarding" size="lg">Fix and resubmit</Button>}
    </section>
  );
}
