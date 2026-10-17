// Values mirror src/styles/theme.css (D40). Class names are literal so Tailwind keeps them.
const SWATCHES = [
  { name: 'bg', cls: 'bg-bg', hex: '#f6f1eb', note: 'page, app column' },
  { name: 'surface', cls: 'bg-surface', hex: '#fffdf9', note: 'cards, sheets' },
  { name: 'primary', cls: 'bg-primary', hex: '#71244f', note: 'plum' },
  { name: 'ink', cls: 'bg-ink', hex: '#3a1631', note: 'strong text' },
  { name: 'body', cls: 'bg-body', hex: '#4a4556', note: 'body text' },
  { name: 'muted', cls: 'bg-muted', hex: '#6b6574', note: 'captions' },
  { name: 'border', cls: 'bg-border', hex: '#e8e0d6', note: 'hairlines' },
  { name: 'blush', cls: 'bg-blush', hex: '#f2e6ea', note: 'pink tint' },
  { name: 'mint', cls: 'bg-mint', hex: '#dcded3', note: 'soft sage' },
  { name: 'lime', cls: 'bg-lime', hex: '#f6e4d8', note: 'soft peach' },
  { name: 'lavender', cls: 'bg-lavender', hex: '#f1e7ee', note: 'mauve tint' },
  { name: 'sage', cls: 'bg-sage', hex: '#748e83', note: 'decor, field borders' },
  { name: 'sage-strong', cls: 'bg-sage-strong', hex: '#566e63', note: 'accent fill' },
  { name: 'error', cls: 'bg-error', hex: '#b3261e', note: 'errors' },
  { name: 'coral', cls: 'bg-coral', hex: '#e5735f', note: 'decor, star' },
];

// Approved text/background pairs (all ≥ 4.5:1). Banned: white on sage, muted on mint, sage-strong on mint.
const PAIRS = [
  { bg: 'bg-bg', text: 'text-primary', label: 'primary on bg' },
  { bg: 'bg-bg', text: 'text-muted', label: 'muted on bg' },
  { bg: 'bg-bg', text: 'text-sage-strong', label: 'sage-strong on bg' },
  { bg: 'bg-mint', text: 'text-ink', label: 'ink on mint' },
  { bg: 'bg-blush', text: 'text-primary', label: 'primary on blush' },
  { bg: 'bg-lime', text: 'text-primary', label: 'primary on lime' },
  { bg: 'bg-lavender', text: 'text-primary', label: 'primary on lavender' },
  { bg: 'bg-sage-strong', text: 'text-primary-fg', label: 'white on sage-strong' },
];

/** /dev/ui: every colour token as a swatch, plus the approved text/background pairs. */
export default function TokenSwatches() {
  return (
    <div className="flex flex-col gap-4 px-screen">
      <ul className="grid grid-cols-3 gap-3">
        {SWATCHES.map((s) => (
          <li key={s.name} className="flex flex-col gap-1">
            <span className={`h-12 rounded-btn border border-border ${s.cls}`} />
            <span className="font-body text-xs font-semibold text-ink">{s.name}</span>
            <span className="font-body text-[11px] leading-tight text-muted">
              {s.hex} · {s.note}
            </span>
          </li>
        ))}
      </ul>
      <ul className="flex flex-wrap gap-2">
        {PAIRS.map((p) => (
          <li key={p.label} className={`rounded-full px-3 py-1.5 font-body text-sm font-semibold ${p.bg} ${p.text}`}>
            {p.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
