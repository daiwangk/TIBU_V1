import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { fileToObjectUrl } from '../lib/image';
import { userMessage } from '../lib/errors';
import PendingUpload from './PendingUpload';
import PhotoPicker from './PhotoPicker';
import IconButton from './ui/IconButton';

/**
 * A grid of saved photos (each with a Remove button) plus the ones still uploading, and an "Add photos"
 * button until `max` is reached. Uploads run one at a time. `onBusyChange(true)` while any is in flight.
 *
 * @param {{
 *   images: Array<{ id: string, url: string }>,
 *   max: number,
 *   upload: (file: File) => Promise<unknown>,
 *   remove: (imageId: string) => Promise<unknown>,
 *   noun?: string,
 *   disabled?: boolean,
 *   onBusyChange?: (busy: boolean) => void,
 * }} props
 */
export default function PhotoGrid({ images, max, upload, remove, noun = 'photo', disabled = false, onBusyChange }) {
  const [pending, setPending] = useState([]);
  const [removingId, setRemovingId] = useState(null);
  const nextKey = useRef(0);
  const pendingRef = useRef([]);

  useEffect(() => {
    pendingRef.current = pending;
  }, [pending]);
  // Preview URLs are made when files are chosen and revoked when their row goes, or with the grid.
  useEffect(() => () => pendingRef.current.forEach((p) => p.preview && URL.revokeObjectURL(p.preview)), []);

  const busy = pending.length > 0;
  useEffect(() => {
    onBusyChange?.(busy);
  }, [busy, onBusyChange]);

  const room = max - images.length - pending.length;

  function handlePick(files) {
    const taken = files.slice(0, Math.max(room, 0));
    if (taken.length < files.length) toast.error(`You can add up to ${max} ${noun}s`);
    setPending((list) => [...list, ...taken.map((file) => ({ key: nextKey.current++, file, preview: fileToObjectUrl(file) }))]);
  }

  async function handleRemove(id) {
    setRemovingId(id);
    try {
      await remove(id);
    } catch (err) {
      toast.error(userMessage(err));
    } finally {
      setRemovingId(null);
    }
  }

  function drop(key) {
    const gone = pending.find((p) => p.key === key);
    if (gone?.preview) URL.revokeObjectURL(gone.preview);
    setPending((list) => list.filter((p) => p.key !== key));
  }

  return (
    <div className="flex flex-col gap-3">
      {images.length > 0 && (
        <ul className="grid grid-cols-3 gap-2">
          {images.map((image, i) => (
            <li key={image.id} className="relative aspect-square overflow-hidden rounded-card bg-lavender">
              <img src={image.url} alt={`${noun[0].toUpperCase()}${noun.slice(1)} ${i + 1}`} className="h-full w-full object-cover" />
              <IconButton
                label={`Remove ${noun} ${i + 1}`}
                disabled={removingId === image.id}
                onClick={() => handleRemove(image.id)}
                className="absolute right-0.5 top-0.5 bg-surface/90"
              >
                <X size={18} aria-hidden="true" />
              </IconButton>
            </li>
          ))}
        </ul>
      )}
      {pending.length > 0 && (
        <ul className="flex flex-col gap-2">
          {pending.map((p, i) => (
            <li key={p.key}>
              <PendingUpload file={p.file} preview={p.preview} upload={upload} active={i === 0} onDone={() => drop(p.key)} onDismiss={() => drop(p.key)} />
            </li>
          ))}
        </ul>
      )}
      <div className="flex items-center gap-3">
        <PhotoPicker label={`Add ${noun}s`} multiple disabled={disabled || room <= 0} onPick={handlePick} />
        <p className="font-body text-sm text-muted">{images.length} of {max}</p>
      </div>
    </div>
  );
}
