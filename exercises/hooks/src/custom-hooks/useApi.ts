import { useState, useEffect } from 'react';

/**
 * API Response State
 */
interface ApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * useApi Hook
 * 
 * Fetches data from an API endpoint and manages loading/error states.
 * Foundation for data fetching in React applications.
 * 
 * @param url - API endpoint URL
 * @returns { data, isLoading, error }
 * 
 * @example
 * const { data, isLoading, error } = useApi<User[]>('https://api.example.com/users');
 */
export function useApi<T>(url: string): ApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates after unmount

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Only update state if component is still mounted
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('An error occurred'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    // Cleanup function to prevent memory leaks
    return () => {
      isMounted = false;
    };
  }, [url]);

  return { data, isLoading, error };
}
