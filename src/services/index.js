import * as mock from './mock/index.js';
import * as supabase from './supabase/index.js';

const useSupabase = import.meta.env.VITE_DATA_SOURCE === 'supabase';

if (import.meta.env.PROD && !useSupabase) {
  throw new Error('Production requires VITE_DATA_SOURCE=supabase');
}

const impl = useSupabase ? supabase : mock;

export const dataSource = impl === supabase ? 'supabase' : 'mock';

export const {
  listCategories,
  getCategory,
  searchBusinesses,
  searchProducts,
  getBusinessBySlug,
  getProductById,
  listReviews,
  getMyReview,
  saveMyReview,
  deleteMyReview,
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
  getSavedIds,
  listSavedBusinesses,
  listSavedProducts,
  setSaved,
  trackView,
  listRecent,
  listConnected,
  becomeSeller,
  getMyBusiness,
  saveMyBusiness,
  saveMyContacts,
  uploadBusinessImage,
  removeBusinessImage,
  listMyProducts,
  saveProduct,
  deleteProduct,
  uploadProductImage,
  removeProductImage,
  addVideo,
  removeVideo,
  getSubmitChecklist,
  submitForReview,
  setAvailableToday,
  getMyStats,
  listApplications,
  getApplication,
  decideApplication,
  sendEnquiry,
  findMyThread,
  listMyThreads,
  getThread,
  sendMessage,
  markThreadRead,
  listNotifications,
  markNotificationsRead,
  getUnreadCounts,
  savePushSubscription,
  deletePushSubscription,
} = impl;
