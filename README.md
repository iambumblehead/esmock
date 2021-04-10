esmock
======
**(c)[Bumblehead][0]**

[![npm version](https://badge.fury.io/js/esmock.svg)](https://badge.fury.io/js/esmock) [![Build Status](https://travis-ci.org/iambumblehead/esmock.svg?branch=master)](https://travis-ci.org/iambumblehead/esmock)



This package **must be used with node's experimental --loader,**
``` bash
ava --node-arguments="--loader=esmock"
mocha --loader=esmock
```


Add the command to your package.json,
``` json
{
  "name": "my-module",
  "type": "module",
  "scripts" : {
    "unit-test": "ava --node-arguments=\"--loader=esmock\""
  }
}
```


And use it
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



### changelog

 * 0.1.0 _Apr.10.2021_
   * adds support for native es modules

[0]: http://www.bumblehead.com "bumblehead"
