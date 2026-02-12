import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';
import ConnectionBanner from './src/components/ConnectionBanner';
import LockScreen from './src/screens/LockScreen';
import { useAuthStore } from './src/stores/auth.store';
import { useSettingsStore } from './src/stores/settings.store';
import { useBiometric } from './src/hooks/useBiometric';
import { getToken, getHost } from './src/services/storage';
import { colors } from './src/theme/tokens';

const navDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.bgSurface,
    text: colors.text,
    border: colors.border,
    primary: colors.accent,
  },
};

function AppContent() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { isLocked, authenticate } = useBiometric();

  if (isAuthenticated && isLocked) {
    return <LockScreen onUnlock={authenticate} />;
  }

  return (
    <View style={styles.appContent}>
      <ConnectionBanner />
      <RootNavigator />
    </View>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    (async () => {
      const [token, host] = await Promise.all([getToken(), getHost()]);
      if (token && host) {
        setAuth(token, host);
      }
      setReady(true);
    })();
  }, [setAuth]);

  if (!ready) return null;

  return (
    <ErrorBoundary>
      <NavigationContainer theme={navDarkTheme}>
        <AppContent />
        <StatusBar style="light" />
      </NavigationContainer>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  appContent: {
    flex: 1,
  },
});
