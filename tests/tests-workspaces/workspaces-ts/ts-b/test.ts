import test from 'node:test'
import assert from 'node:assert/strict'
import esmock from '../../../../src/esmock.js'

test('works ootb', async () => {
  const sut = await esmock('./index.js', {
    'ts-a': { foo: () => 'bar' }
  })

  assert.equal(sut(), 'bar')
})

test('also mocks local file', async () => {
  const { localfilewrap } = await esmock('./index.js', {
    './local-file.js': () => 'local-value-mocked'
  })

  assert.equal(localfilewrap(), 'local-value-mocked')
})
