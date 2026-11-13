import { styles } from './ProfileScreen.styles';
import { useTheme } from '../../theme/ThemeProvider';
import { Text } from '../../components/Text';
import Feather from '@expo/vector-icons/Feather';
import { Pressable } from 'react-native';
import { api } from '../../services/accountApi';
import { Load, Screen } from '../../components/screen/Screen';
import { ProfileDetails } from './ProfileDetails';

export default function ProfileScreen() {
  const { colors, mode, toggle, storageError } = useTheme();
  const q = api.useProfileQuery();
  return (
    <Screen title="Profile" headerRight={
      <Pressable accessibilityRole="switch" accessibilityLabel="Dark mode" accessibilityState={{ checked: mode === 'dark' }}
        accessibilityHint={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} onPress={toggle}
        style={styles.themeToggle(colors)}>
        <Feather name={mode === 'dark' ? 'sun' : 'moon'} size={23} color={colors.text} />
      </Pressable>
    }>
      {!!storageError && <Text accessibilityRole="alert" style={styles.error(colors)}>{storageError}</Text>}
      {q.data ? (
        <ProfileDetails profile={q.data} />
      ) : (
        <Load failed={q.isError} retry={q.refetch} />
      )}
    </Screen>
  );
}
