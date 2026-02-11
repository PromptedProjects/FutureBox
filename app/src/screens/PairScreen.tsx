import { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Device from 'expo-device';
import Btn from '../components/Btn';
import QRScanner from '../components/QRScanner';
import ManualPairInput from '../components/ManualPairInput';
import { pair } from '../services/api';
import { saveToken, saveHost } from '../services/storage';
import { useAuthStore } from '../stores/auth.store';
import { colors } from '../theme/tokens';

type Mode = 'qr' | 'manual';

function parseQR(data: string): { host: string; token: string } | null {
  try {
    // futurebox://pair?host=192.168.1.x:3737&token=xxx&tls=0
    const url = new URL(data);
    const rawHost = url.searchParams.get('host');
    const token = url.searchParams.get('token');
    const tls = url.searchParams.get('tls');
    if (rawHost && token) {
      // Prepend protocol based on tls flag (default to https)
      const protocol = tls === '0' ? 'http' : 'https';
      const host = rawHost.startsWith('http') ? rawHost : `${protocol}://${rawHost}`;
      return { host, token };
    }
  } catch {
    // not a valid URL
  }
  return null;
}

export default function PairScreen() {
  const [mode, setMode] = useState<Mode>('manual');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setAuth = useAuthStore((s) => s.setAuth);

  async function doPair(host: string, pairingToken: string) {
    setLoading(true);
    setError(null);

    try {
      const deviceName = Device.deviceName ?? Device.modelName ?? 'Phone';
      const res = await pair(host, {
        token: pairingToken,
        device_name: deviceName,
      });

      if (!res.ok) {
        setError(res.error);
        return;
      }

      // Store credentials and update state
      await Promise.all([
        saveToken(res.data.session_token),
        saveHost(host),
      ]);
      setAuth(res.data.session_token, host);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Pairing failed');
    } finally {
      setLoading(false);
    }
  }

  function handleQRScan(data: string) {
    const parsed = parseQR(data);
    if (!parsed) {
      Alert.alert('Invalid QR', 'This QR code is not a valid FutureBox pairing code.');
      return;
    }
    doPair(parsed.host, parsed.token);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.screen}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>FutureBox</Text>
          <Text style={styles.subtitle}>
            Scan the QR code on your FutureBox to pair.
          </Text>
        </View>

        {/* Mode toggle */}
        <View style={styles.modeToggle}>
          <Btn
            size="sm"
            backgroundColor={mode === 'qr' ? colors.accent : colors.bgElevated}
            color={mode === 'qr' ? 'white' : colors.textSecondary}
            onPress={() => setMode('qr')}
          >
            Scan QR
          </Btn>
          <Btn
            size="sm"
            backgroundColor={mode === 'manual' ? colors.accent : colors.bgElevated}
            color={mode === 'manual' ? 'white' : colors.textSecondary}
            onPress={() => setMode('manual')}
          >
            Manual
          </Btn>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {mode === 'qr' ? (
            <QRScanner onScan={handleQRScan} />
          ) : (
            <ManualPairInput onSubmit={doPair} loading={loading} />
          )}
        </View>

        {/* Error */}
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        {loading && (
          <Text style={styles.loadingText}>Connecting to FutureBox...</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: 24,
    gap: 24,
  },
  titleSection: {
    alignItems: 'center',
    gap: 8,
    paddingTop: 32,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
  },
  modeToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  content: {
    flex: 1,
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
    fontSize: 14,
  },
  loadingText: {
    color: colors.textSecondary,
    textAlign: 'center',
    fontSize: 14,
  },
});
