import * as SecureStore from 'expo-secure-store';
import { useSyncExternalStore } from 'react';

export const gateway = process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, '');
const tokenKey = 'upi.wallet.refresh';
type User = { id: string; name: string; username: string };
type Session = { user: User; accessToken: string };
let session: Session | null = null;
const listeners = new Set<() => void>();

export const currentSession = () => session;
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
export const useSession = () => useSyncExternalStore(subscribe, currentSession);

function publish(value: Session | null) {
  session = value;
  listeners.forEach(listener => listener());
}

class AuthError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

async function post(path: string, body: object, token?: string) {
  if (!gateway) throw new Error('Set EXPO_PUBLIC_API_URL to your gateway address and restart Expo.');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(gateway + '/auth/' + path, {
      method: 'POST', signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new AuthError(data?.message || 'Request failed (' + response.status + ').', response.status);
    return data;
  } catch (error) {
    if (error instanceof AuthError) throw error;
    throw new Error('Could not reach the wallet gateway. Check your Wi-Fi and try again.');
  } finally { clearTimeout(timer); }
}

async function establish(path: string, values: object) {
  const data = await post(path, values);
  if (!data?.user?.id || !data.accessToken || !data.refreshToken) throw new Error('The gateway returned an incomplete session.');
  await SecureStore.setItemAsync(tokenKey, data.refreshToken);
  publish({ user: data.user, accessToken: data.accessToken });
}

// Serialize secure-storage updates so a late refresh cannot undo sign-out.
let pending = Promise.resolve();
function serial(work: () => Promise<void>) {
  const result = pending.then(work);
  pending = result.catch(() => {});
  return result;
}

export function authenticate(path: 'login' | 'register', values: object) {
  return serial(() => establish(path, values));
}

export function refresh(expected: Session | null) {
  return serial(async () => {
    if (session !== expected) return;
    const token = await SecureStore.getItemAsync(tokenKey);
    if (!token) { publish(null); return; }
    try { await establish('refresh', { refreshToken: token }); }
    catch (error) {
      if (!(error instanceof AuthError && error.status === 401)) throw error;
      await SecureStore.deleteItemAsync(tokenKey);
      publish(null);
    }
  });
}

export function signOut() {
  return serial(async () => {
    const token = await SecureStore.getItemAsync(tokenKey);
    const access = session?.accessToken;
    await SecureStore.deleteItemAsync(tokenKey);
    publish(null);
    if (token) await post('logout', { refreshToken: token }, access).catch(() => {});
  });
}
