import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import SearchField from '../../components/SearchField';
import GallerySection from './GallerySection';

/** /dev/ui (D2): fields in normal / error / disabled states and the SearchField pill. */
export default function GalleryFields() {
  const [q, setQ] = useState('brownies');

  return (
    <GallerySection id="d2-fields" title="D2 · Fields" description="16px text, sage border (3.5:1), error border + text">
      <div className="flex flex-col gap-4 px-screen">
        <SearchField label="Search products and businesses" placeholder="Search cakes, crochet, candles…" value="" onChange={() => {}} />
        <SearchField
          label="Search products and businesses"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onClear={() => setQ('')}
          trailing={
            <button
              type="button"
              aria-label="Open filters"
              className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-ink hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <SlidersHorizontal size={20} strokeWidth={1.75} aria-hidden="true" />
            </button>
          }
        />
        <Input id="d2-name" label="Your name" placeholder="Asha Rao" hint="Shown to sellers when you message them." />
        <Input id="d2-phone" label="Phone" defaultValue="98765" error="Enter a 10-digit mobile number." />
        <Input id="d2-disabled" label="Email" defaultValue="asha@example.com" disabled />
        <Select id="d2-area" label="Area" error="Choose your area." defaultValue="">
          <option value="" disabled>Choose…</option>
          <option value="bandra">Bandra West</option>
        </Select>
        <Textarea id="d2-note" label="Message" rows={3} placeholder="Hi! Is this available this weekend?" />
      </div>
    </GallerySection>
  );
}
