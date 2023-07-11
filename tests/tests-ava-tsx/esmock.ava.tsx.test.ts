import test from 'ava'
import esmock from 'esmock'

test('should mock js when using tsx', async t => {
  const main = await esmock('../local/main.js', {
    path: {
      basename: () => 'hellow'
    }
  })

  t.is(main.pathbasenamewrap(), 'hellow')
})

test.only('should mock ts when using tsx - unknown file extension', async t => {
  const main = await esmock('../local/main.ts', {
    path: {
      basename: () => 'hellow'
    }
  })

  t.is(main.pathbasenamewrap(), 'hellow')
})

test.failing('should mock ts when using tsx - invalid moduleId', async t => {
  const main = await esmock('../local/mainUnique.js', {
    path: {
      basename: () => 'hellow'
    }
  })

  t.is(main.pathbasenamewrap(), 'hellow')
})
