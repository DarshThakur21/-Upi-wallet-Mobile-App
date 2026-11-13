# Source structure

- `app/`: Expo Router entry files and the root navigation layout. Each route re-exports its page; do not place helpers or styles here.
- `pages/`: Page modules for auth, wallets, activity, payment, receipt, profile, QR, and inbox. Each page has a `*Screen.tsx` and matching `*Screen.styles.ts`.
- `pages/profile/`: `ProfileDetails` owns form state; `ProfileSection` renders an accordion section; `ProfileScreen` owns the page header and appearance toggle.
- `pages/inbox/`: `InboxScreen` owns tabs and sizing; `InboxPage` owns the list and detail dialog; `pagination.ts` selects unread items from mixed server pages.
- `components/`: Shared text, screen/form primitives, navigation, and transaction animation. Component styles live beside their components in `*.styles.ts` files.
- `theme/`: Shared design tokens and the persisted light/dark appearance provider.
- `services/`: Account, transaction, and notification API endpoints.
- `store/`: Redux store, authenticated base query, and wallet endpoints.
- `auth/`: Session restoration, authentication, and sign-out.

Keep page-specific styles beside the page. Use named style entries and typed factory arguments for theme colors or other dynamic values. Put reusable primitives in `components/` and shared design values in `theme/tokens.ts`.

Route URLs and backend endpoints are unchanged by this organization. The existing tests in `tests/` cover inbox pagination and PIN request behavior.
