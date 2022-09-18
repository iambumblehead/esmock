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

const esmockModuleIdNotFoundError = (moduleId, parent) => new Error(
  `invalid moduleId: "${moduleId}" (used by :moduleParent)`
    .replace(/:moduleParent/, parent
      .replace(/^\/\//, '')
      .replace(process.cwd(), '.')
      .replace(process.env.HOME, '~')))

const esmockModuleMergeDefault = (defaultLive, defaultMock) => (
  (isObj(defaultLive) && isObj(defaultMock))
    ? Object.assign({}, defaultLive, defaultMock)
    : defaultMock)

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

  if (/boolean|string|number/.test(typeof importedDefault))
    return importedModule
  
  // an example of [object Module]: import * as mod from 'fs'; export mod;
  return Object.isExtensible(importedDefault)
    ? Object.assign(importedDefault, importedModule, { esmockKey })
    : Object.assign({}, importedDefault, importedModule, { esmockKey })
}

const esmockModuleImportedPurge = modulePathKey => {
  const purgeKey = key => key === 'null' || esmockCacheSet(key, null)
  const longKey = esmockKeyGet(modulePathKey.split('esmk=')[1])
  const [url, keys] = longKey.split('#-#esmockModuleKeys=')

  String(keys).split('#-#').forEach(purgeKey)
  String(url.split('esmockGlobals=')[1]).split('#-#').forEach(purgeKey)
}

const esmockNextKey = ((key = 0) => () => ++key)()

const esmockModuleCreate = async (esmockKey, key, fileURL, defMock, opt) => {
  const isesm = esmockModuleIsESM(fileURL)
  const defLive = opt.strict || opt.isfound === false || await import(fileURL)
  const def = esmockModuleApply(defLive, defMock, fileURL)
  const mockExportNames = Object.keys(def).sort().join()
  const mockModuleKey = fileURL + '?' + [
    'esmockKey=' + esmockKey,
    'esmockModuleKey=' + key,
    'isesm=' + isesm,
    opt.isfound === false ? 'notfound=' + key : 'found',
    mockExportNames ? 'exportNames=' + mockExportNames : 'exportNone'
  ].join('&')

  esmockCacheSet(mockModuleKey, def)

  return mockModuleKey
}

const esmockModuleId = async (parent, key, defs, ids, mocks, opt, id) => {
  ids = ids || Object.keys(defs)
  id = ids[0] // eslint-disable-line prefer-destructuring
  mocks = mocks || []

  if (!ids.length)
    return mocks

  let mockedPathFull = resolvewith(id, parent)
  if (!mockedPathFull && opt.isModuleNotFoundError === false) {
    mockedPathFull = 'file:///' + id
    opt = Object.assign({ isfound: false }, opt)
  }

  if (mockedPathFull === null)
    throw esmockModuleIdNotFoundError(id, parent)

  mocks.push(await esmockModuleCreate(key, id, mockedPathFull, defs[id], opt))

  return esmockModuleId(parent, key, defs, ids.slice(1), mocks, opt)
}

const esmockModule = async (parent, moduleId, defs, gdefs, opt) => {
  const moduleFileURL = resolvewith(moduleId, parent)
  const esmockKey = typeof opt.key === 'number' ? opt.key : esmockNextKey()
  const esmockModuleKeys = await esmockModuleId(
    parent, esmockKey, defs, Object.keys(defs), 0, opt)
  const esmockGlobalKeys = await esmockModuleId(
    parent, esmockKey, gdefs, Object.keys(gdefs), 0, opt)

  if (moduleFileURL === null)
    throw esmockModuleIdNotFoundError(moduleId, parent)

  const esmockKeyLong = moduleFileURL + '?' +
    'key=:esmockKey?esmockGlobals=:esmockGlobals#-#esmockModuleKeys=:moduleKeys'
      .replace(/:esmockKey/, esmockKey)
      .replace(/:esmockGlobals/, esmockGlobalKeys.join('#-#') || 'null')
      .replace(/:moduleKeys/, esmockModuleKeys.join('#-#'))

  esmockKeySet(String(esmockKey), esmockKeyLong)

  return moduleFileURL + `?esmk=${esmockKey}`
}

export default Object.assign(esmockModule, {
  purge: esmockModuleImportedPurge,
  sanitize: esmockModuleImportedSanitize
})
