import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useQuery-style hook for fetching data from async services.
 *
 * @param {Function} queryFn - Async function returning a promise.
 * @returns {{ data: any, loading: boolean, error: Error|null, refetch: Function }}
 */
export function useAsync(queryFn) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const queryFnRef = useRef(queryFn);

  // Always keep ref up to date without re-triggering the effect
  useEffect(() => {
    queryFnRef.current = queryFn;
  });

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await queryFnRef.current();
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []); // stable — queryFn accessed via ref

  useEffect(() => {
    // eslint-disable-next-line
    execute();
  }, [execute]);

  return { data, loading, error, refetch: execute };
}
