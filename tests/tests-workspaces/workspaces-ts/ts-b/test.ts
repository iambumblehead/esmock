import test from 'node:test'
import assert from 'node:assert/strict'
import esmock from '../../../../src/esmock.js'

test('works ootb', async () => {
  const sut = await esmock('./index.js', {
    'ts-a': { foo: () => 'bar' }
  })

  assert.equal(sut(), 'bar')
})
