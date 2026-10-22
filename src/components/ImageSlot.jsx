import { useEffect, useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import { fileToObjectUrl } from '../lib/image';
import PendingUpload from './PendingUpload';
import PhotoPicker from './PhotoPicker';
import ImagePlaceholder from './ui/ImagePlaceholder';

/**
 * One photo with a fixed shape (a square logo, a 16:9 banner): the saved image or a placeholder, a
 * picker to choose or replace it, and the upload's progress while one is on its way.
 *
 * @param {{
 *   label: string,
 *   hint?: string,
 *   imageUrl: string|null,
 *   alt: string,
 *   shape?: 'square' | 'video',
 *   upload: (file: File) => Promise<unknown>,
 *   error?: string,
 *   onBusyChange?: (busy: boolean) => void,
 * }} props
 */
export default function ImageSlot({ label, hint, imageUrl, alt, shape = 'square', upload, error, onBusyChange }) {
  const [picked, setPicked] = useState(null); // { file, preview } while a photo is on its way
  const pickedRef = useRef(null);
  const busy = picked !== null;

  useEffect(() => {
    pickedRef.current = picked;
  }, [picked]);
  // The preview URL is made when the photo is chosen and revoked when it is done, or with the slot.
  useEffect(() => () => {
    if (pickedRef.current?.preview) URL.revokeObjectURL(pickedRef.current.preview);
  }, []);

  function pick(file) {
    if (picked?.preview) URL.revokeObjectURL(picked.preview);
    setPicked({ file, preview: fileToObjectUrl(file) });
  }

  function clear() {
    if (picked?.preview) URL.revokeObjectURL(picked.preview);
    setPicked(null);
  }

  useEffect(() => {
    onBusyChange?.(busy);
  }, [busy, onBusyChange]);

  const frame = shape === 'video' ? 'w-full' : 'w-40';
  const aspect = shape === 'video' ? 'aspect-video' : 'aspect-square';

  return (
    <div className="flex flex-col gap-2">
      <p className="font-body text-sm font-semibold text-ink">{label}</p>
      <div className={picked ? 'w-full' : frame}>
        {picked ? (
          <PendingUpload key={picked.file.name + picked.file.size} file={picked.file} preview={picked.preview} upload={upload} onDone={clear} onDismiss={clear} />
        ) : imageUrl ? (
          <img src={imageUrl} alt={alt} className={`${aspect} w-full rounded-card border border-border object-cover`} />
        ) : (
          <ImagePlaceholder aspect={shape === 'video' ? '16/9' : '1/1'} className={`rounded-card border ${error ? 'border-error' : 'border-border'}`} iconSize={28} />
        )}
      </div>
      <div className="flex flex-col items-start gap-1">
        <PhotoPicker
          label={<><Camera size={18} aria-hidden="true" />{imageUrl ? 'Replace photo' : 'Choose photo'}</>}
          disabled={busy}
          onPick={(files) => pick(files[0])}
        />
        {error && <p role="alert" className="font-body text-sm font-semibold text-error">{error}</p>}
        {!error && hint && <p className="font-body text-xs text-muted">{hint}</p>}
      </div>
    </div>
  );
}
