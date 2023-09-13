import test from 'node:test'
import assert from 'assert'
import esmock from 'esmock'

test('should mock ts when using node-ts', async () => {
  const main = await esmock('../local/main-ts.ts', {
    path: {
      basename: () => 'hellow'
    }
  })

  assert.strictEqual(main.pathbasenamewrap(), 'hellow')
  assert.ok(true)
})

test('should mock pg', async () => {
  const main = await esmock('../local/main-ts.ts', {
    'pg': {
      Pool: (config:any) => {
        return config || 'mocked pool'
      }
    }
  })

  assert.strictEqual(main.pgpoolwrap(), 'mocked pool')
})
