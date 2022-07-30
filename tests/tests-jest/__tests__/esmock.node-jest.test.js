import esmock from 'esmock'

test('should mock modules when using jest', async () => {
  const main = await esmock('../../local/main.js', {
    path: {
      basename: () => 'hellow'
    }
  })

  expect(main.pathbasenamewrap()).toBe('hellow')
})
