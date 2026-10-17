import { useId, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Button from '../../components/ui/Button';
import Switch from '../../components/ui/Switch';
import { shouldToast, userMessage } from '../../lib/errors';
import { useUpdateMe, useUploadAvatar } from '../../queries/me';
import FormAlert from '../auth/FormAlert';
import TextField from '../auth/TextField';
import AvatarPicker from './AvatarPicker';
import HomeAreaField from './HomeAreaField';
import { editProfileSchema, formToPatch, profileToForm } from './profileForm';

/**
 * Edit form for a loaded profile. Save uploads a new avatar first (uploadAvatar also stores its URL),
 * then sends the rest through updateMe. Home area is saved on the profile only (A3.5 will use it as
 * the default location).
 *
 * @param {{ profile: import('../../services/contract.js').Profile }} props
 */
export default function EditProfileForm({ profile }) {
  const id = useId();
  const navigate = useNavigate();
  const updateMe = useUpdateMe();
  const uploadAvatar = useUploadAvatar();
  const [avatarFile, setAvatarFile] = useState(null);
  const [failure, setFailure] = useState(null);
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(editProfileSchema), defaultValues: profileToForm(profile) });
  const [homeLocality, homeLat, homeLng, notifyDigest, fullName] = useWatch({
    control,
    name: ['homeLocality', 'homeLat', 'homeLng', 'notifyDigest', 'fullName'],
  });

  function setHome({ locality, lat, lng }) {
    setValue('homeLocality', locality, { shouldDirty: true });
    setValue('homeLat', lat, { shouldDirty: true });
    setValue('homeLng', lng, { shouldDirty: true });
  }

  async function onValid(values) {
    setFailure(null);
    try {
      if (avatarFile) await uploadAvatar.mutateAsync(avatarFile);
      await updateMe.mutateAsync(formToPatch(values));
      toast.success('Profile saved');
      navigate('/profile');
    } catch (err) {
      // Network / unknown errors already raise the global toast; show the rest here.
      if (!shouldToast(err)) setFailure(err);
    }
  }

  return (
    <form onSubmit={handleSubmit(onValid)} noValidate className="flex flex-col gap-5">
      {failure && <FormAlert>{userMessage(failure)}</FormAlert>}

      <AvatarPicker currentUrl={profile.avatarUrl} name={fullName || profile.email} file={avatarFile} onChange={setAvatarFile} />

      <TextField
        id={`${id}-name`}
        label="Full name"
        autoComplete="name"
        error={errors.fullName?.message}
        {...register('fullName')}
      />

      <div className="flex flex-col gap-1">
        <TextField
          id={`${id}-phone`}
          label="Phone (optional)"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder="98765 43210"
          error={errors.phone?.message}
          {...register('phone')}
        />
        {!errors.phone && <p className="font-body text-xs text-muted">10-digit Indian mobile. Only you can see it.</p>}
      </div>

      <div className="flex flex-col gap-1">
        <p className="font-body text-sm font-semibold text-ink">Email</p>
        <p className="font-body text-sm text-body break-all">{profile.email}</p>
      </div>

      <HomeAreaField value={{ locality: homeLocality, lat: homeLat, lng: homeLng }} onChange={setHome} />

      <div className="flex items-center rounded-card border border-border bg-surface px-4 py-1">
        {/* The label fills the 48 px row and a pseudo-element gives the 24 px switch a 44 px hit area. */}
        <Switch
          id={`${id}-digest`}
          className="flex-1 [&_label]:flex [&_label]:min-h-12 [&_label]:items-center [&_button]:before:absolute [&_button]:before:inset-x-0 [&_button]:before:-inset-y-2.5 [&_button]:before:content-['']"
          label="Grouped updates about new businesses near me"
          checked={notifyDigest}
          onChange={(checked) => setValue('notifyDigest', checked, { shouldDirty: true })}
        />
      </div>

      <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
        Save
      </Button>
    </form>
  );
}
