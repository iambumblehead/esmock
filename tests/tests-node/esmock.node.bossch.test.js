import test from 'node:test'
import assert from 'assert'
import esmock from 'esmock'

test('should mock importedfn', async () => {
  const { fncaller } = await esmock('../local/bossch.fnimporter.js', {
    '../local/bossch.fnimported.js': {
      fnimported: () => 'mocky'
    }
  })

  assert.equal('mocky', fncaller())
})
