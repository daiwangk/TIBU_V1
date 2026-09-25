import { mockReviews } from './mock/normalize';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const NETWORK_DELAY = 150;

let inMemoryReviews = [...mockReviews];

export async function listReviews(businessId) {
  await delay(NETWORK_DELAY);
  return inMemoryReviews.filter(r => r.businessId === businessId);
}

export async function createReview(payload) {
  await delay(NETWORK_DELAY);
  const newReview = {
    id: `rev-new-${Date.now()}`,
    ...payload,
    createdAt: new Date().toISOString(),
  };
  inMemoryReviews = [newReview, ...inMemoryReviews];
  return newReview;
}
