import { useLocation, useNavigate } from 'react-router-dom';

/** Go back within the app, or replace a direct entry with its fallback. */
export default function useAppBack(fallbackTo) {
  const navigate = useNavigate();
  const { key } = useLocation();

  return () => {
    // Changing a query param with replace can change the key without adding history.
    const index = globalThis.history?.state?.idx;
    const hasBack = typeof index === 'number' ? index > 0 : key !== 'default';
    if (hasBack) navigate(-1);
    else navigate(fallbackTo, { replace: true });
  };
}
