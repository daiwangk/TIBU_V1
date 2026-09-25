---
trigger: glob
globs: src/**/*.jsx, src/**/*.css
---

---
trigger: glob
globs: "src/**/*.jsx, src/**/*.css"
description: "Tibu visual design system — colors, type, components. Apply when writing or editing UI."
---

# Tibu design system

- Background: warm cream ~#FAF7F2. Cards white, radius 16–24px, hairline border ~#EDE7EE or very soft shadow. No harsh shadows.
- Primary: deep plum ~#5A1848 (buttons, logo, active states, links). Primary button = solid plum + white text, pill or 12px radius. Secondary = white bg, 1px plum border, plum text.
- Pastel surfaces: lime ~#EEF3D6, blush ~#FBE6EA, lavender ~#EFE4F7, mint ~#DDF1EE. Sample exact hex from the mockups if these look off.
- Info banner: lavender bg, solid plum circle with white "i", dismiss X.
- Text: headings dark ink-plum ~#2A0F2A, body ~#4A4556, muted ~#8A8494.
- Success pill: light green bg, green text ("In stock").
- Font: Nunito 800 for headings, Nunito Sans 400/600 body (Google Fonts). Never Arial.
- Prices: ₹ with Indian grouping via Intl.NumberFormat('en-IN') → ₹1,250. Bold, large.
- Icons: lucide-react, stroke ~1.75, line style, often inside a pastel circle.
- Botanical leaf line-art only in modal/hero corners, sparingly.
- 4px spacing grid, 16–20px screen padding, generous whitespace.
- Touch targets ≥ 44px, visible focus rings, aria-labels on icon buttons, respect prefers-reduced-motion.
- Layout: mobile-first. Above 640px, render inside a centered max-w-[480px] column on a soft background. Never stretch the phone UI full width.
- Logo: always use src/components/brand/Logo.jsx (final logo pending client confirmation).