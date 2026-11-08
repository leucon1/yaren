import test from 'node:test';
import assert from 'node:assert/strict';
import { validateContact } from '../src/contact.mjs';

test('rejects empty and whitespace-only required fields', () => {
  assert.deepEqual(
    Object.keys(validateContact({ name: '  ', email: '', message: '\n' })),
    ['name', 'email', 'message'],
  );
});
test('rejects malformed email addresses', () => {
  for (const email of ['a', 'a@', 'a@b', 'a b@c.com', 'a@@b.com']) {
    assert.ok(validateContact({ name: 'Ada', email, message: 'Merhaba' }).email);
  }
});
test('accepts Turkish names and ordinary email addresses', () => {
  assert.deepEqual(
    validateContact({
      name: 'İpek Çağrı',
      email: ' ipek+kahve@example.com ',
      message: 'Bir kahve içelim.',
    }),
    {},
  );
});
