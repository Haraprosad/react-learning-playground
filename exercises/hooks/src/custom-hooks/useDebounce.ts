import { useEffect, useState } from 'react';

/**
 * useDebounce Hook
 * 
 * Delays updating a value until after a specified delay period.
 * Useful for optimizing API calls from search inputs.
 * 
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 500ms)
 * @returns The debounced value
 * 
 * @example
 * const searchTerm = useDebounce(inputValue, 500);
 * // searchTerm only updates 500ms after user stops typing
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up a timer to update the debounced value after the delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup function: clear the timeout if value changes before delay completes
    // This is crucial for preventing unnecessary updates
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
