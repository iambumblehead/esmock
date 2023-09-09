import test from 'node:test'
import assert from 'node:assert/strict'
import module from 'node:module'
import threads from 'node:worker_threads'
import esmock from 'esmock'
import esmockErr from '../../src/esmockErr.js'

// newer versions of node support module.register, do not need --loader
// older versions of node need --loader
if (module.register && threads.MessageChannel) {
  test('should mock a module', async () => {
    const main = await esmock('../local/mainUtil.js', {
      'form-urlencoded': () => 'mock encode'
    })

    assert.strictEqual(typeof main, 'function')
    assert.strictEqual(main.createString(), 'mock encode')
  })
} else {
  test('should throw error if !esmockloader', async () => {
    await assert.rejects(() => esmock('./to/module.js'), {
      message: esmockErr.errMissingLoader().message
    })
  })
}
