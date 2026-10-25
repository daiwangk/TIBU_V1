import { toast } from 'sonner';
import BasicsStep from './onboarding/BasicsStep';
import BrandingStep from './onboarding/BrandingStep';
import ContactStep from './onboarding/ContactStep';
import LocationStep from './onboarding/LocationStep';
import SellerPage from './SellerPage';

/** One editable part of the shop: a heading and a bordered card holding its form. */
function Section({ id, title, hint, children }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-3">
      <div>
        <h2 id={id} className="font-heading text-lg font-bold text-ink">{title}</h2>
        {hint && <p className="font-body text-xs text-muted">{hint}</p>}
      </div>
      <div className="rounded-card border border-border bg-surface p-4">{children}</div>
    </section>
  );
}

/**
 * /seller/business — edit everything from onboarding on one scrolling page. Each section keeps its own
 * form and Save button (the same forms as the onboarding steps), so a change in one never waits on
 * another. Photos in Branding save as soon as they are chosen. Edits are allowed at any status (D23).
 */
export default function SellerBusinessPage() {
  const saved = () => toast.success('Saved');

  return (
    <SellerPage title="Edit business">
      {(business) => (
        <>
          <Section id="edit-basics" title="Basics">
            <BasicsStep business={business} onSaved={saved} submitLabel="Save changes" />
          </Section>
          <Section id="edit-location" title="Location and delivery">
            <LocationStep business={business} onSaved={saved} submitLabel="Save changes" />
          </Section>
          <Section id="edit-contact" title="Contact" hint="Customers only see these numbers after they log in.">
            <ContactStep business={business} onSaved={saved} submitLabel="Save changes" />
          </Section>
          <Section id="edit-branding" title="Photos" hint="Saved as soon as you choose them.">
            <BrandingStep business={business} onSaved={saved} showFooter={false} />
          </Section>
        </>
      )}
    </SellerPage>
  );
}
