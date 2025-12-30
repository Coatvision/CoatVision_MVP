import { useState, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Link } from 'expo-router';
import {
  CameraView,
  CameraType,
  useCameraPermissions,
} from 'expo-camera';

import { ThemedText, ThemedView } from '@/components/Themed';
import {
  analyzeLive,
  type CoatVisionResult,
} from '@/src/config/api/coatvision';
import { addHistoryEntry } from '@/src/config/storage/history';
import { ModeBadge } from '@/components/coatvision/ModeBadge';
import { LoadingCard } from '@/components/coatvision/LoadingCard';
import { ResultCard } from '@/components/coatvision/ResultCard';

type ScanResult = CoatVisionResult;

export default function LiveScreen() {
  const cameraRef = useRef<CameraView>(null);
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  if (!permission) {
    return (
      <View style={styles.container}>
        <ThemedText style={styles.loadingText}>
          Laster kameratilgang...
        </ThemedText>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <ThemedView style={styles.permissionCard}>
          <ThemedText type="title" style={styles.title}>
            Tillat bruk av kamera
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            For å bruke live-modus må LYXvision få tilgang til kameraet på enheten.
          </ThemedText>

          <Pressable style={styles.scanButton} onPress={requestPermission}>
            <ThemedText style={styles.scanButtonText}>
              Gi kameratilgang
            </ThemedText>
          </Pressable>

          <Link href="/" asChild>
            <Pressable style={styles.navButtonSecondary}>
              <ThemedText style={styles.navButtonSecondaryText}>
                Tilbake til hovedside
              </ThemedText>
            </Pressable>
          </Link>
        </ThemedView>
      </View>
    );
  }

  const handleToggleFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const handleScan = async () => {
    try {
      setIsScanning(true);
      setScanResult(null);

      if (!cameraRef.current) {
        console.warn('Camera ref not available');
        return;
      }

      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.4,
        skipProcessing: true,
      });

      if (!photo?.base64) {
        console.warn('No base64 data returned from camera');
        return;
      }

      const result = await analyzeLive({
        mode: 'live',
        frameBase64: photo.base64,
        frameFormat: 'jpg',
      });

      setScanResult(result);

      await addHistoryEntry({
        mode: 'live',
        source: 'live-screen',
        result,
      });
    } catch (error) {
      console.error('Error during live scan:', error);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header-tekst over kameraet */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <ThemedText type="title" style={styles.title}>
              Live kamera-modus
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Pek kamera mot panelet for å simulere hvordan CoatVision kan markere
              coating-dekning i sanntid. Resultatene lagres i historikken.
            </ThemedText>
          </View>
          <ModeBadge />
        </View>
      </View>

      {/* Kamera-område */}
      <View style={styles.cameraWrapper}>
        <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
          <View style={styles.cameraOverlay}>
            <View style={styles.overlayBox}>
              <ThemedText style={styles.overlayTitle}>
                CoatVision overlay – demo
              </ThemedText>
              <ThemedText style={styles.overlayMeta}>
                Sentrer et panel i rammen og trykk «Skann panel» for en
                prototype-vurdering av dekning.
              </ThemedText>

              {isScanning && <LoadingCard mode="live" />}

              {scanResult && <ResultCard result={scanResult} />}

              <View style={styles.overlayButtonsRow}>
                <Pressable style={styles.flipButton} onPress={handleToggleFacing}>
                  <ThemedText style={styles.flipButtonText}>
                    Bytt kamera
                  </ThemedText>
                </Pressable>

                <Pressable
                  style={[
                    styles.scanButton,
                    isScanning && styles.scanButtonDisabled,
                  ]}
                  onPress={handleScan}
                  disabled={isScanning}
                >
                  <ThemedText style={styles.scanButtonText}>
                    {isScanning ? 'Skanner...' : 'Skann panel'}
                  </ThemedText>
                </Pressable>
              </View>
            </View>
          </View>
        </CameraView>
      </View>

      {/* Info + navigasjon under kameraet */}
      <ThemedView style={styles.infoCard}>
        <ThemedText style={styles.infoTitle}>
          Hva gjør live-modus i denne prototypen?
        </ThemedText>
        <ThemedText style={styles.infoText}>
          Her simulerer vi hvordan en ferdig modell kan gi vurdering av dekning
          direkte i kameraet. Alle skanninger lagres i historikk-modulen, slik at du
          senere kan se tilbake på tidligere tester.
        </ThemedText>

        <View style={styles.navRow}>
          <Link href="/history" asChild>
            <Pressable style={styles.navButton}>
              <ThemedText style={styles.navButtonText}>
                Se historikk
              </ThemedText>
            </Pressable>
          </Link>

          <Link href="/" asChild>
            <Pressable style={styles.navButtonSecondary}>
              <ThemedText style={styles.navButtonSecondaryText}>
                Tilbake til hovedside
              </ThemedText>
            </Pressable>
          </Link>
        </View>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#020617',
  },

  header: {
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#e5e7eb',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#9ca3af',
  },

  cameraWrapper: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#0f172a',
    marginBottom: 14,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 12,
  },
  overlayBox: {
    borderRadius: 20,
    padding: 12,
    backgroundColor: 'rgba(15,23,42,0.86)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.4)',
  },
  overlayTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#e5e7eb',
    marginBottom: 4,
  },
  overlayMeta: {
    fontSize: 11,
    color: '#d1d5db',
    marginBottom: 6,
  },

  overlayButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  flipButton: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: 'rgba(15,23,42,0.95)',
    borderWidth: 1,
    borderColor: '#4b5563',
  },
  flipButtonText: {
    fontSize: 12,
    color: '#e5e7eb',
  },
  scanButton: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#22c55e',
  },
  scanButtonDisabled: {
    opacity: 0.6,
  },
  scanButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#022c22',
  },

  infoCard: {
    borderRadius: 20,
    padding: 14,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#111827',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e5e7eb',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 12,
    color: '#d1d5db',
  },

  navRow: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 8,
  },
  navButton: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#22c55e',
  },
  navButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#022c22',
  },
  navButtonSecondary: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#374151',
  },
  navButtonSecondaryText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#e5e7eb',
  },

  permissionCard: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 24,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#111827',
    justifyContent: 'center',
    gap: 12,
  },

  loadingText: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: '#e5e7eb',
    fontSize: 13,
  },
});
