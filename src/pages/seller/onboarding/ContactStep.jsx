import { useId, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { shouldToast, userMessage } from '../../../lib/errors';
import { normalizeInstagramHandle } from '../../../lib/instagram';
import { useSaveMyBusiness, useSaveMyContacts } from '../../../queries/seller';
import FormAlert from '../../auth/FormAlert';
import TextField from '../../auth/TextField';
import { businessToInput } from './onboardingModel';
import { contactSchema, toTenDigitMobile } from './onboardingSchemas';
import StepFooter from './StepFooter';

/**
 * Step 3: phone, WhatsApp ("same as phone" by default) and the Instagram handle Tibu uses to verify the
 * business. The numbers are only ever shown to logged-in customers, through revealContact().
 *
 * @param {{ business: import('../../../services/contract.js').MyBusiness|null, onBack?: () => void, onSaved: () => void, submitLabel?: string }} props
 */
export default function ContactStep({ business, onBack, onSaved, submitLabel = 'Next' }) {
  const id = useId();
  const saveBusiness = useSaveMyBusiness();
  const saveContacts = useSaveMyContacts();
  const [failure, setFailure] = useState(null);
  const contacts = business?.contacts;
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      phone: contacts?.phone ?? '',
      sameAsPhone: !contacts || contacts.phone === contacts.whatsapp,
      whatsapp: contacts?.whatsapp ?? '',
      instagramHandle: business?.instagramHandle ?? '',
    },
  });
  const sameAsPhone = useWatch({ control, name: 'sameAsPhone' });

  async function onValid(values) {
    setFailure(null);
    try {
      const phone = toTenDigitMobile(values.phone);
      const whatsapp = values.sameAsPhone ? phone : toTenDigitMobile(values.whatsapp);
      await saveBusiness.mutateAsync({
        ...businessToInput(business),
        instagramHandle: normalizeInstagramHandle(values.instagramHandle),
      });
      await saveContacts.mutateAsync({ phone, whatsapp });
      onSaved();
    } catch (err) {
      // Network / unknown errors already raise the global toast; show the rest here.
      if (!shouldToast(err)) setFailure(err);
    }
  }

  return (
    <form onSubmit={handleSubmit(onValid)} noValidate className="flex flex-col gap-5">
      {failure && <FormAlert>{userMessage(failure)}</FormAlert>}

      <div className="flex flex-col gap-1">
        <TextField
          id={`${id}-phone`}
          label="Phone number"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder="98765 43210"
          error={errors.phone?.message}
          {...register('phone')}
        />
        {!errors.phone && (
          <p className="font-body text-xs text-muted">10-digit Indian mobile. Customers only see it after they log in.</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor={`${id}-same`} className="flex min-h-11 cursor-pointer items-center gap-3 font-body text-sm text-ink">
          <input id={`${id}-same`} type="checkbox" className="h-5 w-5 accent-primary" {...register('sameAsPhone')} />
          WhatsApp number is the same as my phone
        </label>
        {!sameAsPhone && (
          <TextField
            id={`${id}-whatsapp`}
            label="WhatsApp number"
            type="tel"
            inputMode="tel"
            autoComplete="off"
            placeholder="98765 43210"
            error={errors.whatsapp?.message}
            {...register('whatsapp')}
          />
        )}
      </div>

      <div className="flex flex-col gap-1">
        <TextField
          id={`${id}-instagram`}
          label="Instagram handle"
          autoCapitalize="none"
          autoCorrect="off"
          placeholder="tibu.shop"
          error={errors.instagramHandle?.message}
          {...register('instagramHandle')}
        />
        {!errors.instagramHandle && (
          <p className="font-body text-xs text-muted">Tibu uses this to check your business is real. You can paste your profile link too.</p>
        )}
      </div>

      <StepFooter onBack={onBack} loading={isSubmitting} nextLabel={submitLabel} />
    </form>
  );
}
