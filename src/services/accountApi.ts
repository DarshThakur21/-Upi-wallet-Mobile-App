import { walletApi } from '../store/wallet';
import { collectInboxPage, type InboxSection, type NoticeBatch } from '../pages/inbox/pagination';

export const profileFields = {
  firstName: 'First name',
  lastName: 'Last name',
  phone: 'Phone',
  address: 'Street address',
  city: 'City',
  state: 'State',
  pincode: 'Pincode',
  profilePictureUrl: 'Profile photo URL',
};
export type Editable = Record<keyof typeof profileFields, string>;
export type Profile = Editable & {
  upiID: string;
  walletId: string;
  active: boolean;
  kycStatus: string;
  kycDocumentUrl: string;
  createdAt: string;
};
export interface Transaction {
  transactionId: string;
  senderId: string;
  receiverId: string;
  senderUpiId: string;
  receiverUpiId: string;
  type: string;
  status: string;
  amount: number;
  remarks: string;
  failureReason: string;
  createdAt: string;
  initiatedAt: string;
}
interface Page {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
}
interface Notice {
  notificationId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  transactionId: string;
}
type Payment = { amount: number; idempotencyKey: string } & (
  | { receiverUpiId: string; remarks: string; upiPin: string }
  | { upiId: string; description: string }
);
const put = (url: string, body: object) => ({ url, method: 'PUT', body });
export const api = walletApi.injectEndpoints({
  endpoints: (b) => ({
    profile: b.query<Profile, void>({
      query: () => '/users/profile',
      providesTags: ['Profile'],
    }),
    saveProfile: b.mutation<Profile, Partial<Editable>>({
      query: (body) => put('/users/update-profile', body),
      invalidatesTags: ['Profile'],
    }),
    kyc: b.mutation<Profile, string>({
      query: (kycDocumentUrl) =>
        put('/users/update-kyc', { kycDocumentUrl, kycStatus: 'PENDING' }),
      invalidatesTags: ['Profile'],
    }),
    qr: b.query<{ upiId: string; payeeName: string; payload: string }, void>({
      query: () => '/users/qr-data',
      providesTags: ['Profile'],
    }),
    pin: b.query<{ configured: boolean; locked: boolean }, void>({
      query: () => '/auth/upi-pin/status',
      providesTags: ['Pin'],
    }),
    verifyPin: b.mutation<{ verified: boolean }, string>({
      query: (pin) => ({ url: '/auth/upi-pin/verify', method: 'POST', body: { pin } }),
      invalidatesTags: ['Pin'],
    }),
    savePin: b.mutation<
      unknown,
      { currentPassword: string; newPin: string; confirmPin: string }
    >({
      query: (body) => put('/auth/upi-pin', body),
      invalidatesTags: ['Pin'],
    }),
    history: b.query<Page & { transactions: Transaction[] }, number>({
      query: (p) => '/transaction/history?page=' + p + '&size=10',
      providesTags: ['Activity'],
    }),
    transaction: b.query<Transaction, string>({
      query: (id) => '/transaction/' + encodeURIComponent(id),
    }),
    pay: b.mutation<Transaction, Payment>({
      query: (body) => ({
        url:
          'receiverUpiId' in body
            ? '/transaction/transfer'
            : '/transaction/deposit',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Wallet', 'Activity', 'Inbox'],
    }),
    notices: b.query<Page & { notifications: Notice[] }, number>({
      query: (p) => '/notification?page=' + p + '&size=15',
      providesTags: ['Inbox'],
    }),
    inbox: b.query<NoticeBatch, { section: InboxSection; page: number; pageSize: number }>({
      async queryFn({ section, page, pageSize }, _api, _options, baseQuery) {
        try {
          const data = await collectInboxPage(async sourcePage => {
            const result = await baseQuery('/notification?page=' + sourcePage + '&size=50');
            if (result.error) throw result.error;
            return result.data as NoticeBatch;
          }, section, page, pageSize);
          return { data };
        } catch (error) {
          return { error: error as import('@reduxjs/toolkit/query').FetchBaseQueryError };
        }
      },
      providesTags: ['Inbox'],
    }),
    unread: b.query<{ unreadCount: number }, void>({
      query: () => '/notification/unread-count',
      providesTags: ['Inbox'],
    }),
    read: b.mutation<unknown, string>({
      query: (id) => ({
        url: '/notification/' + encodeURIComponent(id) + '/read',
        method: 'PATCH',
      }),
      invalidatesTags: ['Inbox'],
    }),
  }),
});

export function message(error: unknown) {
  if (
    error &&
    typeof error === 'object' &&
    'data' in error &&
    error.data &&
    typeof error.data === 'object' &&
    'message' in error.data &&
    typeof error.data.message === 'string'
  )
    return error.data.message;
  return 'The request could not be confirmed. Check your connection and try again.';
}
export const money = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(
    n,
  );
