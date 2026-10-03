**Statement of Work**

Tibu — Phase 1 (MVP) — Revision 2

|                   |                               |
|-------------------|-------------------------------|
| **Client**        | Laiba Merchant                |
| **Delivered by**  | Daiwang Khera, Deepak Bangari |
| **Original date** | 23 September 2026             |
| **Revised date**  | 25 September 2026             |

*This revision incorporates additional feature requests discussed after the original SoW was issued, alongside a revised payment structure. Changes from the original document are marked \[NEW\] throughout. Where a new item adds meaningful build effort, it is called out under the relevant section.*

# **1. Project Summary**

Tibu is a discovery platform for homegrown local businesses — helping customers find nearby sellers across categories like desserts, food, handmade goods, fashion, and more. This Statement of Work covers Phase 1: taking the existing frontend from a static prototype to a functioning app with a real backend, database, location-based search, seller and customer accounts, an admin approval workflow, and the discovery/retention features listed below.

# **2. Codebase Review**

A review of the existing frontend codebase has been completed. The frontend (React + Vite) is a polished, functional UI built against static, hardcoded local data — there is no backend, authentication, database, or real location search today. The review also found a significant number of existing bugs and code-quality issues (broken routing, undefined state, inconsistent data formats, and others documented separately). This phase includes a stabilization pass — fixing the issues identified in review — alongside building the backend, database, and new functionality below.

# **3. Phase 1 — Included**

***▌ Customer-Facing***

- **Guest browsing —** explore the app without requiring login

- **Customer registration and login —** required before a seller's WhatsApp/call contact is revealed; browsing and search remain open to guests

- **Home Page —** branding, hero section, search bar, category shortcuts, New Businesses, New Products, and Available Today sections

- **Available Today —** a simple section on the Home Page surfacing businesses/products marked available; based on a manual toggle set by the seller, not real-time inventory tracking

- **Search Page —** search for businesses and products, filter by category, view results for both

- **Location-based discovery —** real nearby-business search using the customer's location, sorted by actual distance (replacing the current static/fake distance labels)

- Category browsing and filters

- **Business Page —** business logo, cover image, location, description, Call and WhatsApp buttons, delivery/pick-up availability, expected delivery time, "est. since" (year business started — optional, seller-provided), a rating summary, and Products / Videos / Reviews tabs

- **Product Page —** multiple product images, product name, price, quantity and additional info (e.g. size charts for clothing, quantity/weight for food), description, delivery availability, expected delivery time, review & rating, seller/business location, seller/business name, Call and WhatsApp buttons

- **Basic customer profile —** name and phone/account information

- **Previously connected businesses —** businesses/products the customer has contacted or viewed before

- **Saved businesses and products —** customers can save/bookmark businesses and products for quick access later from their profile

- Recently viewed products/businesses

- **Reviews & ratings —** customers can view and submit reviews on a business, shown in the Reviews tab

***▌ WhatsApp, Call & In-App Contact***

- **Contact seller via WhatsApp or Call —** from both the Business Page and the Product Page

- **Pre-filled WhatsApp message —** clicking WhatsApp opens a chat with the seller with the message text pre-filled automatically, for example: "Hi! I discovered your business through Tibu and I'm interested in your Chocolate Chunk Cookies (₹350). I'd like to know more." Product name and price are populated automatically; the customer does not type them

- **Product link in the message —** since WhatsApp's click-to-chat does not support attaching an image automatically (this is a platform-level limitation, not something any provider, free or paid, can work around), the pre-filled message includes a link to the product's page on Tibu, where the seller can see the image immediately

- **Call button —** opens the device's calling interface using the seller's registered number, from both Business and Product pages

- **In-app chatbox —** replaces the earlier enquiry-box concept — customers can message a seller directly inside Tibu without leaving the app; the WhatsApp contact button remains available alongside this as a separate option. Sellers are notified in-app of new messages and can reply from their dashboard, with the customer notified of the response. This remains a lightweight, non-real-time system (no live typing indicators) — messages are picked up on refresh/notification, not instantly

***▌ Seller-Facing***

- Seller registration and login

- **Seller onboarding —** business details, logo, business banner, phone number, WhatsApp number, Instagram ID (for admin verification), business images, products with images, and videos

- Seller business profile creation and management

- **Seller product listing management —** add, edit, remove, with photos, multiple images per product, and per-product custom fields set at listing time — e.g. quantity/weight for food items, size charts for clothing, or other category-appropriate variants

- **Videos on the Business Page —** sellers can add videos to their business profile via a public Instagram Reel link, embedded directly on Tibu (see note below)

- **Delivery & fulfilment settings —** sellers can set delivery/pick-up availability and expected delivery time at the business level and, where needed, override it per product

***▌ Admin***

- **Basic Admin Panel —** view seller applications, see pending/approved/rejected status, check phone number, WhatsApp number, Instagram ID and business information, approve or reject sellers, and unpublish/remove a seller if required

***▌ Platform***

- **Backend API and database —** built to support all of the above, replacing the current static/hardcoded data

- **Image upload and hosting —** for business and product photos (now including multiple images per product)

- **Customer and seller login via email and password —** no phone OTP, no per-message verification cost

- **Deployment —** included, using free/low-cost hosting where feasible; if paid hosting is required at scale, that cost is separate and billed to the client's own account

- **Notifications & in-app pop-ups —** a reference pop-up/notification box surfaces relevant in-app updates to the user (e.g. new enquiry replies, saved-item updates); paired with push notifications where the platform supports them. Optional grouped updates (e.g. "8 new businesses joined Tibu near Andheri") rather than a notification for every single new listing; customers can use Tibu fully without granting notification permission

***▌ Note on Reels/Videos***

The Videos tab plays videos directly from the seller's public Instagram Reel link — no video files are uploaded to or stored by Tibu, which keeps this feature free to build and run. This depends on the seller's Instagram account/post remaining public: if a seller makes their account private or deletes the reel, that video will stop showing on Tibu as well, since Tibu does not keep a separate copy.

# **4. Phase 2 — Not Included in This Phase**

- Cart, checkout, and on-site ordering

- Payment gateway integration

- UPI/QR payment display in the app

- **Dedicated Discover/reels feed page —** browsing a feed of all reels, saving reels — a business's own Videos tab is included in Phase 1 as noted above

- **Live chat —** real-time / live chat between customer and seller — Phase 1 includes the non-real-time in-app chatbox above instead

- Advanced seller analytics dashboards (views/contacts counts beyond basic figures)

- **Full desktop-optimized redesign —** Phase 1 targets the existing mobile-first layout

# **5. Third-Party & Recurring Costs**

The following are separate from the development fee and will be billed at cost, directly to the client's own account, or require client approval before use:

- **Domain —** purchased directly by the client

- **Hosting —** free/low-cost hosting used where feasible; paid hosting at scale is billed separately, to the client's account

- **Image storage and delivery —** a third-party image hosting service (e.g. Cloudinary or equivalent); free tier used where feasible, overage billed separately — now covering multiple images per product

- **Maps / geolocation API —** required for location capture and distance-based search; free tier used where feasible, paid usage billed to the client's account

- **Database hosting —** free/low-cost managed database used where feasible; paid plan billed separately if required

# **6. Confirmed Decisions**

The following were open items in the prior revision and are now confirmed:

- **Guest browsing —** Browsing and search remain fully open to guests, without requiring login. Login is required only when a customer wants to view a seller's WhatsApp/call contact details.

- **Per-product custom fields —** Custom fields are set per product at listing time by the seller, using category-appropriate fields — e.g. quantity/weight for food items, size charts for clothing. No further categories or formats beyond this are in scope for Phase 1. **\[NEW\]**

- **Rating calculation —** The Business Page rating is a simple average of submitted reviews. No weighting or anti-gaming logic is included in Phase 1. **\[NEW\]**

# **7. Price**

|                                                             |                 |
|-------------------------------------------------------------|-----------------|
| **Package**                                                 | **Price (INR)** |
| Phase 1 — MVP (as scoped in Section 3, includes deployment) | **₹12,000**     |

*Price is held at the original ₹12,000 despite the additional scope in this revision. If any newly added item proves significantly more effort than expected during build, Section 12 (edge-case handling) applies.*

# **8. Payment Milestones**

|                                                                                                                        |       |
|------------------------------------------------------------------------------------------------------------------------|-------|
| **Stage**                                                                                                              | **%** |
| First payment — once the existing codebase is fully stabilized (all identified bugs fixed) and the frontend is refined | 40%   |
| Second payment — on completion of backend, database, and core Phase 1 functionality (mid-build milestone)              | 30%   |
| Final payment — on completion, deployment & handover                                                                   | 30%   |

Code and deployment access are handed over only after the final payment is received.

*This revision updates the payment structure from the original 50/50 split to 40/30/30, splitting the build phase into two milestones for clearer progress tracking.*

# **9. Timeline**

Estimated 4–5 weeks from sign-off and codebase access, worked part-time (team available weekdays, 6 PM–10 PM). This includes the stabilization pass on the existing frontend. Timeline may shift depending on the scope of issues found once full codebase access is confirmed, and pauses while awaiting client feedback or approvals do not count against this estimate.

*Timeline is held at the original estimate for this revision. See Section 12 for how newly added features are handled if they threaten this timeline.*

# **10. Post-Handover Support**

A support window of 30 days is included from the date of final handover. During this window, any bug or defect in the delivered Phase 1 scope will be fixed at no additional cost.

This window does not cover new features, design or content changes, changes to agreed scope, issues caused by third-party service outages or plan/quota limits, or issues arising from changes made to the code by anyone outside the development team. After 30 days, further work will be quoted separately or handled under an ongoing maintenance arrangement, if the client wishes to set one up.

# **11. Code Ownership**

On receipt of final payment, full ownership of the Phase 1 source code and all work delivered under this Statement of Work transfers to the client, including repository access and deployment credentials. Until final payment is received, ownership remains with the development team. Third-party libraries, frameworks, and services used in the build remain under their own respective licences. Accounts for third-party services (hosting, image storage, maps) will be set up in the client's name wherever possible so that ownership and billing stay with the client.

# **12. Terms**

- **This document covers Phase 1 only.** Items listed in Section 4 will be scoped and quoted separately as Phase 2

- **The feature list in Section 3 is the agreed scope, but is applied with some flexibility to protect the timeline.** if a specific feature is taking significantly longer to build than expected, it will be simplified or left out of this phase rather than delaying everything else; if development is running ahead of schedule, small additional features may be added within the same timeline. Either way, the client will be informed as it happens

- **Edge-case handling for high-effort features —** If any feature — new or original — turns out to require significantly more development effort than expected once work begins, the team will flag this to the client beforehand, before proceeding further, rather than after the fact. The client and team will then jointly decide whether to extend the timeline or reduce scope for that item. **\[NEW\]**

- Any new feature or functionality outside this agreed scope will be discussed separately and may require additional cost and timeline

- 1 consolidated revision/testing round is included on Phase 1 deliverables; further changes billed separately

- Client to share codebase access and any brand/design assets needed before work begins

- **A WhatsApp group will be created after sign-off for updates and milestone tracking.** new feature requests raised there are logged for Phase 2 rather than built into the ongoing Phase 1 work

# **13. Sign-Off**

By signing below, the client confirms the scope and terms in this Statement of Work and authorizes work to begin upon receipt of the advance payment.

|                  |      |
|------------------|------|
|                  |      |
| Client signature | Date |

|                                               |      |
|-----------------------------------------------|------|
|                                               |      |
| Delivered by — Daiwang Khera · Deepak Bangari | Date |
