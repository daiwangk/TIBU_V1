# 08 · Client communication (Laiba Merchant)

Register: formal English, short numbered points, declarative status. Don't mention internal tools or AI. Send in the project WhatsApp group unless noted; confirm decisions by email so there's a written record.

## 1. Status note — send on Day 1

> Hi Laiba, a quick update as we start the build.
>
> 1. With full codebase access we ran the existing app on a production-style build. It currently doesn't build for deployment and several screens fail to load because of issues in how the pages and data were wired together. We are fixing this first; the stabilisation pass is already in progress.
> 2. Rather than patching each old screen, we are rebuilding the customer screens on a clean structure that connects directly to the new backend. This is what makes the bugs from the review go away for good, and it's the same amount of work as patching.
> 3. Milestone 1 (stabilised, refined customer-facing app) is planned for **Friday 9 October**, demoed on a phone.
> 4. As the SOW allows (§9), the issues found add some time; we've planned a final buffer week so launch and handover land in the week of **2 November**. We'll flag anything that affects this as early as possible.
> 5. A few decisions and account setups from your side will keep us on schedule — I'll send those separately today.

## 2. Decisions to confirm — email, Day 1

> Subject: Tibu Phase 1 — decisions to confirm
>
> Hi Laiba, please confirm or adjust each point (a one-word reply per item is fine):
>
> 1. **Guest browsing:** anyone can browse and search without an account. Login is required to contact a seller (WhatsApp/Call), save items, send an enquiry or write a review.
> 2. **Email confirmation:** new users confirm their email before their first login (recommended; prevents fake accounts). Alternative: no confirmation step, which is smoother but allows fake emails.
> 3. **Categories:** Desserts, Food, Handmade (Crochet, Embroidery, Resin Art, Candles), Fashion (Women's, Men's), Jewellery, Gifts. Any additions or renames?
> 4. **Available Today** resets automatically at midnight each night; sellers switch it on each day.
> 5. **Editing after approval:** an approved seller can edit their business without going back to review; you can unpublish a seller at any time from the admin panel.
> 6. **Removed from Phase 1** (they're Phase 2 in the SOW): the Offers screens, the Discover/reels feed, and the saved-addresses screens. Each business keeps its own Videos tab.
> 7. **Milestone 1 definition:** the customer-facing app (Home, Search, Categories, Business and Product pages, information pages) stabilised and refined, with every bug from the review fixed, eliminated by the rebuild, or removed with the Phase 2 screens. Seller-side screens are rebuilt in Week 4.
> 8. **Content we'll need by Week 5:** final logo, privacy policy and terms text, support phone/email, and 3–5 real sellers ready to onboard at launch.

## 3. Accounts request — Day 1

> Hi Laiba, so that everything is in your name from the start (SOW §11), could you please set up the following and invite us (daiwang@… and deepak@…):
>
> 1. **GitHub** — an organisation for Tibu (free), with the current repository moved into it, or admin access to the existing repo.
> 2. **Supabase** (database and login) — a free account and organisation; invite both of us as members.
> 3. **Cloudflare** (hosting) — a free account; invite both of us. If the domain can be managed here too, that makes setup simplest.
> 4. **Resend** (login emails) — a free account; invite both of us.
> 5. **Domain** — access to its DNS settings (or move DNS to Cloudflare).
>
> All of these are on free plans for now. Anything that would need a paid plan will come to you for approval first, billed to your account (SOW §5).

## 4. Milestone 1 — demo invite and invoice

> Hi Laiba, Milestone 1 is ready. Could we do a 15-minute demo on **<day, time>**? We'll walk through the rebuilt app on a phone and the bug-resolution summary.
>
> After the demo:
> 1. Summary of what's delivered and how each reviewed bug was resolved (attached).
> 2. Invoice for the first milestone payment (50%, ₹6,000) as per SOW §8.
> 3. Next up: customer accounts, WhatsApp/Call with the pre-filled message, saved items and recently viewed.

## 5. Simplification notice (SOW §12) — whenever you cut

> Hi Laiba, a quick scope note under SOW §12: <feature> is taking significantly longer than planned, so for Phase 1 we'll deliver <simplified version> instead of <full version>. Everything else stays on schedule. The full version is noted for Phase 2.

## 6. Revision round (SOW §12) — start of Week 6

> Hi Laiba, the full Phase 1 build is ready for your review on <link>. As per the SOW, there's one consolidated revision round: please send all changes in a single list by **<date, 48 h later>**. We'll confirm which items are fixes within scope and which would be new features for Phase 2, then complete the in-scope items by <date>.

## 7. Handover pack — after final payment

> Hi Laiba, Tibu Phase 1 is live at <domain>. The handover includes:
>
> 1. Repository ownership transferred to your GitHub organisation.
> 2. Credentials transferred for Supabase, Cloudflare and Resend (sent separately through <password manager>); please change the passwords.
> 3. Admin access: your account <email> is the admin. How-to for approving sellers is attached.
> 4. Operations guide: hosting, database, backups, what to upgrade first as you grow (Supabase Pro).
> 5. Phase 2 backlog: every request logged during Phase 1.
> 6. The 30-day support window runs until <date> (SOW §10).

## 8. Internal notes (not for the client)
- New feature requests in the group: reply "Noted for Phase 2 — added to the backlog" and add a row to `docs/PHASE2_BACKLOG.md`.
- Log hours per task in PROGRESS. At ₹12,000 for ~165 hours the effective rate is very low; use the real hours to price Phase 2, and use §12 openly instead of absorbing overruns.
- Every waiting period on the client (accounts, decisions, content) goes in PROGRESS "Waiting on client" with the date asked — SOW §9 says those pauses don't count against the timeline.
