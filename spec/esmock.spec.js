import test from 'ava';
import esmock from '../src/esmock.js';

test('should pass a test', async t => {
    console.log('load mock defs');
  const main = await esmock('./local/main.js', {
      './local/mainUtil.js': {
          createString: () => 'test string'
      }
  });
  
  t.is( typeof main, 'function' );
  t.is( main(), 'main string, test string' );
});
