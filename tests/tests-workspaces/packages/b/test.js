import module from 'module'
import test from 'node:test'
import assert from 'node:assert/strict'
import esmock from '../../../../src/esmock.js'

test('works ootb', async () => {
  const sut = await esmock('./index.js', {
    a: { foo: () => 'bar' }
  })

  assert.equal(sut(), 'bar')
})

test('works roubdabout way', async () => {
  const require = module.createRequire(import.meta.url)

  const sut = await esmock('./index.js', {
    [require.resolve('a')]: {
      foo: () => 'bar'
    }
  })

  assert.equal(sut(), 'bar')
})
