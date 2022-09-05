import test from 'node:test'
import assert from 'node:assert/strict'
import esmock, { partial, strict } from 'esmock'

const isPassingPartial = async esmockPartial => {
  const main = await esmockPartial('../local/main.js', {
    '../local/mainUtil.js': {
      createString: () => 'test string'
    }
  })

  assert.strictEqual(typeof main, 'function')
  assert.strictEqual(main(), 'main string, test string')
}

const isPassingStrict = async esmockStrict => {
  await assert.rejects(() => esmockStrict('../local/main.js', {
    '../local/mainUtil.js': {
      createString: () => 'test string'
    }
  }), {
    // eslint-disable-next-line max-len
    message: "The requested module ':module' does not provide an export named ':named'"
      .replace(/:module/, './mainUtil.js')
      .replace(/:named/, 'causeRuntimeError')
  })
}

test('should export esmock partial', async () => {
  await isPassingPartial(partial)
  await isPassingPartial(partial.p)
  await isPassingPartial(esmock.partial)
  await isPassingPartial(esmock.partial.p)
})

test('should export esmock strict', async () => {
  await isPassingStrict(strict)
  await isPassingStrict(strict.p)
  await isPassingStrict(esmock.strict)
  await isPassingStrict(esmock.strict.p)
  await isPassingStrict(esmock)
  await isPassingStrict(esmock.p)
})
