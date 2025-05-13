'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * A hook that provides local storage functionality with type safety.
 * Handles serialization/deserialization of stored values and gracefully
 * handles errors. Synchronizes state across multiple components.
 *
 * @param key - The local storage key to use
 * @param initialValue - Initial value to use if no value exists in storage
 * @returns A tuple containing the stored value and a setter function
 *
 * @example
 * const [username, setUsername] = useLocalStorage<string>('username', '');
 * // Use username and setUsername like regular state
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // Get from local storage then parse stored json or return initialValue
  const readValue = useCallback((): T => {
    // Prevent build error on server
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Listen for changes to this localStorage key across other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key !== key) return;

      // If key was removed
      if (e.newValue === null) {
        setStoredValue(initialValue);
        return;
      }

      // If key was updated
      try {
        const newValue = JSON.parse(e.newValue) as T;
        setStoredValue(newValue);
      } catch (error) {
        console.warn(`Error parsing localStorage change for key "${key}":`, error);
      }
    };

    // Initial read from storage on mount
    setStoredValue(readValue());

    // Add event listener for syncing across tabs
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, readValue, initialValue]);

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Allow value to be a function to match useState API
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;

        // Save state
        setStoredValue(valueToStore);

        // Save to local storage
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));

          // Trigger storage event for other tabs/windows
          const event = new StorageEvent('storage', {
            key: key,
            newValue: JSON.stringify(valueToStore),
            oldValue: JSON.stringify(storedValue),
            storageArea: localStorage,
            url: window.location.href,
          });
          window.dispatchEvent(event);
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}
