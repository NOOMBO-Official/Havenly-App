export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning' = 'light') => {
  if (typeof window === 'undefined' || !navigator.vibrate) return;

  try {
    switch (type) {
      case 'light':
        navigator.vibrate(10);
        break;
      case 'medium':
        navigator.vibrate(20);
        break;
      case 'heavy':
        navigator.vibrate(30);
        break;
      case 'success':
        navigator.vibrate([10, 30, 20]);
        break;
      case 'error':
        navigator.vibrate([20, 40, 20, 40, 20]);
        break;
      case 'warning':
        navigator.vibrate([20, 30, 20]);
        break;
      default:
        navigator.vibrate(10);
    }
  } catch (e) {
    // Ignore errors on devices that don't support vibration
  }
};
