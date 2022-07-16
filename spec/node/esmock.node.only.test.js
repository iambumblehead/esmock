import test from 'node:test';
import assert from 'assert';
import esmock from '../../src/esmock.js';

// this error can occur when sources do not define 'esmockloader'
// on 'global' but use a process linked variable instead
test('should not error when esmock used with ava.only', {
  only : true
}, async () => {
  await esmock('../local/mainUtil.js', {
    'form-urlencoded' : () => 'mock encode'
  });

  assert.ok(true);
});
