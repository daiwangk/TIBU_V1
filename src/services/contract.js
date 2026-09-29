/**
 * Service contract — mirrors docs/CONTRACT.md §2–7.
 * FUNCTION_NAMES is the single source of truth for adapter exports.
 */

/** @typedef {{ slug: string, name: string, parentSlug: string|null, sortOrder: number }} Category */

/** @typedef {{ id: string, url: string }} Image */
/** @typedef {{ id: string, instagramUrl: string, shortcode: string, caption: string }} Video */

/**
 * @typedef {Object} BusinessSummary
 * @property {string} id
 * @property {string} slug
 * @property {string} name
 * @property {string} categorySlug
 * @property {string} categoryName
 * @property {string|null} logoUrl
 * @property {string|null} bannerUrl
 * @property {string} locality
 * @property {string} city
 * @property {number|null} distanceM
 * @property {number} rating
 * @property {number} reviewCount
 * @property {boolean} availableToday
 * @property {boolean} deliveryAvailable
 * @property {boolean} pickupAvailable
 * @property {string|null} approvedAt
 */

/** @typedef {{ id: string, slug: string, name: string, logoUrl: string|null, locality: string }} BusinessRef */

/**
 * @typedef {BusinessSummary & {
 *   description: string,
 *   addressText: string,
 *   images: Image[],
 *   videos: Video[],
 *   products: ProductSummary[]
 * }} BusinessDetail
 */

/**
 * @typedef {Object} ProductSummary
 * @property {string} id
 * @property {string} name
 * @property {number} price
 * @property {string|null} imageUrl
 * @property {string} categorySlug
 * @property {boolean} availableToday
 * @property {string} businessId
 * @property {string} businessSlug
 * @property {string} businessName
 * @property {string|null} businessLogoUrl
 * @property {number} businessRating
 * @property {string} locality
 * @property {number|null} distanceM
 * @property {string} createdAt
 */

/**
 * @typedef {ProductSummary & {
 *   description: string,
 *   images: Image[],
 *   details: Array<{ label: string, value: string }>,
 *   business: BusinessSummary
 * }} ProductDetail
 */

/**
 * @typedef {Object} Review
 * @property {string} id
 * @property {string} businessId
 * @property {string} reviewerName
 * @property {number} rating
 * @property {string} body
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {boolean} isMine
 */

/**
 * @typedef {Object} SearchParams
 * @property {string} [q]
 * @property {string} [category]
 * @property {boolean} [availableToday]
 * @property {'distance'|'newest'|'rating'|'price_asc'|'price_desc'} [sort]
 * @property {{lat:number,lng:number}|null} [near]
 * @property {number|null} [radiusKm]
 * @property {number} [minPrice]
 * @property {number} [maxPrice]
 * @property {string} [businessId]
 * @property {number} [limit]
 * @property {number} [offset]
 */

/** @typedef {{ userId: string, email: string } | null} Session */

/**
 * @typedef {Object} Profile
 * @property {string} id
 * @property {string} email
 * @property {'customer'|'seller'|'admin'} role
 * @property {string} fullName
 * @property {string|null} phone
 * @property {string|null} avatarUrl
 * @property {string|null} homeLocality
 * @property {number|null} homeLat
 * @property {number|null} homeLng
 * @property {boolean} notifyDigest
 */

/** @typedef {{ phone: string|null, whatsapp: string|null }} ContactInfo */
/** @typedef {{ businessIds: string[], productIds: string[] }} SavedIds */
/** @typedef {{ id: string, name: string, price: number, imageUrl: string|null }} ProductRef */
/** @typedef {{ kind: 'business'|'product', viewedAt: string, business?: BusinessRef, product?: ProductRef }} RecentItem */
/** @typedef {{ channel: 'whatsapp'|'call', contactedAt: string, business: BusinessRef }} ConnectedItem */

/**
 * @typedef {BusinessDetail & {
 *   status: 'draft'|'pending'|'approved'|'rejected'|'unpublished',
 *   rejectionReason: string|null,
 *   submittedAt: string|null,
 *   approvedAt: string|null,
 *   instagramHandle: string|null,
 *   lat: number|null, lng: number|null,
 *   contacts: ContactInfo|null,
 *   products: MyProduct[]
 * }} MyBusiness
 */

/**
 * @typedef {Object} BusinessInput
 * @property {string} name
 * @property {string} description
 * @property {string} categorySlug
 * @property {string} addressText
 * @property {string} locality
 * @property {string} city
 * @property {number|null} lat
 * @property {number|null} lng
 * @property {string} instagramHandle
 * @property {boolean} deliveryAvailable
 * @property {boolean} pickupAvailable
 */

/** @typedef {ProductDetail & { isActive: boolean, sortOrder: number }} MyProduct */

/**
 * @typedef {Object} ProductInput
 * @property {string} [id]
 * @property {string} name
 * @property {number} price
 * @property {string} description
 * @property {string|null} categorySlug
 * @property {Array<{label:string,value:string}>} details
 * @property {boolean} availableToday
 * @property {boolean} isActive
 */

/**
 * @typedef {{ ok: boolean, missing: Array<{ key: string, label: string, step: number }> }} SubmitChecklist
 */

/** @typedef {{ contacts7d: number, contacts30d: number, whatsapp30d: number, calls30d: number, saves: number, openEnquiries: number, rating: number, reviewCount: number }} SellerStats */

/**
 * @typedef {Object} ApplicationRow
 * @property {string} businessId
 * @property {string} name
 * @property {string} slug
 * @property {MyBusiness['status']} status
 * @property {string|null} categoryName
 * @property {string|null} ownerName
 * @property {string} ownerEmail
 * @property {string|null} phone
 * @property {string|null} whatsapp
 * @property {string|null} instagramHandle
 * @property {string|null} locality
 * @property {string|null} submittedAt
 * @property {number} productCount
 */

/**
 * @typedef {Object} ApplicationDetail
 * @property {MyBusiness} business
 * @property {ApplicationRow} row
 * @property {Array<{ action: 'approve'|'reject'|'unpublish'|'republish', reason: string|null, adminName: string|null, createdAt: string }>} history
 */

/**
 * @typedef {Object} EnquiryThread
 * @property {string} id
 * @property {string} businessId
 * @property {string} businessName
 * @property {string} customerName
 * @property {string|null} productId
 * @property {string|null} productName
 * @property {'open'|'closed'} status
 * @property {string} lastMessageAt
 * @property {string} lastMessagePreview
 * @property {number} unreadCount
 */

/** @typedef {{ thread: EnquiryThread & { businessSlug: string, businessLogoUrl: string|null }, messages: EnquiryMessage[] }} ThreadDetail */
/** @typedef {{ id: string, threadId: string, fromMe: boolean, body: string, createdAt: string, readAt: string|null }} EnquiryMessage */

/**
 * @typedef {Object} Notification
 * @property {string} id
 * @property {'enquiry_new'|'enquiry_reply'|'business_approved'|'business_rejected'|'business_unpublished'|'review_new'|'digest_new_businesses'} type
 * @property {string} title
 * @property {string} body
 * @property {string|null} link
 * @property {string} createdAt
 * @property {string|null} readAt
 */

/** Every function in docs/CONTRACT.md §7 — both adapters must export each as a function. */
export const FUNCTION_NAMES = [
  'listCategories',
  'getCategory',
  'searchBusinesses',
  'searchProducts',
  'getBusinessBySlug',
  'getProductById',
  'listReviews',
  'getMyReview',
  'saveMyReview',
  'deleteMyReview',
  'getSession',
  'onAuthChange',
  'signUp',
  'signIn',
  'signOut',
  'sendPasswordReset',
  'updatePassword',
  'getMe',
  'updateMe',
  'uploadAvatar',
  'revealContact',
  'getSavedIds',
  'listSavedBusinesses',
  'listSavedProducts',
  'setSaved',
  'trackView',
  'listRecent',
  'listConnected',
  'becomeSeller',
  'getMyBusiness',
  'saveMyBusiness',
  'saveMyContacts',
  'uploadBusinessImage',
  'removeBusinessImage',
  'listMyProducts',
  'saveProduct',
  'deleteProduct',
  'uploadProductImage',
  'removeProductImage',
  'addVideo',
  'removeVideo',
  'getSubmitChecklist',
  'submitForReview',
  'setAvailableToday',
  'getMyStats',
  'listApplications',
  'getApplication',
  'decideApplication',
  'sendEnquiry',
  'findMyThread',
  'listMyThreads',
  'getThread',
  'sendMessage',
  'markThreadRead',
  'listNotifications',
  'markNotificationsRead',
  'getUnreadCounts',
];
