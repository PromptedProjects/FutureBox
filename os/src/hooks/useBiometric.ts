import { useCallback, useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { useSettingsStore } from '../stores/settings.store';

export function useBiometric() {
  const { biometricEnabled, isLocked, setBiometricEnabled, setLocked } =
    useSettingsStore();

  const authenticate = useCallback(async (): Promise<boolean> => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock FutureBuddy',
      fallbackLabel: 'Use passcode',
      disableDeviceFallback: false,
    });
    if (result.success) {
      setLocked(false);
    }
    return result.success;
  }, [setLocked]);

  const checkHardware = useCallback(async (): Promise<boolean> => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return compatible && enrolled;
  }, []);

  const toggleBiometric = useCallback(async () => {
    if (!biometricEnabled) {
      const available = await checkHardware();
      if (!available) return false;
      setBiometricEnabled(true);
      return true;
    } else {
      setBiometricEnabled(false);
      setLocked(false);
      return true;
    }
  }, [biometricEnabled, setBiometricEnabled, setLocked, checkHardware]);

  // Lock on app background, unlock prompt on foreground
  useEffect(() => {
    if (!biometricEnabled) return;

    function handleAppState(nextState: AppStateStatus) {
      if (nextState === 'background' || nextState === 'inactive') {
        setLocked(true);
      }
      if (nextState === 'active' && useSettingsStore.getState().isLocked) {
        authenticate();
      }
    }

    const sub = AppState.addEventListener('change', handleAppState);
    return () => sub.remove();
  }, [biometricEnabled, setLocked, authenticate]);

  return { biometricEnabled, isLocked, authenticate, toggleBiometric, checkHardware };
}
