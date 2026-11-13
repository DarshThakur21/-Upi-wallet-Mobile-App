import { configureStore } from '@reduxjs/toolkit';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { FetchArgs } from '@reduxjs/toolkit/query';
import { currentSession, gateway, refresh } from '../auth/session';

interface Wallet {
  walletId: string;
  walletType: string;
  goalName?: string;
  balance: number;
}
const request = fetchBaseQuery({ baseUrl: gateway, timeout: 12000,
  prepareHeaders(headers) {
    const session = currentSession();
    if (session) {
      headers.set('Authorization', 'Bearer ' + session.accessToken);
      headers.set('X-User-Id', session.user.id);
    }
    return headers;
  },
});
export const walletApi = createApi({
  reducerPath: 'walletApi',
  tagTypes: ['Wallet', 'Activity', 'Profile', 'Pin', 'Inbox'],
  baseQuery: async (path: string | FetchArgs, api, options) => {
    const started = currentSession();
    let result = await request(path, api, options);
    // Never replay a PIN verification: one tap must mean one verification attempt.
    const pinVerification = typeof path !== 'string' && path.url === '/auth/upi-pin/verify';
    if (started && result.error?.status === 401 && !pinVerification) {
      try { await refresh(started); } catch { return result; }
      if (currentSession()?.user.id === started.user.id && !api.signal.aborted) {
        result = await request(path, api, options);
      }
    }
    return result;
  },
  endpoints: builder => ({
    wallets: builder.query<Wallet[], string>({ query: () => '/wallet/list', providesTags: ['Wallet'] }),
  }),
});
export const store = configureStore({
  reducer: { [walletApi.reducerPath]: walletApi.reducer },
  middleware: defaults => defaults().concat(walletApi.middleware),
});
