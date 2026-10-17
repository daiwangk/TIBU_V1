---
trigger: glob
globs: src/**/*.jsx, src/**/*.css
description: Tibu visual design system — colours, type, components. Apply when writing or editing UI.
---

# Tibu design system

Values and reasons: `docs/DECISIONS.md` D40 (17 Oct 2026). Tokens live in `src/styles/theme.css`; never hard-code hex in components.

- Background: warm cream `bg-bg` (#F6F1EB) for the page and the app column. Cards and sheets `bg-surface` (#FFFDF9, warm white), radius 16–24px (`rounded-card`, `rounded-card-lg`), hairline `border-border` (#E8E0D6) or a very soft shadow. No harsh shadows.
- Primary: plum `bg-primary` (#71244F) for the logo, headings, active nav, icons, links and the primary button.
- Buttons (`ui/Button`) are pills (`rounded-full`): `primary` solid plum + white; `secondary` surface + 1px plum border + plum text; `accent` solid `sage-strong` + white (e.g. "Explore Now →"); `ghost`; `danger` outlined (surface, `error` border and text). Use the `Button` component, not hand-rolled buttons.
- Chips (`ui/Chip`): inactive `bg-mint` + `text-ink`, active `bg-primary` + white. Badges: success = mint/ink, warning = peach (`lime`)/ink, neutral = lavender/ink.
- Fields (`ui/Input`, `Select`, `Textarea`, auth `TextField`/`PasswordField`, `SearchField`): 16px text (`text-base`, so iOS doesn't zoom), `border-sage` (3.5:1 on surface), `border-error` + `text-error` message on error. `Select` has a chevron; `compact` makes it a chip-height pill for filter rows. Search inputs use `SearchField` (pill; pages keep the logic).
- Cards (`ProductCard`, `BusinessCard`): `rounded-card` (16px), `border-border`, `bg-surface`. Names stay `text-ink` (semibold); the price (`Price`, plum Nunito 800) is the strongest element. "Available today" pill on the image bottom-left; the save heart (white circle) owns the top-right.
- Section headers (`SectionHeader`): plum title, optional icon and subtitle, "See all ›". Page headers (`ui/PageHeader`): cream with blur, plum title.
- Empty / error states: icon on a soft-sage `Blob` with a coral `Spark` (EmptyState, optional `illustration`, `action.to`, `actionVariant`); error icon in `text-error` on a blush blob. Toasts are warm white with ink text; the icon carries the type (styled in `src/index.css`, no `richColors`).
- Category circles: 72px, blush / peach / mint (not lavender next to blush — they read the same).
- Pastel surfaces (names kept, meanings changed in D40): blush #F2E6EA (`bg-blush`, pale pink hero tint), mint #DCDED3 (`bg-mint`, **soft sage**: chips, strips, "Available today"), lime #F6E4D8 (`bg-lime`, **soft peach** accent), lavender #F1E7EE (`bg-lavender`, **mauve tint**: hovers, info banners).
- Sage: `sage` #748E83 for decor fills and field borders (3.15:1), **never behind text**. `sage-strong` #566E63 for the accent button fill (white text, 5.5:1) and sage-coloured text on `bg`/`surface`.
- Coral `coral` #E5735F: decor strokes and the rating star only, **never text**.
- Error `error` #B3261E: field and form errors (text, border, icon). Don't use `text-primary` for errors.
- Text: strong text and names `text-ink` (#3A1631), body `text-body` (#4A4556), captions `text-muted` (#6B6574). Headings may be `text-primary` or `text-ink`.
- **Banned text pairs** (below 4.5:1): white on `sage`, `text-muted` on `mint`, `text-sage-strong` on `mint`, `text-sage-strong` on `lime`. Text on mint chips is `ink`, `body` or `primary`.
- Info banner: lavender background, solid plum circle with a white "i", dismiss X.
- Success pill: `bg-mint` with `text-ink` ("In stock", "Available today").
- Fonts (self-hosted via Fontsource, imported in `src/index.css`): Nunito 800 for headings (`font-heading`), Nunito 900 for the wordmark, Nunito Sans 400/600/700 for body (`font-body`), Caveat 600 for taglines only (`font-script`). Never Arial. Don't add a weight without importing it.
- Prices: `formatPrice()` → ₹1,250 (en-IN grouping), rendered with `Price` (plum, Nunito 800). Large on the product page.
- Icons: lucide-react, stroke ~1.75, line style, often inside a pastel circle. Category shortcuts map slug → lucide icon in `src/lib/categoryIcons.js` (pastel circles until the client sends photos, `TODO(category-photos)`).
- Save is always a **heart** (nav and cards). A bookmark appears only inside the Saved empty-state illustration.
- Decor: `src/components/decor/` (Spark, Leaf, Flower, HeartDoodle, Squiggle, Blob, ScallopEdge, BookmarkHeart — the Saved empty-state illustration). Inline SVG, `aria-hidden`, `currentColor`, no animation. Sparingly: hero and modal corners, empty states, behind icons. Never behind text, never copied from reference artwork. No hero photo.
- 4px spacing grid, 16–20px screen padding (`px-screen`), generous whitespace.
- Touch targets ≥ 44px, visible focus rings, `aria-label` on icon buttons, respect `prefers-reduced-motion`.
- Layout: mobile-first. Above 640px render inside the centred max-w-[480px] cream column (AppShell) on a `bg-mint` gutter. Never stretch the phone UI full width.
- Logo: always `src/components/brand/Logo.jsx`. It renders the placeholder `Wordmark` ("TIBU", optional tagline) until the client's final logo arrives (`TODO(logo)`).
- References: `design/references/client-2026-10-17/` (mood only; they win over the mockups where they differ). Mockups: `design/mockups/` — welcome-modal, product-page, chat-compose, chat-sent, chat-empty.
