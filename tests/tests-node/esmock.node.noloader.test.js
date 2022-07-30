import test from 'node:test'
import assert from 'node:assert/strict'
import esmock from '../../src/esmock.js'

test('should throw error if !esmockloader', async () => {
  global.esmockloader = false
  await assert.rejects(() => esmock('./to/module.js'), {
    message: 'process must be started with --loader=esmock'
  })
  global.esmockloader = true
})
