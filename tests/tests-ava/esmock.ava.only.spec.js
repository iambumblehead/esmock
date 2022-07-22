import test from 'ava';
import esmock from '../../src/esmock.js';

// this error can occur when sources do not define 'esmockloader'
// on 'global' but use a process linked variable instead
test.only('should not error when esmock used with ava.only', async t => {
  await esmock('../local/mainUtil.js', {
    'form-urlencoded' : () => 'mock encode'
  });

  t.pass();
});
