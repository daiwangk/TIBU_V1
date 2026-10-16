import { useEffect, useId, useMemo } from 'react';
import { Camera } from 'lucide-react';
import Avatar from '../../components/ui/Avatar';

/**
 * Avatar with a "Change photo" picker and a local preview. The file is uploaded on Save
 * (uploadAvatar compresses it to 400 px WebP).
 *
 * @param {{ currentUrl: string|null, name: string, file: File|null, onChange: (file: File|null) => void }} props
 */
export default function AvatarPicker({ currentUrl, name, file, onChange }) {
  const id = useId();
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  function handleChange(e) {
    const picked = e.target.files?.[0] ?? null;
    onChange(picked && picked.type.startsWith('image/') ? picked : null);
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar src={preview ?? currentUrl} name={name} size={64} />
      <div className="flex flex-col gap-1">
        <input
          id={id}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="peer sr-only"
          onChange={handleChange}
        />
        <label
          htmlFor={id}
          className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-btn border border-primary bg-surface px-4 font-body text-sm font-semibold text-primary hover:bg-lavender peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2"
        >
          <Camera size={16} aria-hidden="true" />
          {currentUrl || file ? 'Change photo' : 'Add photo'}
        </label>
        {file && <span role="status" className="font-body text-xs text-muted">New photo is saved when you tap Save.</span>}
      </div>
    </div>
  );
}
