import test from 'ava';
import esmock from '../src/esmock.js';

test('should pass a test', async t => {
  const main = await esmock('./local/main.js', {

  });
  
  t.is( typeof main, 'function' );
  t.is( main(), 'final word' )
});
