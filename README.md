```diff
+                                                ██╗
+ ██████╗  ███████╗ █████═████╗  ██████╗  ██████╗██║   ██╗
+██╔═══██╗██╔═════╝██╔══██╔══██╗██╔═══██╗██╔════╝██║  ██╔╝
+████████║╚██████╗ ██║  ██║  ██║██║   ██║██║     ██████╔╝
+██╔═════╝ ╚════██╗██║  ██║  ██║██║   ██║██║     ██╔══██╗
+╚███████╗███████╔╝██║  ██║  ██║╚██████╔╝╚██████╗██║  ╚██╗
+ ╚══════╝╚══════╝ ╚═╝  ╚═╝  ╚═╝ ╚═════╝  ╚═════╝╚═╝   ╚═╝
```
[![npm version](https://badge.fury.io/js/esmock.svg)](https://badge.fury.io/js/esmock) [![Build Status](https://github.com/iambumblehead/esmock/workflows/nodejs-ci/badge.svg)][2] [![install size](https://packagephobia.now.sh/badge?p=esmock)](https://packagephobia.now.sh/result?p=esmock) [![downloads](https://badgen.now.sh/npm/dm/esmock)](https://npmjs.org/package/esmock)

**esmock provides native ESM import mocking for unit tests.** Use examples below as a quick-start guide or use the [descriptive and friendly esmock guide here.][10]

[10]: https://github.com/iambumblehead/esmock/wiki
[0]: http://www.bumblehead.com "bumblehead"
[1]: https://github.com/iambumblehead/esmock/workflows/nodejs-ci/badge.svg "nodejs-ci pipeline"
[2]: https://github.com/iambumblehead/esmock "esmock"



`esmock` is used with node's --loader
``` json
{
  "name": "give-esmock-a-star",
  "type": "module",
  "scripts": {
    "test": "node --loader=esmock --test",
    "test-tap": "NODE_OPTIONS=--loader=esmock tap",
    "test-uvu": "NODE_OPTIONS=--loader=esmock uvu spec",
    "test-ava": "NODE_OPTIONS=--loader=esmock ava",
    "test-mocha": "mocha --loader=esmock"
  }
}
```

`esmock` has the below signature
``` javascript
await esmock(
  './to/module.js', // path to target module being tested
  { ...childmocks }, // mock definitions imported by target module
  { ...globalmocks }) // mock definitions imported everywhere
```

`esmock` examples
``` javascript
import test from 'node:test'
import assert from 'node:assert/strict'
import esmock from 'esmock'

test('should mock local files and packages', async () => {
  const main = await esmock('../src/main.js', {
    stringifierpackage: JSON.stringify,
    '../src/hello.js': {
      default: () => 'world',
      exportedFunction: () => 'foo'
    }
  })

  assert.strictEqual(main(), JSON.stringify({ test: 'world foo' }))
})

test('should do global instance mocks —third param', async () => {
  const { getFile } = await esmock('../src/main.js', {}, {
    fs: {
      readFileSync: () => 'returns this globally'
    }
  })

  assert.strictEqual(getFile(), 'returns this globally')
})

test('should mock "await import()" using esmock.p', async () => {
  // using esmock.p, mock definitions are kept in cache
  const doAwaitImport = await esmock.p('../awaitImportLint.js', {
    eslint: { ESLint: cfg => cfg }
  })

  // mock definition is returned from cache, when import is called
  assert.strictEqual(await doAwaitImport('cfg'), 'cfg')
})

// a "partial mock" merges the new and original definitions
test('should suppport partial mocks', async () => {
  const pathWrapStrict = await esmock('../src/pathWrap.js', {
    path: { dirname: () => '/path/to/file' }
  })

  // an error, because path.basename was not defined
  await assert.rejects(async () => pathWrapStrict.basename('/dog.png'), {
    name: 'TypeError',
    message: 'path.basename is not a function'
  })

  // use esmock.px to get a "partial mock"
  const pathWrapStrict = await esmock.px('../src/pathWrap.js', {
    path: { dirname: () => '/home/' }
  })

  // no error, because "core" path.basename is merged into the mock
  assert.deepEqual(pathWrapPartial.basename('/dog.png'), 'dog.png')
  assert.deepEqual(pathWrapPartial.dirname(), '/home/')
})
```
