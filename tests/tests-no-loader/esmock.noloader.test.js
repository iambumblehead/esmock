import test from 'node:test'
import assert from 'node:assert/strict'
import module from 'node:module'
import esmock from 'esmock'
import esmockErr from '../../src/esmockErr.js'

if (!module.register) {
  test('should throw error if !esmockloader', async () => {
    await assert.rejects(() => esmock('./to/module.js'), {
      message: esmockErr.errMissingLoader().message
    })
  })
}

// node version 20.6+ do not need --loader
if (module.register) {
  test('should mock a module', async () => {
    const main = await esmock('../local/mainUtil.js', {
      'form-urlencoded': () => 'mock encode'
    })

    assert.strictEqual(typeof main, 'function')
    assert.strictEqual(main.createString(), 'mock encode')
  })
}
