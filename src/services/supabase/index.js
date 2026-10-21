import { AppError } from '../errors.js';
import {
  getBusinessBySlug,
  getCategory,
  getProductById,
  listCategories,
  listReviews,
  searchBusinesses,
  searchProducts,
} from './catalog.js';
import {
  getSession,
  onAuthChange,
  sendPasswordReset,
  signIn,
  signOut,
  signUp,
  updatePassword,
  resendConfirmation,
} from './auth.js';
import { getMe, updateMe, uploadAvatar } from './me.js';
import { revealContact } from './contact.js';
import { getSavedIds, listSavedBusinesses, listSavedProducts, setSaved } from './saved.js';
import { trackView, listRecent, listConnected } from './activity.js';
import { deletePushSubscription, savePushSubscription } from './push.js';
import {
  addVideo,
  becomeSeller,
  deleteProduct,
  getMyBusiness,
  getMyStats,
  getSubmitChecklist,
  listMyProducts,
  removeBusinessImage,
  removeProductImage,
  removeVideo,
  saveMyBusiness,
  saveMyContacts,
  saveProduct,
  setAvailableToday,
  submitForReview,
  uploadBusinessImage,
  uploadProductImage,
} from './seller.js';

const notImplemented = async () => {
  throw new AppError('config', 'Supabase adapter not implemented yet');
};

export {
  listCategories,
  getCategory,
  searchBusinesses,
  searchProducts,
  getBusinessBySlug,
  getProductById,
  listReviews,
};

export const getMyReview = notImplemented;
export const saveMyReview = notImplemented;
export const deleteMyReview = notImplemented;
export { getSavedIds, listSavedBusinesses, listSavedProducts, setSaved };
export { trackView, listRecent, listConnected };
export {
  becomeSeller,
  getMyBusiness,
  saveMyBusiness,
  saveMyContacts,
  listMyProducts,
  saveProduct,
  deleteProduct,
  addVideo,
  removeVideo,
  getSubmitChecklist,
  submitForReview,
  setAvailableToday,
  getMyStats,
  uploadBusinessImage,
  removeBusinessImage,
  uploadProductImage,
  removeProductImage,
};
export const listApplications = notImplemented;
export const getApplication = notImplemented;
export const decideApplication = notImplemented;
export const sendEnquiry = notImplemented;
export const findMyThread = notImplemented;
export const listMyThreads = notImplemented;
export const getThread = notImplemented;
export const sendMessage = notImplemented;
export const markThreadRead = notImplemented;
export const listNotifications = notImplemented;
export const markNotificationsRead = notImplemented;
export const getUnreadCounts = notImplemented;

export {
  getSession,
  onAuthChange,
  signUp,
  signIn,
  signOut,
  sendPasswordReset,
  updatePassword,
  resendConfirmation,
  getMe,
  updateMe,
  uploadAvatar,
  revealContact,
};

export { savePushSubscription, deletePushSubscription };
