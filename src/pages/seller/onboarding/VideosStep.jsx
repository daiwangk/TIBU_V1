import { useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import ConfirmDialog from '../../../components/ConfirmDialog';
import ReelEmbed from '../../../components/ReelEmbed';
import Button from '../../../components/ui/Button';
import { shouldToast, userMessage } from '../../../lib/errors';
import { parseInstagramShortcode } from '../../../lib/instagram';
import { useAddVideo, useRemoveVideo } from '../../../queries/seller';
import FormAlert from '../../auth/FormAlert';
import TextField from '../../auth/TextField';
import { videoSchema } from './onboardingSchemas';
import StepFooter from './StepFooter';

/**
 * Step 6 (optional): links to public Instagram reels, each saved as soon as it is added and shown with
 * its embed. Next just moves on.
 *
 * @param {{ business: import('../../../services/contract.js').MyBusiness, onBack?: () => void, onSaved: () => void }} props
 */
export default function VideosStep({ business, onBack, onSaved }) {
  const id = useId();
  const addVideo = useAddVideo();
  const removeVideo = useRemoveVideo();
  const [failure, setFailure] = useState(null);
  const [removing, setRemoving] = useState(null);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(videoSchema), defaultValues: { instagramUrl: '', caption: '' } });

  async function onAdd(values) {
    setFailure(null);
    const shortcode = parseInstagramShortcode(values.instagramUrl);
    if (business.videos.some((v) => v.shortcode === shortcode)) {
      setError('instagramUrl', { message: "You've already added this reel" });
      return;
    }
    try {
      await addVideo.mutateAsync({ instagramUrl: values.instagramUrl, caption: values.caption });
      reset();
    } catch (err) {
      // Network / unknown errors already raise the global toast; show the rest here.
      if (!shouldToast(err)) setFailure(err);
    }
  }

  async function confirmRemove() {
    try {
      await removeVideo.mutateAsync(removing.id);
    } catch (err) {
      toast.error(userMessage(err));
    } finally {
      setRemoving(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="font-body text-sm text-body">
        Optional. Add links to public Instagram reels that show your work — they appear on your shop page.
      </p>

      <form onSubmit={handleSubmit(onAdd)} noValidate className="flex flex-col gap-4 rounded-card border border-border bg-surface p-4">
        {failure && <FormAlert>{userMessage(failure)}</FormAlert>}
        <TextField
          id={`${id}-url`}
          label="Instagram reel link"
          inputMode="url"
          autoCapitalize="none"
          autoCorrect="off"
          placeholder="https://www.instagram.com/reel/…"
          error={errors.instagramUrl?.message}
          {...register('instagramUrl')}
        />
        <TextField id={`${id}-caption`} label="Caption (optional)" maxLength={200} error={errors.caption?.message} {...register('caption')} />
        <Button type="submit" variant="secondary" className="self-start" loading={isSubmitting}>
          <Plus size={18} aria-hidden="true" />
          Add video
        </Button>
      </form>

      {business.videos.length === 0 ? (
        <p className="font-body text-sm text-muted">No videos added yet.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {business.videos.map((video, i) => (
            <li key={video.id} className="flex flex-col gap-2">
              <ReelEmbed video={video} />
              <Button type="button" variant="danger" onClick={() => setRemoving(video)} aria-label={`Remove video ${i + 1}`}>
                Remove video
              </Button>
            </li>
          ))}
        </ul>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSaved();
        }}
        noValidate
      >
        <StepFooter onBack={onBack} />
      </form>

      <ConfirmDialog
        open={removing !== null}
        title="Remove this video?"
        text="It will no longer show on your shop page."
        confirmLabel="Remove"
        loading={removeVideo.isPending}
        onConfirm={confirmRemove}
        onCancel={() => setRemoving(null)}
      />
    </div>
  );
}
