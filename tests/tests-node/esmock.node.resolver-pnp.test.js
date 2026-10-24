import test from 'node:test'
import assert from 'node:assert/strict'
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

test('should work with pnp resolver', async ({ mock }) => {
  pnpapi.resolveRequest = mock.fn(resolver)

  const main = await esmock('../local/main.js', {
    '../local/mainUtil.js': {
      createString: () => 'test string'
    }
  })

  assert.equal(typeof main, 'function')
  assert.strictEqual(main(), 'main string, test string')
  assert.equal(pnpapi.resolveRequest.mock.callCount(), 2)
})
