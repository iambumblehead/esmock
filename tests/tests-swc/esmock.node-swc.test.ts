import test from 'node:test'
import assert from 'assert'
import esmock from 'esmock'

// credit @Brooooooklyn https://github.com/swc-project/swc-node/issues/788
test('should mock js when using swc', async () => {
  const main = await esmock('../local/main.js', {
    path: {
      basename: () => 'hellow'
    }
  })

  assert.strictEqual(main.pathbasenamewrap(), 'hellow')
})

test('should mock ts when using swc', async () => {
  const main = await esmock('../local/main-ts.ts', {
    path: {
      basename: () => 'hellow'
    }
  })

  assert.strictEqual(main.pathbasenamewrap(), 'hellow')
})