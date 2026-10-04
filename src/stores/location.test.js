import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useLocationStore, toOrigin } from './location.js';
import * as geo from '../lib/geo.js';
import { AppError } from '../services/errors.js';

vi.mock('../lib/geo.js', () => ({
  getBrowserLocation: vi.fn(),
  MUMBAI_AREAS: [
    { name: 'Andheri West', lat: 19.1364, lng: 72.8296 },
    { name: 'Bandra West', lat: 19.0596, lng: 72.8295 }
  ]
}));

describe('location store', () => {
  beforeEach(() => {
    useLocationStore.getState().clear();
    useLocationStore.setState({ asked: false });
    vi.clearAllMocks();
  });

  describe('store actions', () => {
    it('initializes with null state', () => {
      const state = useLocationStore.getState();
      expect(state.lat).toBeNull();
      expect(state.lng).toBeNull();
      expect(state.label).toBeNull();
      expect(state.source).toBeNull();
      expect(state.asked).toBe(false);
    });

    it('requestGps sets location correctly', async () => {
      geo.getBrowserLocation.mockResolvedValueOnce({ lat: 10, lng: 20 });
      await useLocationStore.getState().requestGps();

      const state = useLocationStore.getState();
      expect(state.lat).toBe(10);
      expect(state.lng).toBe(20);
      expect(state.label).toBe('Current location');
      expect(state.source).toBe('gps');
      expect(state.asked).toBe(true);
    });

    it('setArea sets predefined area', () => {
      useLocationStore.getState().setArea('Bandra West');

      const state = useLocationStore.getState();
      expect(state.lat).toBe(19.0596);
      expect(state.lng).toBe(72.8295);
      expect(state.label).toBe('Bandra West');
      expect(state.source).toBe('area');
      expect(state.asked).toBe(true);
    });

    it('setArea throws AppError on unknown area', () => {
      expect(() => {
        useLocationStore.getState().setArea('Unknown City');
      }).toThrowError(AppError);
    });

    it('setFromProfile sets profile location', () => {
      useLocationStore.getState().setFromProfile({ lat: 12.34, lng: 56.78, label: 'My Home' });

      const state = useLocationStore.getState();
      expect(state.lat).toBe(12.34);
      expect(state.lng).toBe(56.78);
      expect(state.label).toBe('My Home');
      expect(state.source).toBe('profile');
    });

    it('clear resets state', () => {
      useLocationStore.setState({ lat: 1, lng: 2, label: 'foo', source: 'gps' });
      useLocationStore.getState().clear();

      const state = useLocationStore.getState();
      expect(state.lat).toBeNull();
      expect(state.lng).toBeNull();
      expect(state.label).toBeNull();
      expect(state.source).toBeNull();
    });

    it('markAsked sets asked to true', () => {
      useLocationStore.getState().markAsked();
      expect(useLocationStore.getState().asked).toBe(true);
    });
  });

  describe('toOrigin (useSearchOrigin pure logic)', () => {
    it('returns null when lat or lng is null', () => {
      expect(toOrigin(null, null)).toBeNull();
      expect(toOrigin(10, null)).toBeNull();
      expect(toOrigin(null, 20)).toBeNull();
    });

    it('returns object when lat and lng are provided', () => {
      expect(toOrigin(10, 20)).toEqual({ lat: 10, lng: 20 });
    });
  });
});
