/**
 * Seller hooks — src/queries/seller.js. One hook per seller service (CONTRACT §7); every write
 * invalidates the seller's own data. The business query also carries its products, so both keys are
 * refreshed together.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
} from '../services/index.js';
import { useAuthStore } from '../stores/auth.js';
import { qk } from './keys.js';

// Under qk.myBusiness, so invalidating the business refreshes the checklist too.
const CHECKLIST_KEY = [...qk.myBusiness, 'checklist'];

function useSellerQuery(queryKey, queryFn) {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    // Seller screens render their own loading and error states.
    meta: { silent: true },
    queryKey,
    queryFn,
    enabled: status === 'authenticated',
  });
}

/**
 * A mutation that refreshes the seller's business (and its checklist) and products on success.
 * `extraKeys` adds further keys, e.g. qk.myStats.
 */
function useSellerMutation(mutationFn, extraKeys = []) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () =>
      Promise.all(
        [qk.myBusiness, qk.myProducts, ...extraKeys].map((queryKey) => queryClient.invalidateQueries({ queryKey })),
      ),
  });
}

/** `becomeSeller()` for a signed-in customer. Puts the new profile straight into the `me` cache so the role check never sees the old role. */
export function useBecomeSeller() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => becomeSeller(),
    onSuccess: (profile) => {
      queryClient.setQueryData(qk.me, profile);
      return queryClient.invalidateQueries({ queryKey: qk.myBusiness });
    },
  });
}

/** The seller's business with contacts, media and all products (inactive too); `null` before the first save. */
export function useMyBusiness() {
  return useSellerQuery(qk.myBusiness, () => getMyBusiness());
}

/**
 * `saveMyBusiness(input)` — creates the draft on first save. The saved business goes straight into the
 * cache (the onboarding steps build the next save from it) before the usual refetch.
 */
export function useSaveMyBusiness() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input) => saveMyBusiness(input),
    onSuccess: (business) => {
      queryClient.setQueryData(qk.myBusiness, business);
      return Promise.all([qk.myBusiness, qk.myProducts].map((queryKey) => queryClient.invalidateQueries({ queryKey })));
    },
  });
}

/** `saveMyContacts({ phone, whatsapp })`. */
export function useSaveMyContacts() {
  return useSellerMutation((input) => saveMyContacts(input));
}

/** The seller's products, including inactive ones. */
export function useMyProducts() {
  return useSellerQuery(qk.myProducts, () => listMyProducts());
}

/** `saveProduct(input)` — creates when `input.id` is omitted. */
export function useSaveProduct() {
  return useSellerMutation((input) => saveProduct(input));
}

/** `deleteProduct(id)`. */
export function useDeleteProduct() {
  return useSellerMutation((id) => deleteProduct(id));
}

/** `mutate({ kind: 'logo'|'banner'|'gallery', file })`. */
export function useUploadBusinessImage() {
  return useSellerMutation(({ kind, file }) => uploadBusinessImage({ kind, file }));
}

/** `mutate({ productId, file })`. */
export function useUploadProductImage() {
  return useSellerMutation(({ productId, file }) => uploadProductImage(productId, file));
}

/** `mutate(imageId)` for a gallery image. */
export function useRemoveBusinessImage() {
  return useSellerMutation((imageId) => removeBusinessImage(imageId));
}

/** `mutate(imageId)` for a product image. */
export function useRemoveProductImage() {
  return useSellerMutation((imageId) => removeProductImage(imageId));
}

/** `mutate({ instagramUrl, caption })`. */
export function useAddVideo() {
  return useSellerMutation((input) => addVideo(input));
}

/** `mutate(videoId)`. */
export function useRemoveVideo() {
  return useSellerMutation((id) => removeVideo(id));
}

/** What is still missing before the business can be submitted (CONTRACT §5). */
export function useSubmitChecklist() {
  return useSellerQuery(CHECKLIST_KEY, () => getSubmitChecklist());
}

/**
 * `submitForReview()`. Refreshes the business whether it worked or not: a failure can still mean the
 * status moved (the RPC succeeded but the re-read failed, or an admin acted meanwhile), and the page
 * must follow the real status rather than offer Submit again.
 */
export function useSubmitForReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => submitForReview(),
    onSettled: () =>
      Promise.all([qk.myBusiness, qk.myProducts, qk.myStats].map((queryKey) => queryClient.invalidateQueries({ queryKey }))),
  });
}

/** `mutate({ kind: 'business'|'product', id, value })`. */
export function useSetAvailableToday() {
  return useSellerMutation((input) => setAvailableToday(input));
}

/** Taps, enquiries and rating figures for the seller's dashboard. */
export function useMyStats() {
  return useSellerQuery(qk.myStats, () => getMyStats());
}
