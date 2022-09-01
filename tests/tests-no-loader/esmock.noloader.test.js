import test from 'node:test'
import assert from 'node:assert/strict'
import esmock from 'esmock/strict'

test('should throw error if !esmockloader', async () => {
  await assert.rejects(() => esmock('./to/module.js'), {
    message: 'process must be started with --loader=esmock'
  })
})
