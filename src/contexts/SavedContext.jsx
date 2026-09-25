import { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'tibu-saved';

const defaultState = {
  savedProducts: [],
  savedBusinesses: [],
  savedReels: [],
};

const SavedContext = createContext(null);

export function SavedProvider({ children }) {
  const [saved, setSaved] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : defaultState;
    } catch {
      return defaultState;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  }, [saved]);

  const setSavedProducts = (products) =>
    setSaved((prev) => ({ ...prev, savedProducts: typeof products === 'function' ? products(prev.savedProducts) : products }));

  const setSavedBusinesses = (businesses) =>
    setSaved((prev) => ({ ...prev, savedBusinesses: typeof businesses === 'function' ? businesses(prev.savedBusinesses) : businesses }));

  const setSavedReels = (reels) =>
    setSaved((prev) => ({ ...prev, savedReels: typeof reels === 'function' ? reels(prev.savedReels) : reels }));

  return (
    <SavedContext.Provider
      value={{
        savedProducts: saved.savedProducts,
        savedBusinesses: saved.savedBusinesses,
        savedReels: saved.savedReels,
        setSavedProducts,
        setSavedBusinesses,
        setSavedReels,
      }}
    >
      {children}
    </SavedContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSaved() {
  const ctx = useContext(SavedContext);
  if (!ctx) throw new Error('useSaved must be used within SavedProvider');
  return ctx;
}
