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

test('should mock import global at import tree w/ mixed esm cjs', async () => {
  const consolelog = mock.fn()
  const trigger = await esmock('../local/usesModuleWithCJSDependency.ts', {}, {
    import: {
      console: { log: consolelog }
    }
  })

  trigger()
  trigger()    
  assert.strictEqual(consolelog.mock.calls.length, 2)
})
