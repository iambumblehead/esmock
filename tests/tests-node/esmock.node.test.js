import path from 'path'
import test from 'node:test'
import assert from 'node:assert/strict'
import esmock from '../../src/esmock.js'
import sinon from 'sinon'

test('should mock package, even when package is not installed', async () => {
  const component = await esmock(`../local/notinstalledVueComponent.js`, {}, {
    vue: {
      h: (...args) => args
    }
  }, {
    isErrorPackageNotFound: false
  })

  assert.strictEqual(component()[0], 'svg')
})

test('should mock a subpath', async () => {
  const localpackagepath = path.resolve('../local/')
  const { subpathfunctionWrap } = await esmock(
    '../local/subpathimporter.js', localpackagepath, {
      '#sub': {
        subpathfunction: () => 'subpathMOCK'
      }
    })

  assert.strictEqual(subpathfunctionWrap(), 'subpathMOCK')
})

test('should return un-mocked file', async () => {
  const main = await esmock('../local/main.js')
  const mainqs = [
    'a+string',
    'mainUtilNamedExportOneValue=namedExportOne',
    'mainUtilNamedExportTwoValue=namedExportTwo'
  ].join('&')

  assert.strictEqual(main(), `main string, mainUtil=${mainqs}`)
})

test('should mock a local file', async () => {
  const main = await esmock.px('../local/main.js', {
    '../local/mainUtil.js': {
      createString: () => 'test string'
    }
  })

  assert.strictEqual(typeof main, 'function')
  assert.strictEqual(main(), 'main string, test string')
})

test('should mock core modules prefixed with node:', async () => {
  const pathWrap = await esmock('../local/pathWrap.js', {
    'node:path': { dirname: () => '/mocked/dirname' }
  })

  assert.deepEqual(pathWrap.nodedirname('/dog.png'), '/mocked/dirname')
})

test('should throw error if local file not found', async () => {
  await assert.rejects(() => esmock('../local/not/found.js', {
    '../local/mainUtil.js': {
      createString: () => 'test string'
    }
  }), {
    message: 'modulePath not found: "../local/not/found.js"'
  })
})

test('should throw error if local definition file not found', async () => {
  await assert.rejects(() => esmock('../local/not/found.js', {
    '../local/not/found.js': {
      createString: () => 'test string'
    }
  }), {
    message: /not a valid path: "..\/local\/not\/found.js" \(used by/
  })
})

test('should mock a module', async () => {
  const main = await esmock('../local/mainUtil.js', {
    'form-urlencoded': () => 'mock encode'
  })

  assert.strictEqual(typeof main, 'function')
  assert.strictEqual(main.createString(), 'mock encode')
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

  assert.strictEqual(typeof main, 'function')
  assert.strictEqual(
    main.mainDependencyUsingCoreModuleFSReadPath('checkfilepath.js'),
    'success'
  )
  assert.strictEqual(main(), 'main string and mocked export, mock encode')
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
  assert.strictEqual(typeof mainfoo, 'function')
  assert.strictEqual(mainfoo.createString(), 'mock encode foo')
  assert.strictEqual(mainbar.createString(), 'mock encode bar')
  assert.strictEqual(mainbaz.createString(), 'mock encode baz')
})

test('should return un-mocked file (again)', async () => {
  const main = await esmock('../local/main.js')
  const mainqs = [
    'a+string',
    'mainUtilNamedExportOneValue=namedExportOne',
    'mainUtilNamedExportTwoValue=namedExportTwo'
  ].join('&')

  assert.strictEqual(main(), `main string, mainUtil=${mainqs}`)
})

test('should mock local file', async () => {
  const mainUtil = await esmock.px('../local/mainUtil.js', {
    '../local/mainUtilNamedExports.js': {
      mainUtilNamedExportOne: () => 'foobar'
    }
  })

  const mainqs = [
    'mainUtil=a+string',
    'mainUtilNamedExportOneValue=foobar',
    'mainUtilNamedExportTwoValue=namedExportTwo'
  ].join('&')

  assert.strictEqual(mainUtil.createString(), mainqs)
})

test('should mock module and local file at the same time', async () => {
  const mainUtil = await esmock.px('../local/mainUtil.js', {
    'form-urlencoded': o => JSON.stringify(o),
    '../local/mainUtilNamedExports.js': {
      mainUtilNamedExportOne: () => 'foobar'
    }
  })

  assert.strictEqual(mainUtil.createString(), JSON.stringify({
    mainUtil: 'a string',
    mainUtilNamedExportOneValue: 'foobar',
    mainUtilNamedExportTwoValue: 'namedExportTwo'
  }))
})

test('__esModule definition, inconsequential', async () => {
  const mainUtil = await esmock.px('../local/mainUtil.js', {
    'form-urlencoded': o => JSON.stringify(o),
    '../local/mainUtilNamedExports.js': {
      mainUtilNamedExportOne: () => 'foobar',
      __esModule: true
    }
  })

  assert.strictEqual(mainUtil.createString(), JSON.stringify({
    mainUtil: 'a string',
    mainUtilNamedExportOneValue: 'foobar',
    mainUtilNamedExportTwoValue: 'namedExportTwo'
  }))
})

test('should work well with sinon', async () => {
  const mainUtil = await esmock.px('../local/mainUtil.js', {
    '../local/mainUtilNamedExports.js': {
      mainUtilNamedExportOne: sinon.stub().returns('foobar')
    }
  })

  assert.strictEqual(mainUtil.createString(), [
    'mainUtil=a+string',
    'mainUtilNamedExportOneValue=foobar',
    'mainUtilNamedExportTwoValue=namedExportTwo'
  ].join('&'))
})

test('should mock an mjs file', async () => {
  const main = await esmock('../local/usesmjsModule.js', {
    '../local/exampleMJS.mjs': () => 'first mocked'
  })

  assert.strictEqual(main.verifyImportedMock(), 'first mocked')
})

test('should mock an mjs file, again', async () => {
  const main = await esmock('../local/usesmjsModule.js', {
    '../local/exampleMJS.mjs': () => 'second mocked'
  })

  assert.strictEqual(main.verifyImportedMock(), 'second mocked')
})

test('should mock an exported constant values', async () => {
  const main = await esmock('../local/usesmjsModule.js', {
    '../local/env.js': {
      TESTCONSTANT: 'hello world'
    }
  })

  assert.strictEqual(main.verifyImportedConstant(), 'hello world')
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

  assert.strictEqual(usesCoreModule.readPath('checkfilepath.js'), 'success')
})

test('should apply third parameter "global" definitions', async () => {
  const main = await esmock.px('../local/main.js', {
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
  // eslint-disable-next-line max-len
  assert.strictEqual(tplStr, 'this value anywhere the instance imports fs, global')
})

test('returns spread-imported [object Module] default export', async () => {
  const main = await esmock('../local/usesObjectModule.js', {
    fs: {
      exportedFunction: () => 'foobar'
    }
  })

  assert.strictEqual(main.exportedFunction(), 'foobar')
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

  assert.strictEqual(
    (await writeJSConfigFile('config', 'filePath')).stringify(),
    JSON.stringify({
      baseConfig: 'config',
      fix: true,
      useEslintrc: false,
      filePath: 'filePath'
    }))

  const [ , key ] = writeJSConfigFile.esmockKey.match(/esmk=(\d*)/)
  const keyRe = new RegExp(`esmockKey=${key}[^d]`)

  const moduleKeys = Object.keys(esmock.esmockCache.mockDefs)
    .filter(moduleKey => keyRe.test(moduleKey))

  assert.ok(moduleKeys.every(mkey => esmock.esmockCache.mockDefs[mkey]))
  esmock.purge(writeJSConfigFile)
  // eslint-disable-next-line max-len
  assert.ok(moduleKeys.every(mkey => esmock.esmockCache.mockDefs[mkey] === null))
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
  } = await esmock.px('../local/main.js', {}, {
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

test('should merge "default" value, when safe', async () => {
  const main = await esmock('../local/main.js')

  assert.strictEqual(main(), main.default())

  const mockMainA = await esmock('../local/exportsMain.js', {
    '../local/main.js': () => 'mocked main'
  })
  const mockMainB = await esmock('../local/exportsMain.js', {
    '../local/main.js': { default: () => 'mocked main' }
  })

  assert.strictEqual(mockMainA(), mockMainB())
})

test('should not error when mocked file has space in path', async () => {
  const main = await esmock('../local/main.js', {
    '../local/space in path/wild-file.js': {
      default: 'tamed'
    }
  })

  assert.strictEqual(main.wild, 'tamed')
})

test('should strict mock by default, partial mock optional', async () => {
  const wildfile = await import('../local/space in path/wild-file.js')
  const mainstrict = await esmock('../local/main.js', {
    '../local/space in path/wild-file.js': {
      default: 'tamed',
      namedexport: 'namedexport'
    }
  })
  const mainpartial = await esmock.px('../local/main.js', {
    '../local/space in path/wild-file.js': {
      default: 'tamed',
      namedexport: 'namedexport'
    }
  })
  const wildfilenamedexports = Object.keys(wildfile)
    .filter(n => n !== 'default')
  const mainstrictwildexports = Object.keys(mainstrict.wildexports)
  const mainpartialwildexports = Object.keys(mainpartial.wildexports)

  assert.strictEqual(
    true, wildfilenamedexports.every(e => !mainstrictwildexports.includes(e)))
  assert.strictEqual(
    true, wildfilenamedexports.every(e => mainpartialwildexports.includes(e)))
})

test('should strict mock by default, partial mock optional', async () => {
  const pathWrapStrict = await esmock('../local/pathWrap.js', {
    path: { dirname: '/path/to/file' }
  })
  const pathWrapPartial = await esmock.px('../local/pathWrap.js', {
    path: { dirname: '/path/to/file' }
  })

  await assert.rejects(async () => pathWrapStrict.basename('/filename.js'), {
    name: 'TypeError',
    message: 'path.basename is not a function'
  })

  assert.deepEqual(pathWrapPartial.basename('/dog.png'), 'dog.png')
})
