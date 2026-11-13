const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const compiled = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src/pages/inbox/pagination.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const loaded = { exports: {} };
new Function('module', 'exports', compiled)(loaded, loaded.exports);
const { collectInboxPage, inboxPageSize } = loaded.exports;
const notice = (id, transactionId = 'tx', read = false) => ({ notificationId: id, transactionId, read });
const loader = batches => async page => ({ notifications: batches[page], hasNext: page < batches.length - 1 });

test('exactly one screen of unread transactions has no Next, even across mixed server pages', async () => {
  const result = await collectInboxPage(loader([[notice('read', 'tx', true), notice('a')], [notice('message', null), notice('b')]]), 'transactions', 0, 2);
  assert.deepEqual(result.notifications.map(n => n.notificationId), ['a', 'b']);
  assert.equal(result.hasNext, false);
});
test('overflow enables Next and second page contains only remaining matches', async () => {
  const load = loader([[notice('a'), notice('b')], [notice('c')]]);
  assert.equal((await collectInboxPage(load, 'transactions', 0, 2)).hasNext, true);
  const last = await collectInboxPage(load, 'transactions', 1, 2);
  assert.deepEqual(last.notifications.map(n => n.notificationId), ['c']);
  assert.equal(last.hasNext, false);
});
test('Messages excludes transaction notices, read messages, and duplicate IDs', async () => {
  const result = await collectInboxPage(loader([[notice('a'), notice('m', null)], [notice('m', null), notice('old', null, true), notice('n', '')]]), 'messages', 0, 3);
  assert.deepEqual(result.notifications.map(n => n.notificationId), ['m', 'n']);
  assert.equal(result.hasNext, false);
});
test('page capacity follows screen height and never drops below one', () => {
  assert.equal(inboxPageSize(300, 144), 2);
  assert.equal(inboxPageSize(456, 144), 3);
  assert.equal(inboxPageSize(300, 288), 1);
  assert.equal(inboxPageSize(20, 144), 1);
});
test('scan failures propagate instead of claiming an empty tab', async () => {
  await assert.rejects(collectInboxPage(async () => { throw new Error('offline'); }, 'messages', 0, 2), /offline/);
});
