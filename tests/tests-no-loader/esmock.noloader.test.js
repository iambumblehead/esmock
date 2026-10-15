import test from 'node:test'
import assert from 'node:assert/strict'
import module from 'node:module'
import esmock from 'esmock'
import {errMissingRegisterHook} from '../../src/esmockErr.js'

const registerSupportIs = Boolean(
  module.register || module.registerHooks)

if (!registerSupportIs) {
  test('should throw error if !esmockloader', async () => {
    await assert.rejects(() => esmock('./to/module.js'), {
      message: errMissingRegisterHook().message
    })
  })
} else {
  test('should mock a module', async () => {
    const main = await esmock('../local/mainUtil.js', {
      'form-urlencoded': () => 'mock encode'
    })

    assert.strictEqual(typeof main, 'function')
    assert.strictEqual(main.createString(), 'mock encode')
  })
}
