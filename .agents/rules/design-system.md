---
trigger: glob
globs: src/**/*.jsx, src/**/*.css
description: Tibu visual design system — colours, type, components. Apply when writing or editing UI.
---

# Tibu design system

- Background: warm cream `bg-bg` (#FAF7F2). Cards `bg-surface`, radius 16–24px (`rounded-card`, `rounded-card-lg`), hairline `border-border` or a very soft shadow. No harsh shadows.
- Primary: deep plum `bg-primary` (#5A1848) for buttons, logo, active states, links. Primary button = solid plum + white text, pill or 12px radius (`rounded-btn`). Secondary = white background, 1px plum border, plum text.
- Pastel surfaces: lime #EEF3D6 (`bg-lime`), blush #FBE6EA (`bg-blush`), lavender #EFE4F7 (`bg-lavender`), mint #DDF1EE (`bg-mint`). Sample exact hex from the mockups if these look off.
- Info banner: lavender background, solid plum circle with a white "i", dismiss X.
- Text: headings `text-ink` (#2A0F2A), body `text-body` (#4A4556), muted `text-muted` (#8A8494).
- Success pill: light green background, green text ("In stock", "Available today").
- Font: Nunito 800 for headings (`font-heading`), Nunito Sans 400/600 for body (`font-body`). Never Arial.
- Prices: `formatPrice()` → ₹1,250 (en-IN grouping). Bold, large on the product page.
- Icons: lucide-react, stroke ~1.75, line style, often inside a pastel circle. Category shortcuts map slug → lucide icon in `src/lib/categoryIcons.js`.
- Botanical leaf line-art only in modal/hero corners, sparingly.
- 4px spacing grid, 16–20px screen padding (`px-screen`), generous whitespace.
- Touch targets ≥ 44px, visible focus rings, `aria-label` on icon buttons, respect `prefers-reduced-motion`.
- Layout: mobile-first. Above 640px render inside the centred max-w-[480px] column (AppShell). Never stretch the phone UI full width.
- Logo: always `src/components/brand/Logo.jsx` (final logo pending client confirmation).
- Mockups: `design/mockups/` — welcome-modal, product-page, chat-compose, chat-sent, chat-empty.
