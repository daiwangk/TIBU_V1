import { describe, expect, it } from 'vitest';
import { resolveProfileLocationDefault } from './profileLocation.js';

describe('resolveProfileLocationDefault', () => {
  const emptyLocation = { lat: null, lng: null, source: null };
  const validProfile = {
    homeLat: 19.0596,
    homeLng: 72.8295,
    homeLocality: 'Bandra West',
  };

  it('sets location when store is empty and profile has coords', () => {
    const result = resolveProfileLocationDefault(emptyLocation, validProfile);
    expect(result).toEqual({
      lat: 19.0596,
      lng: 72.8295,
      label: 'Bandra West',
    });
  });

  it('falls back to "Home area" when homeLocality is null or undefined', () => {
    const profileWithoutLocality = { homeLat: 18.9322, homeLng: 72.8264, homeLocality: null };
    const result = resolveProfileLocationDefault(emptyLocation, profileWithoutLocality);
    expect(result).toEqual({
      lat: 18.9322,
      lng: 72.8264,
      label: 'Home area',
    });

    const profileUndefinedLocality = { homeLat: 18.9322, homeLng: 72.8264 };
    const resultUndef = resolveProfileLocationDefault(emptyLocation, profileUndefinedLocality);
    expect(resultUndef?.label).toBe('Home area');
  });

  it('skips when a location exists (lat/lng or source set)', () => {
    expect(
      resolveProfileLocationDefault({ lat: 19.1, lng: 72.8, source: 'gps' }, validProfile),
    ).toBeNull();

    expect(
      resolveProfileLocationDefault({ lat: 19.1, lng: 72.8, source: 'area' }, validProfile),
    ).toBeNull();

    expect(
      resolveProfileLocationDefault({ lat: 19.1, lng: 72.8, source: 'profile' }, validProfile),
    ).toBeNull();

    expect(
      resolveProfileLocationDefault({ lat: 19.1, lng: null, source: null }, validProfile),
    ).toBeNull();

    expect(
      resolveProfileLocationDefault({ lat: null, lng: 72.8, source: null }, validProfile),
    ).toBeNull();

    expect(
      resolveProfileLocationDefault({ lat: null, lng: null, source: 'area' }, validProfile),
    ).toBeNull();
  });

  it('skips when profile coords are null or missing', () => {
    expect(
      resolveProfileLocationDefault(emptyLocation, { homeLat: null, homeLng: 72.8, homeLocality: 'Bandra' }),
    ).toBeNull();

    expect(
      resolveProfileLocationDefault(emptyLocation, { homeLat: 19.1, homeLng: null, homeLocality: 'Bandra' }),
    ).toBeNull();

    expect(
      resolveProfileLocationDefault(emptyLocation, { homeLat: null, homeLng: null, homeLocality: 'Bandra' }),
    ).toBeNull();

    expect(
      resolveProfileLocationDefault(emptyLocation, {}),
    ).toBeNull();
  });

  it('skips when profile coords are invalid or not finite numbers', () => {
    expect(
      resolveProfileLocationDefault(emptyLocation, { homeLat: '19.1', homeLng: 72.8 }),
    ).toBeNull();

    expect(
      resolveProfileLocationDefault(emptyLocation, { homeLat: NaN, homeLng: 72.8 }),
    ).toBeNull();

    expect(
      resolveProfileLocationDefault(emptyLocation, { homeLat: 19.1, homeLng: Infinity }),
    ).toBeNull();
  });

  it('skips when profile or location is null or undefined', () => {
    expect(resolveProfileLocationDefault(emptyLocation, null)).toBeNull();
    expect(resolveProfileLocationDefault(emptyLocation, undefined)).toBeNull();
    expect(resolveProfileLocationDefault(null, validProfile)).toBeNull();
    expect(resolveProfileLocationDefault(undefined, validProfile)).toBeNull();
  });
});
