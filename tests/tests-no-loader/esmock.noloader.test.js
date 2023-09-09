import test from 'node:test'
import assert from 'node:assert/strict'
import esmock from 'esmock'
import esmockErr from '../../src/esmockErr.js'

// node version 20.6+ do not need --loader
const isLT206 = (([major, minor]) => (
  major < 20 || (major === 20 && minor < 6)))(
  process.versions.node.split('.').map(it => +it))

if (isLT206) {
  test('should throw error if !esmockloader', async () => {
    await assert.rejects(() => esmock('./to/module.js'), {
      message: esmockErr.errMissingLoader().message
    })
  })  
}

if (!isLT206) {
  test('should mock a module', async () => {
    const main = await esmock('../local/mainUtil.js', {
      'form-urlencoded': () => 'mock encode'
    })

    assert.strictEqual(typeof main, 'function')
    assert.strictEqual(main.createString(), 'mock encode')
  })
}
