import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchField from '../../components/SearchField';

/**
 * Home search pill, under the header and above the hero.
 *
 * - Tap/click on the field while it is empty → `/search` (the full search screen).
 * - Enter / keyboard "search" key → `/search?q=<text>` (or `/search` when blank).
 * Keyboard focus alone never navigates (WCAG 3.2.1 On Focus).
 */
export default function HomeSearch() {
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
    <form role="search" onSubmit={handleSubmit} className="px-screen">
      <label htmlFor="home-search" className="sr-only">
        Search products and businesses
      </label>
      <SearchField
        id="home-search"
        enterKeyHint="search"
        autoComplete="off"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onClick={handleClick}
        placeholder="Search cakes, crochet, candles…"
      />
    </form>
  );
}
