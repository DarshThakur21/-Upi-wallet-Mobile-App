// Source: ../../../theme/design.md. Essential secondary text is darkened for readability.
export const colors = {
  background: '#FFFFFF', navigation: '#F7F7FA', surface: '#FFFFFF',
  subtle: '#F8F8F8', lavender: '#F3F3FF', charcoal: '#30312F',
  ring: '#A7B8BF', text: '#30312F', muted: '#686868',
  inverse: '#FFFFFF', inverseMuted: '#C8C8C8', border: '#EEEEF0',
  error: '#932D28', success: '#236544',
};
export const radius = { control: 6, input: 12, card: 24, feature: 32, circle: 999 };
export const typography = {
  screen: { fontSize: 28, lineHeight: 34, fontWeight: '700' as const, letterSpacing: -0.5 },
  section: { fontSize: 20, lineHeight: 26, fontWeight: '600' as const },
  card: { fontSize: 18, lineHeight: 24, fontWeight: '600' as const },
  body: { fontSize: 14, lineHeight: 20 },
};
export const shadows = { row: '0px 4px 12px rgba(32,33,39,0.04)', navigation: '0px -4px 16px rgba(32,33,39,0.03)' };

export type ThemeColors = typeof colors;
