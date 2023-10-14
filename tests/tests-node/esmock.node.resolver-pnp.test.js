import test from 'node:test'
import assert from 'node:assert/strict'
import module from 'node:module'
import { fileURLToPath } from 'node:url'
import resolvewithplus from 'resolvewithplus'
import '../local/pnp/enable.js'
import esmock from 'esmock'
import '../local/pnp/disable.js'
import pnpapi from '../local/pnp/api.js'

const resolver = (id, parent) => {
  const url = resolvewithplus(id, parent)
  return url !== null ? fileURLToPath(url) : null
}

test.beforeEach(() => {
  delete pnpapi.resolveRequest
})

test('should work with pnp resolver', async t => {
  if (!module.register)
    return assert.ok('skip test')
  
  pnpapi.resolveRequest = t.mock.fn(resolver)

  const main = await esmock('../local/main.js', {
    '../local/mainUtil.js': {
      createString: () => 'test string'
    }
  })

  assert.equal(typeof main, 'function')
  assert.strictEqual(main(), 'main string, test string')
  assert.equal(pnpapi.resolveRequest.mock.callCount(), 2)
})
