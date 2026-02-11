import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Btn from './Btn';
import { colors } from '../theme/tokens';

interface QRScannerProps {
  onScan: (data: string) => void;
}

export default function QRScanner({ onScan }: QRScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text style={styles.infoText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.center, styles.permissionContainer]}>
        <Text style={[styles.infoText, { textAlign: 'center' }]}>
          Camera access is needed to scan the pairing QR code.
        </Text>
        <Btn
          backgroundColor={colors.accent}
          color="white"
          onPress={requestPermission}
        >
          Grant Camera Access
        </Btn>
      </View>
    );
  }

  return (
    <View style={styles.cameraContainer}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={
          scanned
            ? undefined
            : (result) => {
                setScanned(true);
                onScan(result.data);
              }
        }
      />
      {scanned && (
        <View style={styles.rescanOverlay}>
          <Btn
            backgroundColor={colors.accent}
            color="white"
            onPress={() => setScanned(false)}
          >
            Scan Again
          </Btn>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionContainer: {
    gap: 16,
    padding: 24,
  },
  infoText: {
    color: colors.text,
  },
  cameraContainer: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 12,
  },
  rescanOverlay: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
