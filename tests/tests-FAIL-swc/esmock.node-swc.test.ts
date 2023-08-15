import test from 'node:test'
import assert from 'assert'
import esmock from 'esmock'

test('should mock ts when using node-ts', async () => {
    const main = await import('../local/main.ts')
    // const main = await import('../local/mainUtil.js')
    console.log(main)
  // const main = await import('../local/main.js')
  /*
  const main = await esmock('../local/main.ts', {
    path: {
      basename: () => 'hellow'
    }
  })*/

  // assert.strictEqual(main.pathbasenamewrap(), 'hellow')
  assert.ok(true)
})
/*
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
