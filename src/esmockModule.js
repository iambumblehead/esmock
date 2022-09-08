import fs from 'fs'
import resolvewith from 'resolvewithplus'

import {
  esmockKeySet,
  esmockKeyGet,
  esmockCacheSet,
  esmockCacheResolvedPathIsESMGet,
  esmockCacheResolvedPathIsESMSet
} from './esmockCache.js'

const isObj = o => typeof o === 'object' && o
const isDefaultDefined = o => isObj(o) && 'default' in o
const isDirPathRe = /^\.?\.?([a-zA-Z]:)?(\/|\\)/

const esmockModuleMergeDefault = (defaultLive, defaultMock, merged)  => {
  const defaultLiveIsObj = isObj(defaultLive)
  const defaultMockIsObj = isObj(defaultMock)

  if (defaultLiveIsObj && defaultMockIsObj) {
    merged = Object.assign({}, defaultLive, defaultMock)
  } else if (defaultMock) {
    merged = defaultMock
  } else if (defaultLiveIsObj) {
    merged = Object.assign({}, defaultLive)
  } else if (defaultLive) {
    merged = defaultLive
  }

  return merged
}

const esmockModuleApply = (definitionLive, definitionMock, definitionPath) => {
  const isCorePath = resolvewith.iscoremodule(definitionPath)
  const definitionDefault = esmockModuleMergeDefault(
    isDefaultDefined(definitionLive) && definitionLive.default,
    isDefaultDefined(definitionMock) ? definitionMock.default : definitionMock)
  const definition = Object.assign({}, definitionLive || {}, {
    default: definitionDefault
  }, definitionMock)

  // if safe, an extra default definition is added for compatibility,
  // because babel-generated dist cjs files often import in this way,
  // note: core modules do not define "default.default"
  //   import package from 'package';
  //   package.default(); <- extra default definition
  if (!isCorePath && Object.isExtensible(definition.default))
    definition.default.default = definition.default

  return definition
}

// eslint-disable-next-line max-len
const esmockModuleESMRe = /(^\s*|[});\n]\s*)(import\s+(['"]|(\*\s+as\s+)?[^"'()\n;]+\s+from\s+['"]|\{)|export\s+\*\s+from\s+["']|export\s+(\{|default|function|class|var|const|let|async\s+function))/

// tries to return resolved value from a cache first
// else, builds value, stores in cache and returns
const esmockModuleIsESM = (mockPathFull, isesm) => {
  isesm = esmockCacheResolvedPathIsESMGet(mockPathFull)

  if (typeof isesm === 'boolean')
    return isesm

  isesm = !resolvewith.iscoremodule(mockPathFull)
    && isDirPathRe.test(mockPathFull)
    && esmockModuleESMRe.test(fs.readFileSync(mockPathFull, 'utf-8'))

  esmockCacheResolvedPathIsESMSet(mockPathFull, isesm)

  return isesm
}

// return the default value directly, so that the esmock caller
// does not need to lookup default as in "esmockedValue.default"
const esmockModuleImportedSanitize = (importedModule, esmockKey) => {
  const importedDefault = 'default' in importedModule && importedModule.default

  if (!/boolean|string|number/.test(typeof importedDefault)) {
    // an example of [object Module]: import * as mod from 'fs'; export mod;
    return Object.prototype.toString.call(importedDefault) === '[object Module]'
      ? Object.assign({}, importedDefault, importedModule, { esmockKey })
      : Object.assign(importedDefault, importedModule, { esmockKey })
  }

  return importedModule
}

const esmockModuleImportedPurge = modulePathKey => {
  const purgeKey = key => key === 'null' || esmockCacheSet(key, null)
  const longKey = esmockKeyGet(modulePathKey.split('esmk=')[1])
  const [url, keys] = longKey.split('#-#esmockModuleKeys=')

  String(keys).split('#-#').forEach(purgeKey)
  String(url.split('esmockGlobals=')[1]).split('#-#').forEach(purgeKey)
}

const esmockNextKey = ((key = 0) => () => ++key)()

// eslint-disable-next-line max-len
const esmockModuleCreate = async (esmockKey, key, mockPathFull, mockDef, opt) => {
  const isesm = esmockModuleIsESM(mockPathFull)
  const originalDefinition = opt.strict || opt.isfound === false
    || await import(mockPathFull)
  const mockDefinitionFinal = esmockModuleApply(
    originalDefinition, mockDef, mockPathFull)
  const mockExportNames = Object.keys(mockDefinitionFinal).sort().join()
  const mockModuleKey = `${mockPathFull}?` + [
    'esmockKey=' + esmockKey,
    'esmockModuleKey=' + key,
    'isesm=' + isesm,
    opt.isfound === false ? 'notfound=' + key : 'found',
    mockExportNames ? 'exportNames=' + mockExportNames : 'exportNone'
  ].join('&')

  esmockCacheSet(mockModuleKey, mockDefinitionFinal)

  return mockModuleKey
}

// eslint-disable-next-line max-len
const esmockModulesCreate = async (parent, moduleFileURL, esmockKey, defs, keys, mocks, opt) => {
  keys = keys || Object.keys(defs)
  mocks = mocks || []

  if (!keys.length)
    return mocks

  let mockedPathFull = resolvewith(keys[0], parent)
  if (!mockedPathFull && opt.isModuleNotFoundError === false) {
    mockedPathFull = 'file:///' + keys[0]
    opt = Object.assign({ isfound: false }, opt)
  }

  if (!mockedPathFull) {
    parent = parent
      .replace(/^\/\//, '')
      .replace(process.cwd(), '.')
      .replace(process.env.HOME, '~')
    throw new Error(`invalid moduleId: "${keys[0]}" (used by ${parent})`)
  }

  mocks.push(await esmockModuleCreate(
    esmockKey, keys[0], mockedPathFull, defs[keys[0]], opt))

  return esmockModulesCreate(
    parent, moduleFileURL, esmockKey, defs, keys.slice(1), mocks, opt)
}

const esmockModuleMock = async (parent, moduleId, defs, gdefs, opt) => {
  const moduleFileURL = resolvewith(moduleId, parent)
  const esmockKey = typeof opt.key === 'number' ? opt.key : esmockNextKey()
  const esmockModuleKeys = await esmockModulesCreate(
    parent, moduleFileURL, esmockKey, defs, Object.keys(defs), 0, opt)
  const esmockGlobalKeys = await esmockModulesCreate(
    parent, moduleFileURL, esmockKey, gdefs, Object.keys(gdefs), 0, opt)

  if (moduleFileURL === null)
    throw new Error(`invalid moduleId: "${moduleId}"`)

  const esmockKeyLong = moduleFileURL + '?' +
    'key=:esmockKey?esmockGlobals=:esmockGlobals#-#esmockModuleKeys=:moduleKeys'
      .replace(/:esmockKey/, esmockKey)
      .replace(/:esmockGlobals/, esmockGlobalKeys.join('#-#') || 'null')
      .replace(/:moduleKeys/, esmockModuleKeys.join('#-#'))

  esmockKeySet(String(esmockKey), esmockKeyLong)

  return moduleFileURL + `?esmk=${esmockKey}`
}

export {
  esmockModuleMock,
  esmockModuleImportedPurge,
  esmockModuleImportedSanitize
}
