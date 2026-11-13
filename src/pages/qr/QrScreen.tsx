import { styles } from './QrScreen.styles';
import { Text } from '../../components/Text';
import { useRef, useState } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router, useLocalSearchParams } from 'expo-router';
import { Linking, View, useWindowDimensions } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { api } from '../../services/accountApi';
import { Button, Card, Load, Screen, useScreenStyles } from '../../components/screen/Screen';

export function recipientFromQr(raw: string) {
  try {
    const uri = new URL(raw);
    if (uri.protocol !== 'upi:' || uri.hostname !== 'pay') return '';
    const id = uri.searchParams.get('pa')?.toLowerCase() ?? '';
    return /^[a-z0-9._-]+@wallet$/.test(id) ? id : '';
  } catch {
    return '';
  }
}
export default function Qr() {
  const st = useScreenStyles();
  const { scan } = useLocalSearchParams<{ scan?: string }>();
  const [camera, setCamera] = useState(scan === '1');
  const [permission, request] = useCameraPermissions();
  const [error, setError] = useState('');
  const consumed = useRef(false);
  const q = api.useQrQuery(undefined, { skip: camera });
  const { width } = useWindowDimensions();
  return (
    <Screen title={camera ? 'Scan recipient QR' : 'My payment QR'}>
      {camera ? (
        <Card title="Scan to pay">
          {permission?.granted ? (
            <CameraView
              style={styles.camera}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onMountError={() =>
                setError(
                  'Could not open the camera. Enter the UPI ID manually.',
                )
              }
              onBarcodeScanned={({ data }) => {
                if (consumed.current) return;
                const recipient = recipientFromQr(data);
                if (!recipient) {
                  setError(
                    'Scan a wallet recipient QR with an @wallet UPI ID.',
                  );
                  return;
                }
                consumed.current = true;
                router.replace({ pathname: '/payment', params: { recipient } });
              }}
            />
          ) : (
            <Button
              label={
                permission?.canAskAgain === false
                  ? 'Open camera settings'
                  : 'Allow camera access'
              }
              onPress={() => {
                if (permission?.canAskAgain === false)
                  void Linking.openSettings();
                else void request();
              }}
            />
          )}
          {!!error && <Text style={st.error}>{error}</Text>}
          <Button
            label="Enter UPI ID manually"
            onPress={() => router.replace('/payment')}
          />
        </Card>
      ) : q.data?.payload ? (
        <Card>
          <View
            style={styles.qrBackground}
          >
            <QRCode
              value={q.data.payload}
              size={Math.min(width - 110, 240)}
              quietZone={8}
            />
          </View>
          <Text
            style={styles.payee}
          >
            {q.data.payeeName}
          </Text>
          <Text selectable style={styles.upiId}>
            {q.data.upiId}
          </Text>
          <Text style={styles.caption}>Scan to pay</Text>
        </Card>
      ) : (
        <Load failed={q.isError || !!q.data} retry={q.refetch} />
      )}
      <Button
        label={camera ? 'Show my QR' : 'Scan recipient QR'}
        onPress={() => {
          consumed.current = false;
          setError('');
          setCamera(!camera);
        }}
      />
    </Screen>
  );
}
// // Certain pointers that need to be changed in the app
// 1 - Add the transaction animation during the transfers and deposits 
// 2 - add the upi pin during the my wallet workflow
// 3 - in the inbox remove the notifications that are marked as read 
