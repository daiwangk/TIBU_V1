import Blob from '../../components/decor/Blob';
import Flower from '../../components/decor/Flower';
import Leaf from '../../components/decor/Leaf';
import Spark from '../../components/decor/Spark';
import ScallopEdge from '../../components/decor/ScallopEdge';

/**
 * Hero: a full-width blush band with a scalloped bottom edge (D40, no photo).
 * Text on the left (plum h1 8.4:1, body line 7.6:1, Caveat "Support local" in plum); decor on the right,
 * aria-hidden and beside the text, never behind it.
 */
export default function HomeHero() {
  return (
    <section aria-labelledby="home-title">
      <div className="relative overflow-hidden bg-blush px-screen pt-6 pb-5">
        <div className="relative z-10 flex max-w-[62%] flex-col gap-2">
          <h1 id="home-title" className="font-heading text-2xl font-extrabold leading-tight text-primary">
            Find your next favourite, close to home.
          </h1>
          <p className="font-body text-sm text-body">
            Handmade, home-cooked and one-of-a-kind finds from local sellers.
          </p>
          <p className="font-script text-xl font-semibold leading-none text-primary">Support local</p>
        </div>

        {/* Decor cluster, right side */}
        <div aria-hidden="true" className="pointer-events-none absolute top-1/2 right-0 h-36 w-36 -translate-y-1/2 translate-x-4">
          <Blob variant={1} className="absolute inset-0 h-full w-full text-mint" />
          <Flower className="absolute top-6 left-8 h-14 w-14 text-primary" />
          <Leaf className="absolute bottom-5 left-3 h-10 w-10 text-sage" />
          <Spark className="absolute top-2 right-10 h-7 w-7 text-coral" />
        </div>
      </div>
      <ScallopEdge side="bottom" className="text-blush" />
    </section>
  );
}
