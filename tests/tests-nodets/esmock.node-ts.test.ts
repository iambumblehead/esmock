import test, { mock } from 'node:test'
import assert from 'assert'
import esmock from 'esmock'

test('should mock ts when using node-ts', { only: true }, async () => {
  const main = await esmock('../local/main-ts.ts', {
    path: {
      basename: () => 'hellow'
    }
  })

  assert.strictEqual(main.pathbasenamewrap(), 'hellow')
  assert.ok(true)
})

test('should mock import global at import tree w/ mixed esm cjs', async () => {
  const consolelog = mock.fn()
  const trigger = await esmock('../local/usesModuleWithCJSDependency.ts', {}, {
    import: {
      console: { log: () => consolelog('foo') }
    }
  })

  trigger()
  trigger()
  assert.equal(consolelog.mock.calls[0].arguments[0], 'foo')
  assert.equal(consolelog.mock.calls[1].arguments[0], 'foo')
})
