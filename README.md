esmock
======
[![npm version](https://badge.fury.io/js/esmock.svg)](https://badge.fury.io/js/esmock) [![Build Status](https://travis-ci.org/iambumblehead/esmock.svg?branch=master)](https://travis-ci.org/iambumblehead/esmock)


**esmock _must_ be used with "module" type and node's experimental --loader,**
This package **must be used with "module" type packages.** Add the type to your package.json,
``` json
{
  "name": "my-module",
  "type": "module",
  "scripts" : {
    "unit-test-ava": "ava --node-arguments=\"--loader=esmock\"",
    "unit-test-mocha": "mocha --loader=esmock"
  }
}
```


And use it `await esmock( './path/to/module', childmocks, globalmocks )`
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

test('should use "global" instance mocks, the third parameter', async t => {
  const main = await esmock('./local/main.js', {
    './local/mainUtil.js' : {
      exportedFunction : () => 'foobar'
    }
  }, {
    fs : {
      readFileSync : () => {
        return 'this value anywhere the instance imports fs, global';
      }
    }
  });

  const tplStr = main.readTemplateFile();
  t.is(tplStr, 'this value anywhere the instance imports fs, global');
});
```


### changelog

 * 0.3.0 _Apr.10.2021_
   * adds support for mocking modules 'globally' for the instance
 * 0.2.0 _Apr.10.2021_
   * adds support for mocking core modules such as fs and path
 * 0.1.0 _Apr.10.2021_
   * adds support for native esm modules


[0]: http://www.bumblehead.com "bumblehead"
