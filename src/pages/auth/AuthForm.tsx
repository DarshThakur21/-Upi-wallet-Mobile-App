import { styles } from './AuthForm.styles';
import { Text } from '../../components/Text';
import { useState } from 'react';
import { ScrollView, TextInput, View } from 'react-native';
import { authenticate } from '../../auth/session';
import { Action, useUiStyles } from '../../components/ui/Ui';

export default function AuthForm() {
  const s = useUiStyles();
  const [register, setRegister] = useState(false);
  const [fields, setFields] = useState({ identifier: '', name: '', email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit() {
    if (busy) return;
    setBusy(true);
    setError('');
    const identifier = fields.identifier.trim();
    const password = fields.password;
    try {
      if (!identifier || !password) throw new Error('Enter your username or email and your password.');
      if (register && (!fields.name.trim() || !fields.email.trim())) throw new Error('Enter your full name and email.');
      if (register) await authenticate('register', { username: identifier, password, name: fields.name.trim(), email: fields.email.trim() });
      else await authenticate('login', { identifier, password });
    } catch (e) { setError(e instanceof Error ? e.message : 'Please try again.'); }
    finally { setBusy(false); }
  }
  function field(key: keyof typeof fields, label: string) {
    return <View style={styles.field}><Text style={s.label}>{label}</Text>
      <TextInput accessibilityLabel={label} editable={!busy} value={fields[key]} style={s.input}
        secureTextEntry={key === 'password'} autoCapitalize={key === 'name' ? 'words' : 'none'} autoCorrect={false}
        keyboardType={key === 'email' ? 'email-address' : 'default'}
        onChangeText={value => setFields(previous => ({ ...previous, [key]: value }))}/>
    </View>;
  }
  return <ScrollView keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets contentContainerStyle={s.content}>
    <Text style={s.label}>UPI Wallet</Text>
    <Text style={s.title}>{register ? 'Create account' : 'Sign in'}</Text>
    {register && field('name', 'Full name')}
    {field('identifier', register ? 'Username' : 'Username or email')}
    {register && field('email', 'Email')}
    {field('password', 'Password')}
    {register && <Text>Use 8–100 characters, including uppercase, lowercase, a digit and one of @$!%*?&.</Text>}
    {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
    <Action label={busy ? 'Please wait…' : register ? 'Create account' : 'Sign in'} disabled={busy} onPress={submit}/>
    <Text accessibilityRole="button" style={s.label} onPress={() => {
      if (busy) return;
      setRegister(!register); setError(''); setFields({ identifier: '', name: '', email: '', password: '' });
    }}>{register ? 'Back to sign in' : 'Create an account'}</Text>
  </ScrollView>;
}
