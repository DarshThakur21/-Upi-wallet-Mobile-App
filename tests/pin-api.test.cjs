const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

// Exercise the real RTK endpoints with an isolated session and mocked HTTP.
test('PIN verification sends one request and never fetches balances automatically', async () => {
  let refreshes = 0;
  let status = 401;
  const requests = [];
  const originalFetch = global.fetch;
  global.fetch = async request => {
    requests.push({ url: request.url, body: await request.json() });
    return new Response(JSON.stringify(status === 200 ? { verified: true } : { message: 'Invalid UPI PIN' }), {
      status, headers: { 'Content-Type': 'application/json' },
    });
  };
  const session = {
    gateway: 'https://wallet.test',
    currentSession: () => ({ accessToken: 'test-token', user: { id: 'test-user' } }),
    refresh: async () => { refreshes++; },
  };
  function load(file, overrides) {
    const source = fs.readFileSync(path.join(__dirname, '../src', file), 'utf8');
    const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    const module = { exports: {} };
    new Function('require', 'module', 'exports', compiled)(name => overrides[name] ?? require(name), module, module.exports);
    return module.exports;
  }
  const wallet = load('store/wallet.ts', { '../auth/session': session });
  const inbox = load('pages/inbox/pagination.ts', {});
  const { api } = load('services/accountApi.ts', { '../store/wallet': wallet, '../pages/inbox/pagination': inbox });
  try {
    const rejected = wallet.store.dispatch(api.endpoints.verifyPin.initiate('123456'));
    await assert.rejects(rejected.unwrap());
    rejected.reset();
    assert.equal(requests.length, 1, 'Incorrect PIN must not be replayed after a 401');
    assert.equal(refreshes, 0);
    status = 200;
    const accepted = wallet.store.dispatch(api.endpoints.verifyPin.initiate('654321'));
    assert.deepEqual(await accepted.unwrap(), { verified: true });
    accepted.reset();
    assert.deepEqual(requests.map(r => r.body), [{ pin: '123456' }, { pin: '654321' }]);
    assert.ok(requests.every(r => r.url.endsWith('/auth/upi-pin/verify')));
  } finally {
    wallet.store.dispatch(wallet.walletApi.util.resetApiState());
    global.fetch = originalFetch;
  }
});
