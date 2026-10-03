# TRACKER — every remaining task, in order (living file)

Tick a box only when the PR is **merged** and its Verify list passed by hand. Owners include the rebalancing from the deep dives (A takes R2, B2.4, B4.4 and B5.2). Est = AI-assisted hours; real time is about 1.5×. Commit the ticks with your normal PRs.

Done before 2 Oct: B1.1 · B1.2 · B1.3 · B1.4 · B1.5 · B1.6 · A1.2 · A1.3 · A1.4 · A1.6

## Today — Fri 2 Oct (no code)
- [ ] Repo made private (`10_REPO_REVIEW` F1)
- [ ] Client message `11_SOW_REV2_CHANGES.md` §6.1 sent (decisions, M1/M2, advance payment, **domain**)
- [ ] Update kit applied (`apply-update.sh`) and merged
- [ ] PROGRESS "Now" updated (last green `5212f7e`)

## Weekend 3–4 Oct — close Week 1 (`WEEK2_DEEP_DIVE.md` → Weekend)
| ✓ | ID | Task | Who | Est | Needs |
|---|---|---|---|---|---|
| ☐ | F5 | Hosted DB checks: 0007 applied, zero-RLS query, psql smoke test → PROGRESS | A | 0.25 | — |
| ☐ | R1-1 | R1 Part 1: push migrations 0008/0009 to dev | A | 0.3 | F5 |
| ☐ | A1.5 | Supabase catalog adapter — **apply patch 0003** (`patches/README.md`), live test 12/12 | A | 0.5 | R1-1 |
| ☐ | R1-2 | R1 Part 2: contract v1.2, D32–D38, AGENTS.md, v1.2 fields in the adapter | A | 1.5 | A1.5 |
| ☐ | A1.7 | Auth URLs on dev | A | 0.5 | — |
| ☑ | B1.7 | Product page `/p/:productId` | B | 2 | — |
| ☑ | B1.8 | Business page `/b/:slug` | B | 3 | B1.7 |

## Week 2 — 5–9 Oct (`WEEK2_DEEP_DIVE.md`)
| ✓ | ID | Task | Who | Day | Est | Needs |
|---|---|---|---|---|---|---|
| ☐ | A2.1 | Real data on preview **and** production env | A | Mon | 1.5 | A1.5 |
| ✓ | B2.1 | Home page | B | Mon | 3 | B1.7, B1.8 |
| ☐ | A2.2 | Location store | A | Tue | 2 | — |
| ☐ | B2.2 | Generic CategoryPage | B | Tue | 2 | B2.1 |
| ☐ | A2.3 | WhatsApp/OG link previews (real phones) | A | Wed | 2.5 | A2.1 |
| ☐ | B2.3 | Search page | B | Wed | 3 | — |
| ☐ | ⏱ | Checkpoint: Fri or Mon demo decided | both | Wed | — | — |
| ☐ | B2.6 | Location chip, area picker, first-visit prompt | B | Thu | 2 | A2.2 |
| ☐ | R2 | Rev2 fields on Product + Business pages | A | Thu | 1.5 | R1, B1.8 |
| ☐ | A2.4 | Error toasts | A | Thu | 1 | A1.5 |
| ☐ | B2.4 | Static pages, 404, delete legacy view-all/reel/services | A | Thu | 2 | B2.1–B2.3 |
| ☐ | B2.5 | QA pass, audit closure table, rehearsal | both | Fri | 2 | all |
| ☐ | **M1** | **Demo + invoice 40% ₹4,800** (`11` §6.2) | both | Fri 9 / Mon 12 | 1 | — |

## Week 3 — 12–16 Oct (`WEEK3_DEEP_DIVE.md`)
| ✓ | ID | Task | Who | Day | Est | Needs |
|---|---|---|---|---|---|---|
| ☐ | A3.1 | Auth + profile services, store, guards (no PKCE) | A | Mon | 2.5 | A1.5 |
| ☐ | B3.1 | Auth pages (+ iPhone email handling) | B | Mon–Tue | 3 | A3.1 |
| ☐ | A3.2 | Login gate + reveal contact | A | Tue | 2.5 | A3.1 |
| ☐ | A3.3 | Saved items | A | Tue | 2 | A3.1 |
| ☐ | A3.4 | Recently viewed + previously connected | A | Wed | 2 | A3.1 |
| ☐ | B3.2 | Login sheet | B | Wed | 2 | A3.2 |
| ☐ | B3.3 | WhatsApp + Call live (two real phones) | B | Wed | 1.5 | B3.2 |
| ☐ | A3.5 | Profile location default + **Resend SMTP on her domain** | A | Thu | 1 | domain |
| ☐ | B3.4 | Profile + Edit profile (**+ add-on**) | B | Thu | 2 | A3.1 |
| ☐ | B3.5 | Saved, Recently viewed, Previously connected | B | Fri | 3 | A3.3, A3.4 |
| ☐ | Exit | Incognito → WhatsApp → sign up → confirm → WhatsApp opens | both | Fri | — | — |

## Week 4 — 19–24 Oct, Dussehra Tue 20 (`WEEK4_DEEP_DIVE.md`)
| ✓ | ID | Task | Who | Day | Est | Needs |
|---|---|---|---|---|---|---|
| ☐ | A4.1 | Seller services **+ R3 add-on** | A | Mon | 3.5 | A3.1 |
| ☐ | B4.1 | Sell landing, seller gate, hooks | B | Mon | 1.5 | A4.1 |
| ☐ | B4.2a | Onboarding shell + steps 1–3 (**+ R4 add-on**) | B | Mon–Wed | 2.5 | B4.1 |
| ☐ | A4.3 | Admin services | A | Tue/Thu | 1.5 | A3.1 |
| ☐ | A4.2 | Image pipeline (**+ A4.2 path correction**), WhatsApp WebP check | A | Wed | 2 | A4.1 |
| ☐ | B4.4 | Admin panel | A | Thu | 3 | A4.3 |
| ☐ | B4.2b | Onboarding steps 4–7 (**+ R4 add-on**) | B | Thu | 2.5 | A4.2 |
| ☐ | A4.4 | Chat (enquiry) backend | A | Fri | 2 | A3.1 |
| ☐ | B4.3 | Seller dashboard, products, videos, business edit | B | Fri–Sat | 4 | B4.2b |
| ☐ | A4.5 | RLS role matrix (4 accounts, curl) → PROGRESS | A | Sat | 1.5 | A4.1–A4.4 |
| ☐ | **M2** | **Demo + invoice 30% ₹3,600** (`11` §6.3) | both | Mon 26 | 1 | — |

## Week 5 — 26–30 Oct (`WEEK5_DEEP_DIVE.md`)
| ✓ | ID | Task | Who | Day | Est | Needs |
|---|---|---|---|---|---|---|
| ☐ | A5.1 | Notifications service + digest check | A | Mon | 1.5 | A3.1 |
| ☐ | B5.1a | Chat — customer side (**+ B5.1 add-on**) | B | Mon | 2 | A4.4 |
| ☐ | A5.2 | Production on her domain (restore tibu-prod, Cloudflare account decided) | A | Tue | 3 | domain |
| ☐ | B5.1b | Chat — seller side + badges | B | Tue | 2 | B5.1a |
| ☐ | R5 | Push backend on dev | A | Wed | 2.5 | A5.1 |
| ☐ | B5.3 | Notifications UI + last legacy deletion (**B5.3 change**) | B | Wed | 2 | A5.1 |
| ☐ | B5.2 | Reviews | A | Thu | 2.5 | A3.1 |
| ☐ | A5.4 | Lazy routes | A | Thu | 1 | — |
| ☐ | R6 | Push frontend | B | Thu | 2.5 | R5, B5.3 |
| ☐ | ⏱ | Push go/no-go on a real Android phone (D33) | both | Thu | — | R6 |
| ☐ | A5.3 | Keep-alive, first backup, push on prod | A | Fri | 2 | A5.2 |
| ☐ | B5.4 | Accessibility audit + fixes | B | Fri | 1.5 | — |
| ☐ | B5.5 | Real-device regression on prod (rows 1–39) | B | Fri | 2 | A5.2 |
| ☐ | — | Revision-round request sent (due Sun 1 Nov) | A | Fri | — | — |

## Week 6 — 2–6 Nov, Diwali Sun 8 (`WEEK6_DEEP_DIVE.md`)
| ✓ | Task | Who | Day |
|---|---|---|---|
| ☐ | Triage her list → table sent back | both | Mon |
| ☐ | In-scope fixes (one small PR each) | both | Tue–Wed |
| ☐ | 3–5 real sellers live; WhatsApp preview checked per seller | both + client | Tue–Thu |
| ☐ | Launch checklist (`07` §7) → launch | both | Thu 5 |
| ☐ | Handover pack + **final invoice 30% ₹3,600** (`11` §6.4) | A | Fri 6 |
| ☐ | Transfers after payment: GitHub → Cloudflare → Supabase → Resend → rotate secrets → re-test | A | after payment |
| ☐ | Support log started (window ends Sun 6 Dec) | A | Fri 6 |

## Waiting on client (write the date you asked — SOW §9)
| Need | Needed by | Asked on | Received |
|---|---|---|---|
| Written answers to §6.1 (decisions, M1/M2 definitions, advance payment) | before M1 | | |
| **Domain + DNS access** | Week 3 Mon (sign-up emails) | | |
| 3–4 public Instagram reel links | M1 demo | | |
| Final logo (+ icon versions) | Week 4 | | |
| Privacy policy, terms, support phone/email | Fri 30 Oct | | |
| 3–5 real sellers ready to onboard | 30 Oct – 4 Nov | | |
| Her consolidated revision list | Sun 1 Nov | | |

## Every Friday
- [ ] Week's exit check on a real phone, incognito
- [ ] RLS zero-rows query
- [ ] PROGRESS: ticks, waiting-on-client dates, unavailable evenings next week
- [ ] Quotas checked (Antigravity weekly reset, Cursor monthly)
- [ ] Three-line update to Laiba
