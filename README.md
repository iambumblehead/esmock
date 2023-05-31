```diff
+                                                ██╗
+ ██████╗  ███████╗ █████═████╗  ██████╗  ██████╗██║   ██╗
+██╔═══██╗██╔═════╝██╔══██╔══██╗██╔═══██╗██╔════╝██║  ██╔╝
+████████║╚██████╗ ██║  ██║  ██║██║   ██║██║     ██████╔╝
+██╔═════╝ ╚════██╗██║  ██║  ██║██║   ██║██║     ██╔══██╗
+╚███████╗███████╔╝██║  ██║  ██║╚██████╔╝╚██████╗██║  ╚██╗
+ ╚══════╝╚══════╝ ╚═╝  ╚═╝  ╚═╝ ╚═════╝  ╚═════╝╚═╝   ╚═╝
```
[![npm][9]][7] [![coverage][8]][2] [![install size][6]][5] [![downloads](https://badgen.now.sh/npm/dm/esmock)][7]

**esmock provides native ESM import mocking for unit tests.** Use examples below as a quick-start guide, see the [descriptive and friendly esmock guide here,][4] or browse [esmock's test runner examples.][3]


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
    "test-ts": "node --loader=ts-node/esm --loader=esmock --test *ts",
    "test-jest": "NODE_OPTIONS=--loader=esmock jest"
  },
  "ava": [
    "ava is incompatible w/ --loader and node v20 or greater",
    "https://github.com/avajs/ava/issues/3195"
  ],
  "jest": {
    "runner": "jest-light-runner"
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

test('package, alias and local file mocks', async () => {
  const cookup = await esmock('../src/cookup.js', {
    addpkg: (a, b) => a + b,
    '#icon': { coffee: '☕', bacon: '🥓' },
    '../src/breakfast.js': {
      default: () => ['coffee', 'bacon'],
      addSalt: meal => meal + '🧂'
    }
  })

  assert.strictEqual(cookup('breakfast'), '☕🥓🧂')
})

test('global mocks fetch, Date, setTimeout etc', async () => {
  const reqUsers = await esmock('../reqUsers.js', {
    import: { // define the 'fetch' mock, see wiki for more info
      fetch: () => '[["jim","😄"],["jen","😊"]]'
    }
  })
  
  assert.strictEqual(await reqUsers(), '[["jim","😄"],["jen","😊"]]')
})

test('global instance mocks —third param', async () => {
  const { getFile } = await esmock('../src/main.js', {}, {
    fs: { readFileSync: () => 'returns this 🌎 globally' }
  })

  assert.strictEqual(getFile(), 'returns this 🌎 globally')
})

test('mocks "await import()" using esmock.p', async () => {
  // using esmock.p, mock definitions are kept in cache
  const doAwaitImport = await esmock.p('../awaitImportLint.js', {
    eslint: { ESLint: cfg => cfg }
  })

  // mock definition is returned from cache, when import is called
  assert.strictEqual(await doAwaitImport('cfg🛠️'), 'cfg🛠️')
  // a bit more info are found in the wiki guide
})

test('esmock.strict mocks', async () => {
  // replace original module definitions and do not merge them
  const pathWrapper = await esmock.strict('../src/pathWrapper.js', {
    path: { dirname: () => '/path/to/file' }
  })

  // error, because "path" mock above does not define path.basename
  assert.rejects(() => pathWrapper.basename('/dog.🐶.png'), {
    name: 'TypeError',
    message: 'path.basename is not a function'
  })
})
```

[0]: https://www.bumblehead.com "bumblehead"
[1]: https://github.com/iambumblehead/esmock/workflows/nodejs-ci/badge.svg "nodejs-ci pipeline"
[2]: https://github.com/iambumblehead/esmock "esmock"
[3]: https://github.com/iambumblehead/esmock/tree/master/tests "tests"
[4]: https://github.com/iambumblehead/esmock/wiki
[5]: https://packagephobia.now.sh/result?p=esmock
[6]: https://packagephobia.now.sh/badge?p=esmock
[7]: https://www.npmjs.com/package/esmock
[8]: https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/iambumblehead/166d927bd0089d7bfdee4e98a537712c/raw/esmock__heads_master.json
[9]: https://img.shields.io/npm/v/esmock
