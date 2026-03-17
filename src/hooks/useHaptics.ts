import { useCallback } from 'react';

export function useHaptics() {
  const trigger = useCallback((type: 'light' | 'medium' | 'heavy' | 'success' | 'error' = 'light') => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      switch (type) {
        case 'light':
          window.navigator.vibrate(10);
          break;
        case 'medium':
          window.navigator.vibrate(20);
          break;
        case 'heavy':
          window.navigator.vibrate(30);
          break;
        case 'success':
          window.navigator.vibrate([10, 50, 20]);
          break;
        case 'error':
          window.navigator.vibrate([20, 50, 20, 50, 20]);
          break;
        default:
          window.navigator.vibrate(10);
      }
    }
  }, []);

  return { trigger };
}
