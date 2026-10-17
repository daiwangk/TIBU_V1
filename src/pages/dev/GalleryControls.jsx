import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import Button from '../../components/ui/Button';
import Chip from '../../components/ui/Chip';
import Badge from '../../components/ui/Badge';
import GallerySection from './GallerySection';

/** /dev/ui (D2): every Button variant and state, Chips and Badge tones. */
export default function GalleryControls() {
  const [active, setActive] = useState('cakes');
  const chips = ['cakes', 'jewellery', 'crochet', 'candles'];

  return (
    <GallerySection id="d2-controls" title="D2 · Buttons, chips, badges" description="Pill buttons; accent = white on sage-strong; danger is outlined">
      <div className="flex flex-wrap gap-3 px-screen">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="accent">
          Explore Now <ArrowRight size={18} aria-hidden="true" />
        </Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Log out</Button>
      </div>
      <div className="flex flex-wrap items-center gap-3 px-screen">
        <Button size="sm">Small</Button>
        <Button size="lg">Large</Button>
        <Button loading>Saving…</Button>
        <Button variant="accent" disabled>Disabled</Button>
      </div>
      <div className="flex flex-wrap gap-2 px-screen">
        {chips.map((c) => (
          <Chip key={c} active={active === c} onToggle={() => setActive(c)}>
            {c}
          </Chip>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 px-screen">
        <Badge tone="success">Available today</Badge>
        <Badge tone="warning">Pick-up only</Badge>
        <Badge tone="neutral">Est. 2021</Badge>
        <Badge tone="plum">Featured</Badge>
      </div>
    </GallerySection>
  );
}
