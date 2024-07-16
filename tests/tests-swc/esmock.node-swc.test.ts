import test from 'node:test'
import assert from 'assert'
import esmock from 'esmock'

// ⚠ https://github.com/swc-project/swc-node/issues/710
// swc tests fail when encountering typescript syntax
// when the typescript sytax are removed, tests pass

test('should mock js when using swc', async () => {
  const main = await esmock('../local/main.js', {
    path: {
      basename: () => 'hellow'
    }
  })

  assert.strictEqual(main.pathbasenamewrap(), 'hellow')
})

test('should mock ts when using swc', async () => {
  const main = await import('../local/main-ts.ts')
/*
  const main = await esmock('../local/main-ts.ts', {
    path: {
      basename: () => 'hellow'
    }
  })
*/
  assert.strictEqual(
    main.default.pathbasenamewrap('/path/to/hellow'),
    'hellow')
//  assert.strictEqual(main.pathbasenamewrap(), 'hellow')

})