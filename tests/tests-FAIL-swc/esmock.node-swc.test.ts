import test from 'node:test'
import assert from 'assert'
import esmock from 'esmock'

// ⚠ https://github.com/swc-project/swc-node/issues/710
// swc tests fail when encountering typescript syntax
// when the typescript sytax are removed, tests pass

test('should mock ts when using node-ts', async () => {
  const main = await esmock('../local/main.ts', {
    path: {
      basename: () => 'hellow'
    }
  })

  assert.strictEqual(main.pathbasenamewrap(), 'hellow')
})

test('should mock pg', async () => {
  const main = await esmock('../local/main.ts', {
    'pg': {
      Pool: (config:any) => {
        return config || 'mocked pool'
      }
    }
  })

  assert.strictEqual(main.pgpoolwrap(), 'mocked pool')
})
