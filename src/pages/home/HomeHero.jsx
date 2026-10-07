import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
// The hero picture. Today it is the Tibu logo; when the client sends her photo, overwrite
// src/assets/home-hero.png (and switch `object-contain` to `object-cover` below for a full-bleed photo).
import heroImage from '../../assets/home-hero.png';

/**
 * Hero: a picture (the Tibu logo for now) on a lavender surface, with the search field under it.
 *
 * - Tap/click on the field while it is empty → `/search` (the full search screen).
 * - Enter / keyboard "search" key → `/search?q=<text>` (or `/search` when blank).
 * Keyboard focus alone never navigates (WCAG 3.2.1 On Focus).
 */
export default function HomeHero() {
  const navigate = useNavigate();
  const [text, setText] = useState('');

  /** @param {React.FormEvent<HTMLFormElement>} e */
  function handleSubmit(e) {
    e.preventDefault();
    const q = text.trim();
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
  }

  function handleClick() {
    if (!text.trim()) navigate('/search');
  }

  return (
    <section aria-labelledby="home-hero-title" className="px-screen">
      <div className="flex flex-col gap-4 rounded-card-lg bg-lavender p-4">
        {/* The visible heading was replaced by the picture; the h1 stays for screen readers and search engines. */}
        <h1 id="home-hero-title" className="sr-only">
          Discover homegrown businesses near you
        </h1>
        <div className="flex aspect-[16/9] w-full items-center justify-center overflow-hidden rounded-card bg-surface">
          <img
            src={heroImage}
            alt="Tibu"
            width={1256}
            height={1256}
            className="h-full w-full object-contain"
          />
        </div>
        <p className="text-center font-body text-sm text-body">
          Handmade, home-cooked and one-of-a-kind finds from local sellers.
        </p>

        <form role="search" onSubmit={handleSubmit} className="relative">
          <label htmlFor="home-search" className="sr-only">
            Search products and businesses
          </label>
          <Search
            size={20}
            strokeWidth={1.75}
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            id="home-search"
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onClick={handleClick}
            placeholder="Search cakes, crochet, candles…"
            className="w-full min-h-12 rounded-btn border border-border bg-surface pl-12 pr-4 font-body text-sm text-ink placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary motion-safe:transition-shadow motion-safe:duration-150"
          />
        </form>
      </div>
    </section>
  );
}
