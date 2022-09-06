import test from 'node:test'
import assert from 'node:assert/strict'
import esmock from 'esmock'

test('should throw error if !esmockloader', async () => {
  const main = await esmock('../local/main.js', {
    '../local/mainUtil.js': {
      createString: () => 'test string'
    }
  })

  assert.strictEqual(typeof main, 'function')
  assert.strictEqual(main(), 'main string, test string')
})
