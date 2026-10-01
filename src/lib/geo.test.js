import { describe, expect, it, vi } from 'vitest';
import { AppError } from '../services/errors.js';
import { getBrowserLocation, haversineMeters, MUMBAI_AREAS } from './geo.js';

describe('geo helpers', () => {
  it('calculates the Bandra West to Andheri West distance', () => {
    const bandra = MUMBAI_AREAS.find((area) => area.name === 'Bandra West');
    const andheri = MUMBAI_AREAS.find((area) => area.name === 'Andheri West');
    const distance = haversineMeters(bandra, andheri);

    expect(distance).toBeGreaterThan(7_000);
    expect(distance).toBeLessThan(9_000);
  });

  it('resolves browser coordinates and forwards its options', async () => {
    const getCurrentPosition = vi.fn((success) => {
      success({ coords: { latitude: 19.1, longitude: 72.8 } });
    });
    vi.stubGlobal('navigator', { geolocation: { getCurrentPosition } });

    await expect(getBrowserLocation({ timeoutMs: 500 })).resolves.toEqual({ lat: 19.1, lng: 72.8 });
    expect(getCurrentPosition).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      { enableHighAccuracy: false, timeout: 500, maximumAge: 600_000 },
    );
    vi.unstubAllGlobals();
  });

  it('returns a validation AppError when location is unavailable', async () => {
    vi.stubGlobal('navigator', {});

    await expect(getBrowserLocation()).rejects.toMatchObject({
      code: 'validation',
      message: 'Location is not supported by this browser.',
    });
    vi.unstubAllGlobals();
  });

  it('maps browser location failures to validation errors', async () => {
    vi.stubGlobal('navigator', {
      geolocation: { getCurrentPosition: (_success, failure) => failure({ code: 1 }) },
    });

    await expect(getBrowserLocation()).rejects.toBeInstanceOf(AppError);
    await expect(getBrowserLocation()).rejects.toMatchObject({
      code: 'validation',
      message: 'Location permission was denied.',
    });
    vi.unstubAllGlobals();
  });

  it('maps a location timeout to a validation AppError', async () => {
    vi.stubGlobal('navigator', {
      geolocation: { getCurrentPosition: (_success, failure) => failure({ code: 3 }) },
    });

    await expect(getBrowserLocation()).rejects.toBeInstanceOf(AppError);
    await expect(getBrowserLocation()).rejects.toMatchObject({
      code: 'validation',
      message: 'Location request timed out.',
    });
    vi.unstubAllGlobals();
  });
});
