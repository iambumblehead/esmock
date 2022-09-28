import test from 'node:test'
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
