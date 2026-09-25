# Tibu — project rules

Tibu = mobile-first discovery platform for homegrown local businesses (India, ₹).
Stack: React 19 + Vite, JavaScript (no TypeScript migration now).
Reference docs: @docs/CODEBASE_AUDIT.md (bugs + data shapes), @docs/Tibu_SoW_Phase1_Final.pdf (agreed scope).
Visual source of truth: @design/mockups/ (welcome-modal.png, product-page.png, chat-compose.png, chat-sent.png, chat-empty.png).

## Scope — DO NOT BUILD (Phase 2)
Cart, checkout, payment gateway, UPI/QR payment display, Discover reels feed, real-time chat / online presence / read receipts / typing indicators, advanced analytics, full desktop redesign.
If a mockup shows one of these, leave it out and mention it in the Walkthrough.

## Required in Phase 1 (don't drop these even if a mockup lacks them)
- WhatsApp + Call buttons on Product and Business pages. WhatsApp opens wa.me with pre-filled text including product name, price and product page link.
- Guests can browse/search freely; WhatsApp/Call requires customer login.
- In-app enquiry box is NON-real-time (refresh/notification based).

## Code rules
- Styling: Tailwind CSS v4 with tokens in src/styles/theme.css. No new inline style={{}}; convert inline styles in any file you touch.
- Routing: react-router-dom with real URLs. No string-state page navigation.
- Pages/components never import from src/data directly — only via src/services/*. The backend will replace services later with the same function signatures.
- Icons: lucide-react only. No emoji as icons or product images.
- Components < 250 lines; extract subcomponents.
- Minimal diffs; don't touch files outside the current task.
- npm run build and npm run lint must pass with zero errors before you finish.

## Working process (every task)
1. Produce an Implementation Plan and wait for my approval before editing code.
2. After implementing any UI change: run `npm run dev`, open the app in the browser at 390×844 viewport, screenshot every changed screen, and compare each against the matching mockup in design/mockups/. List visible differences (spacing, radius, colors, font weight, alignment, icon style), fix them, and re-screenshot. Do at most 3 compare-fix passes.
3. Also screenshot at 1280px width to confirm the centered mobile column layout.
4. Finish with a Walkthrough artifact: files changed, before/after screenshots, anything intentionally left out and why.