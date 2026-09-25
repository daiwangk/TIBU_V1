import { normalizedReels } from './mock/normalize';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const NETWORK_DELAY = 150;

export async function listReels(_categoryKey) {
  await delay(NETWORK_DELAY);
  // (In a real app, reels would be filtered by category if needed)
  return normalizedReels;
}

export async function getReelById(id) {
  await delay(NETWORK_DELAY);
  return normalizedReels.find((r) => r.id === id) ?? null;
}

