import { useId, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Switch from '../../../components/ui/Switch';
import { shouldToast, userMessage } from '../../../lib/errors';
import { useSaveMyBusiness } from '../../../queries/seller';
import FormAlert from '../../auth/FormAlert';
import TextField from '../../auth/TextField';
import { SWITCH_ROW } from '../switchRow';
import DeliveryTimeField from './DeliveryTimeField';
import LocationField from './LocationField';
import { businessToInput } from './onboardingModel';
import { locationSchema } from './onboardingSchemas';
import StepFooter from './StepFooter';

/**
 * Step 2: where the shop is (current location or an area), address line, city and delivery / pick-up.
 * Next saves the lot onto the draft business.
 *
 * @param {{ business: import('../../../services/contract.js').MyBusiness|null, onBack?: () => void, onSaved: () => void, submitLabel?: string }} props
 */
export default function LocationStep({ business, onBack, onSaved, submitLabel = 'Next' }) {
  const id = useId();
  const saveBusiness = useSaveMyBusiness();
  const [failure, setFailure] = useState(null);
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      locality: business?.locality ?? '',
      lat: business?.lat ?? null,
      lng: business?.lng ?? null,
      addressText: business?.addressText ?? '',
      city: business?.city || 'Mumbai',
      deliveryAvailable: Boolean(business?.deliveryAvailable),
      pickupAvailable: Boolean(business?.pickupAvailable),
      deliveryTime: business?.deliveryTime ?? '',
    },
  });
  const [locality, lat, lng, deliveryAvailable, pickupAvailable, deliveryTime] = useWatch({
    control,
    name: ['locality', 'lat', 'lng', 'deliveryAvailable', 'pickupAvailable', 'deliveryTime'],
  });

  function setPlace(next) {
    for (const key of ['locality', 'lat', 'lng']) setValue(key, next[key], { shouldDirty: true, shouldValidate: true });
  }

  async function onValid(values) {
    setFailure(null);
    try {
      await saveBusiness.mutateAsync({
        ...businessToInput(business),
        locality: values.locality,
        lat: values.lat,
        lng: values.lng,
        addressText: values.addressText,
        city: values.city,
        deliveryAvailable: values.deliveryAvailable,
        pickupAvailable: values.pickupAvailable,
        deliveryTime: values.deliveryAvailable && values.deliveryTime !== '' ? values.deliveryTime : null,
      });
      onSaved();
    } catch (err) {
      // Network / unknown errors already raise the global toast; show the rest here.
      if (!shouldToast(err)) setFailure(err);
    }
  }

  return (
    <form onSubmit={handleSubmit(onValid)} noValidate className="flex flex-col gap-5">
      {failure && <FormAlert>{userMessage(failure)}</FormAlert>}

      <div className="flex flex-col gap-2">
        <LocationField value={{ locality, lat, lng }} onChange={setPlace} error={errors.locality?.message ?? errors.lat?.message ?? errors.lng?.message} />
        <p className="font-body text-xs text-muted">
          Customers see your area and an approximate distance, not your exact location. The address line is optional
          and shown publicly — leave it blank if you work from home.
        </p>
      </div>

      <TextField
        id={`${id}-address`}
        label="Address (optional)"
        autoComplete="street-address"
        maxLength={300}
        error={errors.addressText?.message}
        {...register('addressText')}
      />

      <TextField id={`${id}-city`} label="City" autoComplete="address-level2" maxLength={60} error={errors.city?.message} {...register('city')} />

      <div className="flex flex-col rounded-card border border-border bg-surface px-4 py-1">
        <Switch
          id={`${id}-delivery`}
          className={SWITCH_ROW}
          label="I deliver"
          checked={deliveryAvailable}
          onChange={(checked) => setValue('deliveryAvailable', checked, { shouldDirty: true })}
        />
        <Switch
          id={`${id}-pickup`}
          className={SWITCH_ROW}
          label="Customers can pick up"
          checked={pickupAvailable}
          onChange={(checked) => setValue('pickupAvailable', checked, { shouldDirty: true })}
        />
      </div>

      {deliveryAvailable && (
        <DeliveryTimeField
          id={`${id}-time`}
          value={deliveryTime}
          onChange={(next) => setValue('deliveryTime', next, { shouldDirty: true, shouldValidate: true })}
        />
      )}

      <StepFooter onBack={onBack} loading={isSubmitting} nextLabel={submitLabel} />
    </form>
  );
}
