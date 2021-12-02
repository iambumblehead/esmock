esmock
======
[![npm version](https://badge.fury.io/js/esmock.svg)](https://badge.fury.io/js/esmock) [![Build Status](https://github.com/iambumblehead/esmock/workflows/nodejs-ci/badge.svg)][2]

**esmock provides native ESM import mocking for unit tests.** Use the examples below as a quick-start guide or use a [descriptive and more friendly esmock guide here.][10]


[10]: https://github.com/iambumblehead/esmock/wiki/How-to-use-esmock
[0]: http://www.bumblehead.com "bumblehead"
[1]: https://github.com/iambumblehead/esmock/workflows/nodejs-ci/badge.svg "nodejs-ci pipeline"
[2]: https://github.com/iambumblehead/esmock "esmock"



`esmock` must be used with node's experimental --loader
``` json
{
  "name": "give-esmock-a-star",
  "type": "module",
  "scripts": {
    "test-ava": "ava --node-arguments=\"--loader=esmock\"",
    "test-mocha": "mocha --loader=esmock --no-warnings"
  }
}
```

`esmock` has the following signature
``` javascript
await esmock(
  './to/module.js', // path to the target module being tested
  { ...childmocks }, // mocked definitions imported by the target module
  { ...globalmocks } // mocked definitions imported everywhere else
);
```

unit-test examples, using `esmock` and `ava` for various situations
``` javascript
import test from 'ava';
import esmock from 'esmock';

test('should mock local files, packages and core modules', async t => {
  const main = await esmock('../src/main.js', {
    fs: { readFileSync: () => 'give it a star' },
    stringifierpackage : o => JSON.stringify(o),
    '../src/hello.js' : {
      default : () => 'world'
    },
    '../src/util.js' : {
      exportedFunction : () => 'foobar'
    }
  });

  t.is(main(), JSON.stringify({ test : 'world foobar' }));
});

test('should do global instance mocks —third parameter', async t => {
  const { getFile } = await esmock('../src/main.js', {}, {
    fs : {
      readFileSync : () => {
        return 'anywhere the instance uses fs readFileSync';
      }
    }
  });

  t.is(getFile(), 'anywhere the instance uses fs readFileSync');
});

test('should mock "await import()" using esmock.p', async t => {
  // when esmock.p is used, mock definitions are not deleted from cache
  const doAwaitImport = await esmock.p('../src/awaitImportEslint.mjs', {
    eslint : { ESLint : config => config }
  });

  // the cached definition is there when import is called
  t.is(await doAwaitImport('config'), 'config');

  esmock.purge(doAwaitImport); // clear the cache, if you wish
});
```


<details>
   <summary>changelog</summary>
   <br/>

 * 1.5.0 _Dec.01.2021_
   * resolve bug around error '--loader=esmock' detection
 * 1.4.0 _Nov.30.2021_
   * throw error if esmock is called without --loader=esmock
 * 1.3.3 _Nov.28.2021_
   * update quick-start README to include phrase 'unit test'
 * 1.3.2 _Nov.27.2021_
   * use quick-start README with link to more descriptive README
 * 1.3.1 _Nov.26.2021_
   * add npm keywords, remove lines of code
 * 1.3.0 _Nov.26.2021_
   * add support for await import, update README
 * 1.1.0 _Nov.25.2021_
   * add windows-latest to testing pipeline and begin windows support
   * removed files and functions no longer needed
   * increment resolvewithplus package and other dependencies
 * 1.0.1 _Nov.02.2021_
   * add node v17.x to testing pipeline
   * add, make warning message go away for node 16.12.0+
 * 1.0.0 _Oct.27.2021_
   * release version 1.0
 * 0.4.2 _Oct.27.2021_
   * export 'load' hook from moduleLoader, required by node v16.12.0+
 * 0.4.1 _Oct.10.2021_
   * version bump, increment devDependencies,
   * major improvement to README, thanks @swivelgames
 * 0.4.0 _Sep.07.2021_
   * do not runtime error when returning type '[object Module]' default
 * 0.3.9 _May.05.2021_
   * small change to README
   * added a test, update gitlab action to use node 16.x
 * 0.3.8 _Apr.21.2021_
   * small change to README
 * 0.3.7 _Apr.20.2021_
   * add test, throw error if mocked module path is not found
 * 0.3.6 _Apr.19.2021_
   * throw error if mocked module path is not found
 * 0.3.5 _Apr.18.2021_
   * added gitlab actions npm test: node 12.x, 14.x and 15.x
 * 0.3.3 _Apr.13.2021_
   * added keywords to package.json, use github action to npm publish
 * 0.3.1 _Apr.12.2021_
   * simplify README
 * 0.3.0 _Apr.10.2021_
   * adds support for mocking modules 'globally' for the instance
 * 0.2.0 _Apr.10.2021_
   * adds support for mocking core modules such as fs and path
 * 0.1.0 _Apr.10.2021_
   * adds support for native esm modules

</details>
