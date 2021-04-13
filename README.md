esmock
======
[![npm version](https://badge.fury.io/js/esmock.svg)](https://badge.fury.io/js/esmock) [![Build Status](https://travis-ci.org/iambumblehead/esmock.svg?branch=master)](https://travis-ci.org/iambumblehead/esmock)


**esmock _must_ be used with node's experimental --loader**
``` json
{
  "name": "give-esmock-a-star",
  "type": "module",
  "scripts": {
    "test-ava": "ava --node-arguments=\"--loader=esmock\"",
    "test-mocha": "mocha --loader=esmock"
  }
}
```


**Use it** `await esmock('./to/module.js', childmocks, globalmocks)`
``` javascript
import test from 'ava';
import esmock from 'esmock';

test('should mock modules and local files at same time', async t => {
  const main = await esmock('./local/main.js', {
    stringifierpackage : o => JSON.stringify(o),
    './local/util.js' : {
      exportedFunction : () => 'foobar'
    }
  });

  t.is(main(), JSON.stringify({ test : 'foobar' }));
});

test('should do "global" instance mocks (third parameter)', async t => {
  const { getFile } = await esmock('./local/main.js', {}, {
    fs : {
      readFileSync : () => {
        return 'anywhere the instance uses fs readFileSync';
      }
    }
  });

  t.is(getFile(), 'anywhere the instance uses fs readFileSync');
});
```


### changelog

 * 0.3.1 _Apr.12.2021_
   * simplify README
 * 0.3.0 _Apr.10.2021_
   * adds support for mocking modules 'globally' for the instance
 * 0.2.0 _Apr.10.2021_
   * adds support for mocking core modules such as fs and path
 * 0.1.0 _Apr.10.2021_
   * adds support for native esm modules


[0]: http://www.bumblehead.com "bumblehead"
