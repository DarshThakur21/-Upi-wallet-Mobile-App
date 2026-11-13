import type { ViewStyle, TextStyle } from 'react-native';

export const styles = {
  camera: ({ height: 300 }) satisfies ViewStyle,
  qrBackground: ({
              alignSelf: 'center',
              padding: 10,
              backgroundColor: 'white',
            }) satisfies ViewStyle,
  payee: ({ textAlign: 'center', fontWeight: '700', fontSize: 21 }) satisfies TextStyle,
  upiId: ({ textAlign: 'center' }) satisfies TextStyle,
  caption: ({ textAlign: 'center' }) satisfies TextStyle,
};
