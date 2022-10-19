import test from 'node:test'
import assert from 'node:assert/strict'
import esmock from 'esmock'
import esmockErr from '../../src/esmockErr.js'

test('should throw error if !esmockloader', async () => {
  await assert.rejects(() => esmock('./to/module.js'), {
    message: esmockErr.errMissingLoader().message
  })
})
