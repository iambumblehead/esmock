import test, { mock } from 'node:test'
import assert from 'assert'
import esmock from 'esmock'

test('should mock ts when using node-ts', { only: true }, async () => {
  const main = await esmock('../local/main.ts', {
    path: {
      basename: () => 'hellow'
    }
  })

  assert.strictEqual(main.pathbasenamewrap(), 'hellow')
  assert.ok(true)
})

// see: https://github.com/iambumblehead/esmock/pull/237
//
// problems with these files seem separte from esmock, so
// commenting this out for now
/*
test('should mock import global at import tree w/ mixed esm cjs', async () => {
  const consolelog = mock.fn()
  const trigger = await esmock('../local/usesModuleWithCJSDependency.ts', {}, {
    import: {
      // if troublshooting, try fetch definition instead
      // fetch: {}
      console: { log: consolelog }
    }
  })

  trigger()
  trigger()
  assert.is(2, logs.filter(n => n === '\nfoo\n'))
})
*/
