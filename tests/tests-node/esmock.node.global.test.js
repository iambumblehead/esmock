import test from 'node:test'
import assert from 'node:assert/strict'
import esmock from 'esmock'

test('should import mock objects, local', async () => {
  const hostObjects = await esmock('../local/usesImportObjects.js', {
    '../local/exampleMJS.mjs': () => 'second mocked',
    import: {
      Date: { now: () => 123456789012 },
      setTimeout: fn => fn(),
      fetch: () => ({ res: 404 })
    }
  })

  assert.strictEqual(hostObjects.dateWrapper.now(), 123456789012)
  assert.strictEqual(hostObjects.setTimeoutWrapper(() => ':)'), ':)')
  assert.strictEqual(hostObjects.fetchWrapper().res, 404)

  assert.notStrictEqual(hostObjects.child.dateWrapper.now(), 123456789098)
  assert.notStrictEqual(hostObjects.child.setTimeoutWrapper(() => ':)'), ':)')
  assert.notStrictEqual(hostObjects.child.otherimport(), 'other import')
})

test('should import mock objects, global', async () => {
  const hostObjects = await esmock('../local/usesImportObjects.js', {}, {
    '../local/exampleMJS.mjs': () => 'other import',
    import: {
      Date: { now: () => 123456789098 },
      setTimeout: fn => fn(),
      fetch: () => ({ res: 404 })
    }
  })

  assert.strictEqual(hostObjects.dateWrapper.now(), 123456789098)
  assert.strictEqual(hostObjects.setTimeoutWrapper(() => ':)'), ':)')
  assert.strictEqual(hostObjects.fetchWrapper().res, 404)

  assert.strictEqual(hostObjects.child.dateWrapper.now(), 123456789098)
  assert.strictEqual(hostObjects.child.setTimeoutWrapper(() => ':)'), ':)')
  assert.strictEqual(hostObjects.child.fetchWrapper().res, 404)
  assert.strictEqual(hostObjects.child.otherimport(), 'other import')
})

test('should mock fetch as shown in README', async () => {
  const reqUsers = await esmock('../local/usesImportObjects.js', {
    import: {
      fetch: () => '[["jim😄",1],["jen😊",2}]'
    }
  })

  assert.strictEqual(await reqUsers(), '[["jim😄",1],["jen😊",2}]')
})

test('should mock files with hashbangs', async () => {
  const logs = []

  await esmock('../local/hashbang.js', {
    '../local/env.js': { TESTCONSTANT: 'foo' },
    import: {
      console: { log: (...args) => logs.push(...args) }
    }
  })

  assert.deepEqual(logs, ['foo'])
})

test('should work when modules have CJS imports', async () => {
  const logs = []

  await esmock('../local/usesModuleWithCJSDependency.js', {}, {
    import: {
      console: { log: (...args) => logs.push(...args) }
    }
  })

  assert.deepEqual(logs, ['\nfoo\n'])
});
