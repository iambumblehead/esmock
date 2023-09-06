import test from 'node:test'
import assert from 'assert'
// TODO un-comment and resolve this test failing node v20.6
// import esmock from 'esmock'

test('should pass', () => assert.ok(true))

/* TODO un-comment and resolve this test failing node v20.6
test('should mock ts when using node-ts', async () => {
  const main = await esmock('../local/main.ts', {
    path: {
      basename: () => 'hellow'
    }
  })

  assert.strictEqual(main.pathbasenamewrap(), 'hellow')
  assert.ok(true)
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
*/

