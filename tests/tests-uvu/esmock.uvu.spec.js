import { test } from 'uvu'
import * as assert from 'uvu/assert'
import sinon from 'sinon'
import esmock from 'esmock'

test('should return un-mocked file', async () => {
  const main = await esmock('../local/main.js')
  const mainqs = [
    'a+string',
    'mainUtilNamedExportOneValue=namedExportOne',
    'mainUtilNamedExportTwoValue=namedExportTwo'
  ].join('&')

  assert.is(main(), `main string, mainUtil=${mainqs}`)
})

test('should mock a local file', async () => {
  const main = await esmock('../local/main.js', {
    '../local/mainUtil.js': {
      createString: () => 'test string'
    }
  })
  assert.is(typeof main, 'function')
  assert.is(main(), 'main string, test string')
})

test('should throw error if local file not found', async () => {
  try {
    await esmock('../local/not/found.js', {
      '../local/mainUtil.js': {
        createString: () => 'test string'
      }
    })
  } catch (e) {
    assert.is(e.message, 'invalid moduleId: "../local/not/found.js"')
  }
})

test('should throw error if local definition file not found', async () => {
  try {
    await esmock('../local/not/found.js', {
      '../local/not/found.js': {
        createString: () => 'test string'
      }
    })
  } catch (e) {
    assert.ok(e.message.startsWith(
      'invalid moduleId: "../local/not/found.js" (used by'))
  }
})

test('should mock a module', async () => {
  const main = await esmock('../local/mainUtil.js', {
    'form-urlencoded': () => 'mock encode'
  })

  assert.is(typeof main, 'function')
  assert.is(main.createString(), 'mock encode')
})

test('should mock a module, globally', async () => {
  const main = await esmock('../local/main.js', {
    '../local/mainUtilNamedExports.js': {
      mainUtilNamedExportOne: 'mocked'
    }
  }, {
    'form-urlencoded': () => 'mock encode',
    fs: {
      existsSync: () => true,
      readFileSync: filepath => filepath === 'checkfilepath.js'
        ? 'success'
        : filepath
    }
  })

  assert.is(typeof main, 'function')
  assert.is(
    main.mainDependencyUsingCoreModuleFSReadPath('checkfilepath.js'),
    'success'
  )
  assert.is(main(), 'main string and mocked export, mock encode')
})

test('should purge local and global mocks', async () => {
  await esmock('../local/main.js', {
    '../local/mainUtilNamedExports.js': {
      mainUtilNamedExportOne: 'mocked'
    }
  }, {
    'form-urlencoded': () => 'mock encode',
    fs: {
      existsSync: () => true,
      readFileSync: filepath => filepath === 'checkfilepath.js'
        ? 'success'
        : filepath
    }
  }, {
    key: 999
  })

  const keys = Object
    .keys(esmock.esmockCache.mockDefs)
    .filter(key => /esmockKey=999/.test(key))

  assert.ok(keys.length)
  assert.ok(keys.every(key => esmock.esmockCache.mockDefs[key] === null))
})

test('should mock a module, many times differently', async () => {
  const mainfoo = await esmock('../local/mainUtil.js', {
    'form-urlencoded': () => 'mock encode foo'
  })
  const mainbar = await esmock('../local/mainUtil.js', {
    'form-urlencoded': () => 'mock encode bar'
  })
  const mainbaz = await esmock('../local/mainUtil.js', {
    'form-urlencoded': () => 'mock encode baz'
  })
  assert.is(typeof mainfoo, 'function')
  assert.is(mainfoo.createString(), 'mock encode foo')
  assert.is(mainbar.createString(), 'mock encode bar')
  assert.is(mainbaz.createString(), 'mock encode baz')
})

test('should return un-mocked file (again)', async () => {
  const main = await esmock('../local/main.js')
  const mainqs = [
    'a+string',
    'mainUtilNamedExportOneValue=namedExportOne',
    'mainUtilNamedExportTwoValue=namedExportTwo'
  ].join('&')

  assert.is(main(), `main string, mainUtil=${mainqs}`)
})

test('should mock local file', async () => {
  const mainUtil = await esmock('../local/mainUtil.js', {
    '../local/mainUtilNamedExports.js': {
      mainUtilNamedExportOne: () => 'foobar'
    }
  })

  const mainqs = [
    'mainUtil=a+string',
    'mainUtilNamedExportOneValue=foobar',
    'mainUtilNamedExportTwoValue=namedExportTwo'
  ].join('&')

  assert.is(mainUtil.createString(), mainqs)
})

test('should mock module and local file at the same time', async () => {
  const mainUtil = await esmock('../local/mainUtil.js', {
    'form-urlencoded': o => JSON.stringify(o),
    '../local/mainUtilNamedExports.js': {
      mainUtilNamedExportOne: () => 'foobar'
    }
  })

  assert.is(mainUtil.createString(), JSON.stringify({
    mainUtil: 'a string',
    mainUtilNamedExportOneValue: 'foobar',
    mainUtilNamedExportTwoValue: 'namedExportTwo'
  }))
})

test('__esModule definition, inconsequential', async () => {
  const mainUtil = await esmock('../local/mainUtil.js', {
    'babelGeneratedDoubleDefault': o => o,
    '../local/mainUtilNamedExports.js': {
      mainUtilNamedExportOne: () => 'foobar',
      __esModule: true
    }
  })

  assert.is(mainUtil.callBabelGeneratedDoubleDefault('mocked'), 'mocked')
})

test('should work well with sinon', async () => {
  const mainUtil = await esmock('../local/mainUtil.js', {
    '../local/mainUtilNamedExports.js': {
      mainUtilNamedExportOne: sinon.stub().returns('foobar')
    }
  })

  assert.is(mainUtil.createString(), [
    'mainUtil=a+string',
    'mainUtilNamedExportOneValue=foobar',
    'mainUtilNamedExportTwoValue=namedExportTwo'
  ].join('&'))
})

test('should mock an mjs file', async () => {
  const main = await esmock('../local/usesmjsModule.js', {
    '../local/exampleMJS.mjs': () => 'first mocked'
  })

  assert.is(main.verifyImportedMock(), 'first mocked')
})

test('should mock an mjs file, again', async () => {
  const main = await esmock('../local/usesmjsModule.js', {
    '../local/exampleMJS.mjs': () => 'second mocked'
  })

  assert.is(main.verifyImportedMock(), 'second mocked')
})

test('should mock an exported constant values', async () => {
  const main = await esmock('../local/usesmjsModule.js', {
    '../local/env.js': {
      TESTCONSTANT: 'hello world'
    }
  })

  assert.is(main.verifyImportedConstant(), 'hello world')
})

test('should mock core module', async () => {
  const usesCoreModule = await esmock('../local/usesCoreModule.js', {
    fs: {
      existsSync: () => true,
      readFileSync: filepath => filepath === 'checkfilepath.js'
        ? 'success'
        : filepath
    }
  })

  assert.is(usesCoreModule.readPath('checkfilepath.js'), 'success')
})

test('should apply third parameter "global" definitions', async () => {
  const main = await esmock('../local/main.js', {
    '../local/mainUtil.js': {
      exportedFunction: () => 'foobar'
    }
  }, {
    fs: {
      readFileSync: () => {
        return 'this value anywhere the instance imports fs, global'
      }
    }
  })

  const tplStr = main.readTemplateFile()
  assert.is(tplStr, 'this value anywhere the instance imports fs, global')
})

test('returns spread-imported [object Module] default export', async () => {
  const main = await esmock('../local/usesObjectModule.js', {
    fs: {
      exportedFunction: () => 'foobar'
    }
  })

  assert.is(main.exportedFunction(), 'foobar')
})

test('mocks inline `async import("name")`', async () => {
  const writeJSConfigFile = await esmock.p('../local/usesInlineImport.mjs', {
    eslint: {
      ESLint: function (...o) {
        this.stringify = () => JSON.stringify(...o)

        return this
      }
    }
  })

  assert.is(
    (await writeJSConfigFile('config', 'filePath')).stringify(),
    JSON.stringify({
      baseConfig: 'config',
      fix: true,
      useEslintrc: false,
      filePath: 'filePath'
    }))

  const [, key] = writeJSConfigFile.esmockKey.match(/esmk=(\d*)/)
  const keyRe = new RegExp(`esmockKey=${key}[^d]`)

  const moduleKeys = Object.keys(esmock.esmockCache.mockDefs)
    .filter(moduleKey => keyRe.test(moduleKey))

  assert.ok(moduleKeys.every(mkey => esmock.esmockCache.mockDefs[mkey]))
  esmock.purge(writeJSConfigFile)
  assert.ok(
    moduleKeys.every(mkey => esmock.esmockCache.mockDefs[mkey] === null))
})

test('should have small querystring in stacktrace filename', async () => {
  const { causeRuntimeError } = await esmock('../local/mainUtil.js')

  try {
    causeRuntimeError()
  } catch (e) {
    assert.ok(/\?esmk=\d/.test(e.stack.split('\n')[1]))
  }

  assert.ok(true)
})

test('should have small querystring in stacktrace filename, deep', async () => {
  const {
    causeRuntimeErrorFromImportedFile
  } = await esmock('../local/main.js', {}, {
    '../local/mainUtil.js': {
      causeRuntimeError: () => {
        assert.nonexistantmethod()
      }
    }
  })

  try {
    causeRuntimeErrorFromImportedFile()
  } catch (e) {
    assert.ok(
      e.stack.split('\n')
        .every(line => !line.includes('?') || /\?esmk=\d/.test(line)))
  }

  assert.ok(true)
})

test.run()
