```diff
+                                                ██╗
+ ██████╗  ███████╗ █████═████╗  ██████╗  ██████╗██║   ██╗
+██╔═══██╗██╔═════╝██╔══██╔══██╗██╔═══██╗██╔════╝██║  ██╔╝
+████████║╚██████╗ ██║  ██║  ██║██║   ██║██║     ██████╔╝
+██╔═════╝ ╚════██╗██║  ██║  ██║██║   ██║██║     ██╔══██╗
+╚███████╗███████╔╝██║  ██║  ██║╚██████╔╝╚██████╗██║  ╚██╗
+ ╚══════╝╚══════╝ ╚═╝  ╚═╝  ╚═╝ ╚═════╝  ╚═════╝╚═╝   ╚═╝
```
[![npm][9]][7] [![coverage][8]][2] [![install size][6]][5] [![downloads][10]][7]

**esmock provides native ESM import and globals mocking for unit tests.** Use examples below as a quick-start guide, see the [descriptive and friendly esmock guide here,][4] or browse [esmock's test runner examples.][3]

_**Note: For versions of node prior to v20.6.0,** "--loader" command line arguments must be used with `esmock` as demonstrated [in the wiki.][4] Current versions of node do not require "--loader"._

_**Note: Typescript loaders** `ts-node` 👍 and `tsm` 👍 are compatible with other loaders, [including esmock.][11] `swc` 👎 and `tsx` 👎 are demonstrated as **incompatible** with other loaders, including esmock._

`esmock` has the below signature
```js
await esmock(
  './to/module.js', // path to target module being tested
  { ...childmocks }, // mock definitions imported by target module
  { ...globalmocks }) // mock definitions imported everywhere
```

`esmock` examples
```js
import test from 'node:test'
import assert from 'node:assert'
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

  assert.equal(cookup('breakfast'), '☕🥓🧂')
})

test('full import tree mocks —third param', async () => {
  const { getFile } = await esmock('../src/main.js', {}, {
    // mocks *every* fs.readFileSync inside the import tree
    fs: { readFileSync: () => 'returned to 🌲 every caller in the tree' }
  })

  assert.equal(getFile(), 'returned to 🌲 every caller in the tree')
})

test('mock fetch, Date, setTimeout and any globals', async () => {
  // https://github.com/iambumblehead/esmock/wiki#call-esmock-globals
  const { userCount } = await esmock('../Users.js', {
    '../req.js': await esmock('../req.js', {
      import: { // define globals like 'fetch' on the import namespace
        fetch: async () => ({
          status: 200,
          json: async () => [['jim','😄'],['jen','😊']]
        })
      }
    })
  })

  assert.equal(await userCount(), 2)
})

test('mocks "await import()" using esmock.p', async () => {
  // using esmock.p, mock definitions are kept in cache
  const doAwaitImport = await esmock.p('../awaitImportLint.js', {
    eslint: { ESLint: cfg => cfg }
  })

  // mock definition is returned from cache, when import is called
  assert.equal(await doAwaitImport('cfg🛠️'), 'cfg🛠️')
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
[10]: https://badgen.now.sh/npm/dm/esmock
[11]: https://github.com/iambumblehead/esmock/tree/main/tests
