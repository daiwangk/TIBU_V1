import { useId, useImperativeHandle, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import ConfirmDialog from '../../components/ConfirmDialog';
import ReelEmbed from '../../components/ReelEmbed';
import Button from '../../components/ui/Button';
import { shouldToast, userMessage } from '../../lib/errors';
import { parseInstagramShortcode } from '../../lib/instagram';
import { useAddVideo, useRemoveVideo } from '../../queries/seller';
import FormAlert from '../auth/FormAlert';
import TextField from '../auth/TextField';
import { videoSchema } from './onboarding/onboardingSchemas';

/**
 * Add, preview and remove the shop's Instagram reels (onboarding step 6 and /seller/videos). Each reel
 * is saved as soon as it is added. A parent can ask, through `ref`, whether a new link was typed but not
 * added yet (`hasUnaddedLink`) and have it flagged under the field (`flagUnaddedLink`).
 *
 * @param {{
 *   videos: import('../../services/contract.js').Video[],
 *   ref?: import('react').Ref<{ hasUnaddedLink: () => boolean, flagUnaddedLink: () => void }>,
 * }} props
 */
export default function VideosManager({ videos, ref }) {
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
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(videoSchema), defaultValues: { instagramUrl: '', caption: '' } });

  // A new reel link typed but not added would be lost silently (a duplicate or a non-reel can't be added anyway).
  const unadded = () => {
    const typed = parseInstagramShortcode(getValues('instagramUrl'));
    return Boolean(typed) && !videos.some((v) => v.shortcode === typed);
  };
  useImperativeHandle(ref, () => ({
    hasUnaddedLink: unadded,
    flagUnaddedLink: () => setError('instagramUrl', { message: 'Tap "Add video" to keep this link, or clear it' }),
  }));

  async function onAdd(values) {
    setFailure(null);
    const shortcode = parseInstagramShortcode(values.instagramUrl);
    if (videos.some((v) => v.shortcode === shortcode)) {
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
      // Network / forbidden / unknown errors already raise the global toast.
      if (!shouldToast(err)) toast.error(userMessage(err));
    } finally {
      setRemoving(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
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

      {videos.length === 0 ? (
        <p className="font-body text-sm text-muted">No videos added yet.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {videos.map((video, i) => (
            <li key={video.id} className="flex flex-col gap-2">
              <ReelEmbed video={video} />
              <Button type="button" variant="danger" onClick={() => setRemoving(video)} aria-label={`Remove video ${i + 1}`}>
                Remove video
              </Button>
            </li>
          ))}
        </ul>
      )}

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
