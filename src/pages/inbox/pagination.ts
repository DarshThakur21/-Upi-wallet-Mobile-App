export type InboxSection = 'transactions' | 'messages';
export interface Notice {
  notificationId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  transactionId?: string | null;
}
export interface NoticeBatch { notifications: Notice[]; hasNext: boolean }

// Scan mixed server pages until there is one extra unread item in this tab.
export async function collectInboxPage(
  load: (page: number) => Promise<NoticeBatch>,
  section: InboxSection, page: number, pageSize: number,
) {
  const matches: Notice[] = [];
  const seen = new Set<string>();
  const start = page * pageSize;
  let sourcePage = 0;
  let hasNext = true;
  while (hasNext && matches.length <= start + pageSize) {
    const batch = await load(sourcePage++);
    for (const notice of batch.notifications) {
      if (seen.has(notice.notificationId)) continue;
      seen.add(notice.notificationId);
      if (!notice.read && Boolean(notice.transactionId?.trim()) === (section === 'transactions')) matches.push(notice);
    }
    hasNext = batch.hasNext;
  }
  return { notifications: matches.slice(start, start + pageSize), hasNext: matches.length > start + pageSize };
}

export function inboxPageSize(height: number, rowHeight: number) {
  return Math.max(1, Math.floor((height + 12) / (rowHeight + 12)));
}
