/* eslint-disable */
import { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'tibu-profile';

const defaultProfile = {
  fullName: 'Laiba Merchant',
  username: 'laiba',
  phone: '',
  avatar: '👩',
  avatarUrl: null,
  avatarFile: null,
};

const defaultAddresses = [
  {
    id: 1,
    label: 'Home',
    address: 'Flat 302, Sunrise Apartments, 14th Road, Khar West, Mumbai, Maharashtra — 400052',
    selected: true,
  },
  {
    id: 2,
    label: 'Work',
    address: 'Office 5B, XYZ Tower, Andheri East, Mumbai, Maharashtra — 400069',
    selected: false,
  },
];

const defaultFilters = {
  category: 'All',
  distance: 'Anywhere',
  price: 'All',
};

const defaultState = {
  profile: defaultProfile,
  addresses: defaultAddresses,
  filters: defaultFilters,
};

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // avatarFile cannot be persisted (File object); always reset to null
        return {
          ...defaultState,
          ...parsed,
          profile: { ...defaultProfile, ...parsed.profile, avatarFile: null },
        };
      }
    } catch {
      /* ignore */
    }
    return defaultState;
  });

  useEffect(() => {
    // Don't persist avatarFile (File object is not JSON-serializable)
    // eslint-disable-next-line no-unused-vars
    const { avatarFile: _avatarFile, ...profileWithoutFile } = state.profile;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...state, profile: profileWithoutFile })
    );
  }, [state]);

  const setProfile = (profile) =>
    setState((prev) => ({
      ...prev,
      profile: typeof profile === 'function' ? profile(prev.profile) : profile,
    }));

  const setAddresses = (addresses) =>
    setState((prev) => ({
      ...prev,
      addresses: typeof addresses === 'function' ? addresses(prev.addresses) : addresses,
    }));

  const setFilters = (filters) =>
    setState((prev) => ({
      ...prev,
      filters: typeof filters === 'function' ? filters(prev.filters) : filters,
    }));

  const profileStats = {
    saved: 0, // will be computed from SavedContext in a later task
    reviews: 0,
    addresses: state.addresses.length,
  };

  return (
    <ProfileContext.Provider
      value={{
        profile: state.profile,
        setProfile,
        addresses: state.addresses,
        setAddresses,
        filters: state.filters,
        setFilters,
        profileStats,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}
