import { styles } from './ProfileScreen.styles';
import { useTheme } from '../../theme/ThemeProvider';
import { Text } from '../../components/Text';
import { useState } from 'react';
import { Image, Keyboard, View } from 'react-native';
import { router } from 'expo-router';
import { api, message, profileFields, type Editable, type Profile } from '../../services/accountApi';
import { Button, Card, Field, Load, useScreenStyles } from '../../components/screen/Screen';
import { ProfileSection } from './ProfileSection';

type Section = 'personal' | 'account' | 'kyc' | 'pin';

export function ProfileDetails({ profile: p }: { profile: Profile }) {
  const st = useScreenStyles();
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState<Section | null>(null);
  const [editing, setEditing] = useState(false);
  const [changes, setChanges] = useState<Partial<Editable>>({});
  const [doc, setDoc] = useState(p.kycDocumentUrl || '');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [confirm, setConfirm] = useState('');
  const [feedback, setFeedback] = useState({ section: '', text: '' });
  const [save, profileState] = api.useSaveProfileMutation();
  const [kyc, kycState] = api.useKycMutation();
  const [savePin, pinState] = api.useSavePinMutation();
  const status = api.usePinQuery();
  function toggle(section: Section) {
    Keyboard.dismiss();
    if (expanded === 'pin') {
      setPassword('');
      setPin('');
      setConfirm('');
    }
    setExpanded(current => current === section ? null : section);
  }
  function report(section: string, text: string) {
    setFeedback({ section, text });
  }
  function note(section: string) {
    return (
      feedback.section === section && (
        <Text accessibilityLiveRegion="polite">{feedback.text}</Text>
      )
    );
  }
  const name = [p.firstName, p.lastName].filter(Boolean).join(' ');
  async function submitProfile() {
    try {
      await save(changes).unwrap();
      setChanges({});
      setEditing(false);
      report('personal', 'Profile saved.');
    } catch (e) {
      report('personal', message(e));
    }
  }
  async function submitPin() {
    if (!password || !/^\d{6}$/.test(pin) || pin !== confirm) {
      report('pin', 'Enter your password and two matching six-digit PINs.');
      return;
    }
    try {
      await savePin({
        currentPassword: password,
        newPin: pin,
        confirmPin: confirm,
      }).unwrap();
      report('pin', 'UPI PIN updated.');
    } catch (e) {
      report('pin', message(e));
    } finally {
      setPassword('');
      setPin('');
      setConfirm('');
    }
  }
  const names = Object.keys(profileFields) as (keyof Editable)[];
  return (
    <>
      <Card>
        <View style={styles.identityRow}>
          {p.profilePictureUrl ? (
            <Image
              source={{ uri: p.profilePictureUrl }}
              style={styles.avatar}
            />
          ) : (
            <View
              style={styles.avatarFallback(colors)}
            >
              <Text style={styles.initials}>
                {(p.firstName?.[0] ?? '') + (p.lastName?.[0] ?? '')}
              </Text>
            </View>
          )}
          <View style={styles.identityDetails}>
            <Text style={styles.name}>
              {name || 'Wallet account'}
            </Text>
            <Text selectable>{p.upiID}</Text>
            <Text>KYC · {p.kycStatus}</Text>
          </View>
        </View>
        <View style={st.actions}>
          <Button label="View QR" onPress={() => router.push('/qr')} />
          <Button label="View wallets" onPress={() => router.navigate('/wallets')} />
        </View>
      </Card>
      <ProfileSection title="Personal info" expanded={expanded === 'personal'} onPress={() => toggle('personal')}>
        {names.map((k) =>
          editing ? (
            <Field
              key={k}
              label={profileFields[k]}
              value={changes[k] ?? p[k] ?? ''}
              onChangeText={(v) =>
                setChanges((previous) => ({ ...previous, [k]: v }))
              }
            />
          ) : (
            <View key={k}>
              <Text style={styles.fieldLabel(colors)}>
                {profileFields[k]}
              </Text>
              <Text selectable>{p[k] || '—'}</Text>
            </View>
          ),
        )}
        {editing ? (
          <View style={st.actions}>
            <Button
              label="Save changes"
              disabled={profileState.isLoading}
              onPress={submitProfile}
            />
            <Button
              label="Cancel"
              disabled={profileState.isLoading}
              onPress={() => {
                setEditing(false);
                setChanges({});
              }}
            />
          </View>
        ) : (
          <Button label="Edit profile" onPress={() => setEditing(true)} />
        )}
        {note('personal')}
      </ProfileSection>
      <ProfileSection title="Account" expanded={expanded === 'account'} onPress={() => toggle('account')}>
        <Text>
          {p.active ? 'Active' : 'Inactive'} ·{' '}
          {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ''}
        </Text>
        <Text selectable>Wallet ID · {p.walletId || '—'}</Text>
      </ProfileSection>
      <ProfileSection title="KYC verification" expanded={expanded === 'kyc'} onPress={() => toggle('kyc')}>
        <Text>Status · {p.kycStatus}</Text>
        <Field
          label="Document URL"
          value={doc}
          onChangeText={setDoc}
          keyboardType="url"
        />
        <Button
          label="Submit for review"
          disabled={kycState.isLoading}
          onPress={async () => {
            if (!/^https?:\/\//i.test(doc.trim())) {
              report('kyc', 'Enter a document URL.');
              return;
            }
            try {
              await kyc(doc.trim()).unwrap();
              report('kyc', 'Submitted for review.');
            } catch (e) {
              report('kyc', message(e));
            }
          }}
        />
        {note('kyc')}
      </ProfileSection>
      <ProfileSection title="UPI PIN" expanded={expanded === 'pin'} onPress={() => toggle('pin')}>
        {status.data ? (
          <Text>
            {status.data.locked
              ? 'Locked'
              : status.data.configured
                ? 'PIN configured'
                : 'Set a PIN to send money'}
          </Text>
        ) : (
          <Load failed={status.isError} retry={status.refetch} />
        )}
        <Field
          label="Current password"
          value={password}
          secureTextEntry
          onChangeText={setPassword}
        />
        <Field
          label="New six-digit PIN"
          value={pin}
          secureTextEntry
          keyboardType="number-pad"
          maxLength={6}
          onChangeText={setPin}
        />
        <Field
          label="Confirm PIN"
          value={confirm}
          secureTextEntry
          keyboardType="number-pad"
          maxLength={6}
          onChangeText={setConfirm}
        />
        <Button
          label="Save UPI PIN"
          disabled={pinState.isLoading}
          onPress={submitPin}
        />
        {note('pin')}
      </ProfileSection>
    </>
  );
}
