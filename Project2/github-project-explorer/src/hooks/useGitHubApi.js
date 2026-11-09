import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { getRateLimitState, subscribeRateLimit } from '../services/githubService';

/**
 * Wraps any githubService function with loading / error / data state.
 *
 *   const { data, loading, error, execute } = useGitHubApi(searchRepositories);
 *   execute({ query: 'react' });
 *
 * - `execute` is referentially stable, so it is safe in effect dependency lists.
 * - Out-of-order responses are ignored (only the latest call updates state).
 * - Nothing is set after unmount.
 * - `execute` resolves with the data, or `undefined` if the call failed
 *   (the failure is available in `error`).
 */
export function useGitHubApi(apiFunction) {
  const [state, setState] = useState({ data: null, loading: false, error: null });
  const requestId = useRef(0);
  const mounted = useRef(true);
  const fnRef = useRef(apiFunction);
  fnRef.current = apiFunction;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const execute = useCallback(async (...args) => {
    const id = ++requestId.current;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await fnRef.current(...args);
      if (mounted.current && id === requestId.current) {
        setState({ data, loading: false, error: null });
      }
      return data;
    } catch (err) {
      if (mounted.current && id === requestId.current) {
        setState({ data: null, loading: false, error: err.message || 'Request failed' });
      }
      return undefined;
    }
  }, []);

  const reset = useCallback(() => {
    requestId.current += 1;
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}

/** Live view of the latest GitHub rate-limit headers. */
export function useRateLimit() {
  return useSyncExternalStore(subscribeRateLimit, getRateLimitState);
}
