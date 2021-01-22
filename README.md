esmock
======
**(c)[Bumblehead][0]**

[![Build Status](https://travis-ci.org/iambumblehead/esmock.svg?branch=master)](https://travis-ci.org/iambumblehead/esmock)

``` javascript
import test from 'ava';
import esmock from 'esmock';

test('should mock module and local file at the same time', async t => {
  const main = await esmock('./local/main.js', {
    'astringifierpackage' : o => JSON.stringify(o),
    './local/util.js' : {
      exportedFunction : () => 'foobar'
    }
  });

  t.is(main(), 'foobar, ' + JSON.stringify({ test: 'object' }));
});
```


[0]: http://www.bumblehead.com "bumblehead"
