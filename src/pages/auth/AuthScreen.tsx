import { useAuthStyles } from './AuthScreen.styles';
import { Text } from '../../components/Text';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect } from 'expo-router';
import AuthForm from './AuthForm';
import { refresh, useSession } from '../../auth/session';
import { Action } from '../../components/ui/Ui';

export default function Home() {
  const s = useAuthStyles();
  const session = useSession();
  const [restoring, setRestoring] = useState(true);
  const [failure, setFailure] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    refresh(null)
      .catch((e: Error) => { if (active) setFailure(e.message); })
      .finally(() => { if (active) setRestoring(false); });
    return () => { active = false; };
  }, [attempt]);
  if (session) return <Redirect href="/wallets" />;
  return <SafeAreaView style={s.page}>
    {restoring ? <View style={s.content}><Text style={s.title}>UPI Wallet</Text><Text>Restoring your session…</Text><ActivityIndicator/></View>
      : failure ? <View style={s.content}><Text style={s.title}>Restore session</Text><Text>{failure}</Text>
        <Action label="Try again" onPress={() => {
          setRestoring(true);
          setFailure('');
          setAttempt(value => value + 1);
        }}/></View>
      : <AuthForm/>}
  </SafeAreaView>;
}
