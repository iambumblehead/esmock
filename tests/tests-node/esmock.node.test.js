import path from 'path'
import test from 'node:test'
import assert from 'node:assert/strict'
import esmock from 'esmock'
import sinon from 'sinon'
import esmockCache from '../../src/esmockCache.js'

// https://github.com/iambumblehead/esmock/issues/312
test('should mock changelog-parser', {skip: true}, async () => {
  const parseChangelog = await esmock(
    '../local/importsChangelogParser.js', {}, {
      'node:fs': {
        read: test.mock.fn(() => 'content')
      }
    })

  assert.strictEqual(await parseChangelog({ filePath: 'fake' }), 'content')
})

test('should mock node:process', async () => {
  // has direct and in-direct calls to `process.cwd()`
  const thingBeingTested = await esmock('../local/usesNodeProcess.js', {}, {
    'node:process': { cwd: () => 'tempDir' }
  })

  assert.strictEqual(thingBeingTested.cwd(), 'tempDir')
})

test('should mock package, even when package is not installed', async () => {
  const component = await esmock(`../local/notinstalledVueComponent.js`, {
    vue: {
      h: (...args) => args
    }
  }, {}, {
    isModuleNotFoundError: false
  })

  assert.strictEqual(component()[0], 'svg')
})

test('should mock package, even when package is not installed', async () => {
  const component = await esmock(`../local/notinstalledVueComponent.js`, {}, {
    vue: {
      h: (...args) => args
    }
  }, {
    isModuleNotFoundError: false
  })

  assert.strictEqual(component()[0], 'svg')
})

test('should mock a subpath', async () => {
  const localpackagepath = path.resolve('../local/') + path.sep
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
  const main = await esmock('../local/main.js', {
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
    message: /invalid moduleId: "..\/local\/not\/found.js" \(used by/
  })
})

test('should throw error if local definition file not found', async () => {
  await assert.rejects(() => esmock('../local/not/found.js', {
    '../local/not/found.js': {
      createString: () => 'test string'
    }
  }), {
    message: /invalid moduleId: "..\/local\/not\/found.js" \(used by/
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
    id: 999
  })

  const keys = Object
    .keys(esmockCache.mockDefs)
    .filter(key => /esmkTreeId=999/.test(key))

  assert.ok(keys.length)
  assert.ok(keys.every(key => esmockCache.mockDefs[key] === null))
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

  assert.strictEqual(mainUtil.createString(), mainqs)
})

test('should mock module and local file at the same time', async () => {
  const mainUtil = await esmock('../local/mainUtil.js', {
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
  const mainUtil = await esmock('../local/mainUtil.js', {
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
  const mainUtil = await esmock('../local/mainUtil.js', {
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

  const [, key] = writeJSConfigFile.esmkTreeId.match(/esmk=(\d*)/)
  const keyRe = new RegExp(`esmkTreeId=${key}[^d]`)

  const moduleKeys = Object.keys(esmockCache.mockDefs)
    .filter(moduleKey => keyRe.test(moduleKey))

  assert.ok(moduleKeys.every(mkey => esmockCache.mockDefs[mkey]))
  esmock.purge(writeJSConfigFile)
  assert.ok(moduleKeys.every(mkey => esmockCache.mockDefs[mkey] === null))
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

test('should partial mock by default, strict mock optional', async () => {
  const wildfile = await import('../local/space in path/wild-file.js')
  const mainstrict = await esmock.strict('../local/main.js', {
    '../local/space in path/wild-file.js': {
      default: 'tamed',
      namedexport: 'namedexport'
    }
  })
  const mainpartial = await esmock('../local/main.js', {
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

test('should throw error when strict mock definition not found', async () => {
  const pathWrapStrict = await esmock.strict('../local/pathWrap.js', {
    path: { dirname: '/path/to/file' }
  })
  const pathWrapPartial = await esmock('../local/pathWrap.js', {
    path: { dirname: '/path/to/file' }
  })

  await assert.rejects(async () => pathWrapStrict.basename('/filename.js'), {
    name: 'TypeError',
    message: 'path.basename is not a function'
  })

  assert.deepEqual(pathWrapPartial.basename('/dog.png'), 'dog.png')
})

test('should error when "strictest" called with defs: {}', async () => {
  await assert.rejects(async () => esmock.strictest(
    '../local/importsCoreLocalAndPackage.js', {}
  ))
})

test('should error when "strictest" called with defs: undefined', async () => {
  await assert.rejects(async () => esmock.strictest(
    '../local/importsCoreLocalAndPackage.js'
  ))
})

test('should error when "strictest" mock tree module not mocked', async () => {
  const strictestTree = await esmock.strictest(
    '../local/importsCoreLocalAndPackage.js', {
      path: { basename: () => 'core' },
      '../local/usesCoreModule.js': { readPath: () => 'local' },
      'form-urlencoded': () => 'package'
    }
  )

  assert.deepEqual(strictestTree.corePathBasename(), 'core')
  assert.deepEqual(strictestTree.localReadSync(), 'local')
  assert.deepEqual(strictestTree.packageFn(), 'package')

  await assert.rejects(async () => esmock.strictest(
    '../local/importsCoreLocalAndPackage.js', {
      '../local/usesCoreModule.js': { readPath: () => 'local' },
      'form-urlencoded': () => 'package'
    }
  ), {
    name: 'Error',
    message: new RegExp(
      'un-mocked moduleId: "node:path" \\(used by .*:parent\\)'
        .replace(':parent', 'importsCoreLocalAndPackage.js'))
  })

  await assert.rejects(async () => esmock.strictest(
    '../local/importsCoreLocalAndPackage.js', {
      path: { basename: () => 'core' },
      'form-urlencoded': () => 'package'
    }
  ), {
    name: 'Error',
    message: new RegExp(
      'un-mocked moduleId: ".*:child" \\(used by .*:parent\\)'
        .replace(':child', 'usesCoreModule.js')
        .replace(':parent', 'importsCoreLocalAndPackage.js'))
  })

  await assert.rejects(async () => esmock.strictest(
    '../local/importsCoreLocalAndPackage.js', {
      path: { basename: () => 'core' },
      '../local/usesCoreModule.js': { readPath: () => 'local' }
    }
  ), {
    name: 'Error',
    message: new RegExp(
      'un-mocked moduleId: ".*:package" \\(used by .*:parent\\)'
        .replace(':package', 'form-urlencoded.mjs')
        .replace(':parent', 'importsCoreLocalAndPackage.js'))
  })
})

test('should mock scoped package, @aws-sdk/client-s3', async () => {
  const scopedClientS3 = await esmock(
    '../local/importsScopedPackageClientS3.js', {
      '@aws-sdk/client-s3': {
        S3Client: function () {
          this.mocked = 'mock client'

          return this
        }
      }
    })

  assert.strictEqual(scopedClientS3.mocked, 'mock client')
})

test('should mock scoped package, @aws-sdk/client-s3 (deep)', async () => {
  const scopedClientS3 = await esmock(
    '../local/importsScopedPackageClientS3Deep.js', {}, {
      '@aws-sdk/client-s3': {
        S3Client: function () {
          this.mocked = 'mock client'

          return this
        }
      }
    })

  assert.strictEqual(scopedClientS3.mocked, 'mock client')
})

test('should mock an exported array', async () => {
  const mockedArray = ['mocked']

  const importsArray = await esmock(
    '../local/importsArray.js', {
      '../local/exportsArray.js': mockedArray
    }
  )

  assert.deepStrictEqual(importsArray(), ['mocked'])
})

test('should mock imported json', async () => {
  const importsJSONPath = 20 <= +process.versions.node.split('.')[0]
    ? '../local/importsJSONfile.with.js'
    : '../local/importsJSONfile.assert.legacy.js'
  const importsJSON = await esmock(importsJSONPath, {
    '../local/example.json': {
      'test-example': 'test-json-a'
    }
  })

  assert.strictEqual(
    Object.keys(importsJSON.JSONobj).sort().join(), 'example,test-example')
  assert.strictEqual(importsJSON.JSONobj['test-example'], 'test-json-a')
  assert.strictEqual(importsJSON.JSONobj['example'], 'json')
})

test('should mock imported json (strict)', async () => {
  const importsJSONPath = 20 <= +process.versions.node.split('.')[0]
    ? '../local/importsJSONfile.with.js'
    : '../local/importsJSONfile.assert.legacy.js'
  const importsJSON = await esmock.strict(importsJSONPath, {
    '../local/example.json': {
      'test-example': 'test-json-b'
    }
  })

  assert.strictEqual(
    Object.keys(importsJSON.JSONobj).sort().join(), 'test-example')
  assert.strictEqual(importsJSON.JSONobj['test-example'], 'test-json-b')
})

test('mocks await import node:fs/promises', async () => {
  const main = await esmock.p('../local/usesInlineBuiltinImport.js', {
    'node:fs/promises': {
      readdir: () => (['mock', 'local'])
    }
  })

  assert.deepStrictEqual(
    await main.importFSPromisesReadDir(), ['mock', 'local'])
})

test('mocks await import node:fs/promises (global)', async () => {
  const main = await esmock.p('../local/usesInlineBuiltinImportChild.js', {}, {
    'node:fs/promises': {
      readdir: () => (['mock', 'global'])
    }
  })

  assert.deepStrictEqual(
    await main.importFSPromisesReadDir(), ['mock', 'global'])
})

// https://github.com/iambumblehead/esmock/issues/284
// older applications may export names that are reserved in newer runtimes
//
// express exports this...
// ```js
// exports.static = require('serve-static');
// ```
test('mocks express, exports disallowed keyword "static"', async () => {
  const calls = []

  assert.ok(await esmock('../local/usesExpress.js', import.meta.url, {
    express: {
      Router: {
        get: (path, fn) => {
          calls.push([path, fn])
        }
      }
    }
  }))
})
