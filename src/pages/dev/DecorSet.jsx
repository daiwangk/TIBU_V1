import Spark from '../../components/decor/Spark';
import Leaf from '../../components/decor/Leaf';
import Flower from '../../components/decor/Flower';
import HeartDoodle from '../../components/decor/HeartDoodle';
import Squiggle from '../../components/decor/Squiggle';
import Blob from '../../components/decor/Blob';
import ScallopEdge from '../../components/decor/ScallopEdge';

const STROKES = [
  { name: 'Spark', node: <Spark className="h-10 w-10 text-coral" /> },
  { name: 'Leaf', node: <Leaf className="h-10 w-10 text-sage" /> },
  { name: 'Flower', node: <Flower className="h-10 w-10 text-primary" /> },
  { name: 'HeartDoodle', node: <HeartDoodle className="h-10 w-10 text-coral" /> },
  { name: 'Squiggle', node: <Squiggle className="h-4 w-14 text-coral" /> },
];

/** /dev/ui: the decor SVG set (all aria-hidden, currentColor, static). */
export default function DecorSet() {
  return (
    <div className="flex flex-col gap-5">
      <ul className="grid grid-cols-5 gap-2 px-screen">
        {STROKES.map((s) => (
          <li key={s.name} className="flex flex-col items-center gap-1">
            <span className="flex h-12 items-center">{s.node}</span>
            <span className="font-body text-[11px] text-muted">{s.name}</span>
          </li>
        ))}
      </ul>

      <ul className="grid grid-cols-3 gap-3 px-screen">
        {[1, 2, 3].map((v) => (
          <li key={v} className="flex flex-col items-center gap-1">
            <span className="relative flex h-20 w-20 items-center justify-center">
              <Blob variant={v} className="absolute inset-0 h-full w-full text-mint" />
              <Spark className="relative h-7 w-7 text-sage-strong" />
            </span>
            <span className="font-body text-[11px] text-muted">Blob {v}</span>
          </li>
        ))}
      </ul>

      <div>
        <div className="bg-blush px-screen py-4 font-body text-sm text-primary">Blush block with ScallopEdge (bottom)</div>
        <ScallopEdge side="bottom" className="text-blush" />
        <div className="h-4" />
        <ScallopEdge side="top" className="text-mint" />
        <div className="bg-mint px-screen py-4 font-body text-sm text-ink">Mint block with ScallopEdge (top)</div>
      </div>
    </div>
  );
}
