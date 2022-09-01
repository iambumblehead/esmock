```diff
+                                                ██╗
+ ██████╗  ███████╗ █████═████╗  ██████╗  ██████╗██║   ██╗
+██╔═══██╗██╔═════╝██╔══██╔══██╗██╔═══██╗██╔════╝██║  ██╔╝
+████████║╚██████╗ ██║  ██║  ██║██║   ██║██║     ██████╔╝
+██╔═════╝ ╚════██╗██║  ██║  ██║██║   ██║██║     ██╔══██╗
+╚███████╗███████╔╝██║  ██║  ██║╚██████╔╝╚██████╗██║  ╚██╗
+ ╚══════╝╚══════╝ ╚═╝  ╚═╝  ╚═╝ ╚═════╝  ╚═════╝╚═╝   ╚═╝
```
![npm](https://img.shields.io/npm/v/esmock) [![Coverage](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/iambumblehead/166d927bd0089d7bfdee4e98a537712c/raw/esmock__heads_master.json)][2] [![install size](https://packagephobia.now.sh/badge?p=esmock)](https://packagephobia.now.sh/result?p=esmock) [![downloads](https://badgen.now.sh/npm/dm/esmock)](https://npmjs.org/package/esmock)

**esmock provides native ESM import mocking for unit tests.** Use examples below as a quick-start guide, see the [descriptive and friendly esmock guide here,][10] or browse [esmock's test runner examples.][3]

[10]: https://github.com/iambumblehead/esmock/wiki
[0]: http://www.bumblehead.com "bumblehead"
[1]: https://github.com/iambumblehead/esmock/workflows/nodejs-ci/badge.svg "nodejs-ci pipeline"
[2]: https://github.com/iambumblehead/esmock "esmock"
[3]: https://github.com/iambumblehead/esmock/tree/master/tests "tests"


`esmock` is used with node's --loader
``` json
{
  "name": "give-esmock-a-star",
  "type": "module",
  "scripts": {
    "test": "node --loader=esmock --test",
    "test-mocha": "mocha --loader=esmock",
    "test-tap": "NODE_OPTIONS=--loader=esmock tap",
    "test-ava": "NODE_OPTIONS=--loader=esmock ava",
    "test-uvu": "NODE_OPTIONS=--loader=esmock uvu spec",
    "test-tsm": "node --loader=tsm --loader=esmock --test *ts",
    "test-ts-node": "node --loader=ts-node/esm --loader=esmock --test *ts",
    "test-jest": "NODE_OPTIONS=--loader=esmock jest"
  },
  "jest": {
    "runner": "jest-light-runner"
  },
}
```

`esmock` has the below signature
``` javascript
await esmock(
  './to/module.js', // path to target module being tested
  { ...childmocks }, // mock definitions imported by target module
  { ...globalmocks }) // mock definitions imported everywhere
```


`esmock` requires one to choose and import a specific variant, either "strict" or "partial". The strict variant gives un-modified mock definitions. The partial variant gives mock definitions that are merged with the original module definitions. Both variants are demonstrated below,

_./dogpath.js_
``` javascript
import path from 'path'

export default () => path.join(path.dirname('/path/cat'), 'dog')
```

_./dogpath.test.js_
``` javascript
import test from 'node:test'
import assert from 'node:assert/strict'
import esmockStrict from 'esmock/strict'
import esmockPartial from 'esmock/partial'

test('should suppport strict and partial mocking', async () => {
  const dogpathStrict = await esmockStrict('./dogpath.js', {
    path: { dirname: () => '/image/' }
  })
  const dogpathPartial = await esmockPartial('./dogpath.js', {
    path: { dirname: () => '/image/' }
  })

  // error, because path.join was not defined
  await assert.rejects(async () => dogpathStrict(), {
    name: 'TypeError',
    message: 'path.join is not a function'
  })

  // no error, because "core" path.join was merged into the mock
  assert.deepEqual(dogpathPartial(), '/image/dog')
})
```

`esmock` examples
``` javascript
import test from 'node:test'
import assert from 'node:assert/strict'
import esmock from 'esmock/partial'

test('should mock packages and local files', async () => {
  const cookup = await esmock('../src/cookup.js', {
    addpkg: (a, b) => a + b,
    '#icon': {
      coffee: '☕',
      bacon: '🥓'
    },
    '../src/breakfast.js': {
      default: () => ['coffee', 'bacon'],
      addSalt: meal => meal + '🧂'
    }
  })

  assert.strictEqual(cookup('breakfast'), '☕🥓🧂')
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
  // a bit more info are found in the wiki guide
})
```
