/**
 * @typedef {Object} Business
 * @property {string} id - Stable lowercase kebab-case ID (e.g. "sweet-crumbs")
 * @property {string} name - Business name
 * @property {string} category - Primary category slug (e.g. "desserts")
 * @property {string} [logoUrl] - URL to logo image (emoji fallback if missing)
 * @property {string} [bannerUrl] - URL to banner image (emoji fallback if missing)
 * @property {string} description - About text
 * @property {string} locality - E.g. "Bandra West"
 * @property {string} city - E.g. "Mumbai"
 * @property {number} lat - Latitude
 * @property {number} lng - Longitude
 * @property {string} phone - Contact phone number
 * @property {string} whatsapp - WhatsApp number
 * @property {string} instagram - Instagram handle
 * @property {number} rating - Average rating 1-5
 * @property {number} reviewCount - Number of reviews
 * @property {boolean} deliveryAvailable
 * @property {boolean} pickupAvailable
 * @property {boolean} availableToday
 * @property {string} createdAt - ISO date string
 * @property {Array<{id: string, instagramUrl?: string, caption: string, emoji?: string}>} reels
 */

/**
 * @typedef {Object} Product
 * @property {string} id - Stable string (businessId + name slug)
 * @property {string} businessId - FK to Business
 * @property {string} name - Product name
 * @property {number} price - Numeric price (e.g. 899, not "₹899")
 * @property {string[]} images - Array of image URLs (emoji string fallback)
 * @property {string} description - Product description
 * @property {string} category - Category slug
 * @property {"in_stock"|"made_to_order"|"out_of_stock"} stockStatus
 * @property {string} [size] - E.g. "M", "L" or dimensions
 * @property {boolean} deliverable
 * @property {string} [deliveryEstimate] - E.g. "2-3 days"
 * @property {boolean} availableToday
 * @property {number} rating - Average rating 1-5
 * @property {number} reviewCount
 * @property {string} createdAt - ISO date string
 */

/**
 * @typedef {Object} Review
 * @property {string} id - Unique review ID
 * @property {string} businessId - FK to Business
 * @property {string} [productId] - FK to Product (optional)
 * @property {string} authorName - Reviewer name
 * @property {number} rating - Rating 1-5
 * @property {string} text - Review text
 * @property {string} createdAt - ISO date string
 */

/**
 * @typedef {Object} Offer
 * @property {string} id
 * @property {string} businessId - FK to Business
 * @property {string} title
 * @property {string} discount - E.g. "15% OFF" or "₹100 OFF"
 * @property {string} description
 * @property {string} code - Promo code
 * @property {string} validTill - ISO date string or formatted date
 */

/**
 * @typedef {Object} Notification
 * @property {string} id
 * @property {string} businessId - FK to Business
 * @property {"business"|"offer"} type
 * @property {string} icon - Emoji or URL
 * @property {string} title
 * @property {string} message
 * @property {string} time - Relative time (e.g. "2 hours ago")
 * @property {string} [offerId] - If type is "offer"
 */

/**
 * @typedef {Object} EnquiryMessage
 * @property {string} id
 * @property {"customer"|"seller"} sender
 * @property {string} text
 * @property {string} createdAt - ISO date string
 */

/**
 * @typedef {Object} EnquiryThread
 * @property {string} id
 * @property {string} businessId - FK to Business
 * @property {string} [productId] - FK to Product (optional)
 * @property {string} customerId
 * @property {EnquiryMessage[]} messages
 * @property {string} updatedAt - ISO date string
 * @property {boolean} unreadForCustomer
 * @property {boolean} unreadForSeller
 */

export {};
