// import test from 'node:test'
import test from 'ava'
import assert from 'assert'
import esmock from 'esmock'

test('should mock js when using tsx', async () => {
  const main = await esmock('../local/main.js', {
    path: {
      basename: () => 'hellow'
    }
  })

  assert.strictEqual(main.pathbasenamewrap(), 'hellow')
})

test('should mock ts when using tsx - unknown file extension', async () => {
  const main = await esmock('../local/main.ts', {
    path: {
      basename: () => 'hellow'
    }
  })

  assert.strictEqual(main.pathbasenamewrap(), 'hellow')
})
