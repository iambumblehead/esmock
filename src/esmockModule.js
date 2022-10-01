import fs from 'fs'
import resolvewith from 'resolvewithplus'

import {
  esmockTreeIdSet,
  esmockTreeIdGet,
  esmockCacheSet,
  esmockCacheResolvedPathIsESMGet,
  esmockCacheResolvedPathIsESMSet
} from './esmockCache.js'

const isObj = o => typeof o === 'object' && o
const isDefaultIn = o => isObj(o) && 'default' in o
const isDirPathRe = /^\.?\.?([a-zA-Z]:)?(\/|\\)/
const esmockNextId = ((id = 0) => () => ++id)()

const esmockModuleIdNotFoundError = (moduleId, parent) => new Error(
  `invalid moduleId: "${moduleId}" (used by ${parent})`
    .replace(process.cwd(), '.')
    .replace(process.env.HOME, '~'))

const esmockModuleMergeDefault = (defLive, defMock) =>
  (isObj(defLive) && isObj(defMock))
    ? Object.assign({}, defLive, defMock)
    : defMock

const esmockModuleApply = (defLive, defMock, fileURL) => {
  const def = Object.assign({}, defLive || {}, {
    default: esmockModuleMergeDefault(
      isDefaultIn(defLive) && defLive.default,
      isDefaultIn(defMock) ? defMock.default : defMock)
  }, defMock)

  // if safe, an extra "default.default" is added for compatibility with
  // babel-generated dist cjs files which also define "default.default"
  if (!resolvewith.iscoremodule(fileURL) && Object.isExtensible(def.default))
    def.default.default = def.default

  return def
}

// eslint-disable-next-line max-len
const esmockModuleESMRe = /(^\s*|[});\n]\s*)(import\s+(['"]|(\*\s+as\s+)?[^"'()\n;]+\s+from\s+['"]|\{)|export\s+\*\s+from\s+["']|export\s+(\{|default|function|class|var|const|let|async\s+function))/

// returns cached results when available
const esmockModuleIsESM = (fileURL, isesm) => {
  isesm = esmockCacheResolvedPathIsESMGet(fileURL)

  if (typeof isesm === 'boolean')
    return isesm

  isesm = !resolvewith.iscoremodule(fileURL)
    && isDirPathRe.test(fileURL)
    && esmockModuleESMRe.test(fs.readFileSync(fileURL, 'utf-8'))

  esmockCacheResolvedPathIsESMSet(fileURL, isesm)

  return isesm
}

// return the default value directly, so that the esmock caller
// does not need to lookup default as in "esmockedValue.default"
const esmockModuleImportedSanitize = (imported, esmkTreeId) => {
  const importedDefault = isDefaultIn(imported) && imported.default

  if (/boolean|string|number/.test(typeof importedDefault))
    return imported
  
  // ex, non-extensible "[object Module]": import * as fs from 'fs'; export fs;
  return Object.isExtensible(importedDefault)
    ? Object.assign(importedDefault, imported, { esmkTreeId })
    : Object.assign({}, importedDefault, imported, { esmkTreeId })
}

const esmockModuleImportedPurge = modulePathKey => {
  const purgeKey = key => key === 'null' || esmockCacheSet(key, null)
  const longKey = esmockTreeIdGet(modulePathKey.split('esmk=')[1])
  const [url, keys] = longKey.split('#-#esmkdefs=')

  String(keys).split('#-#').forEach(purgeKey)
  String(url.split('esmkgdefs=')[1]).split('#-#').forEach(purgeKey)
}

const esmockModuleCreate = async (treeid, key, fileURL, defMock, opt) => {
  const isesm = esmockModuleIsESM(fileURL)
  const def = esmockModuleApply(
    opt.strict || !fileURL || await import(fileURL), defMock, fileURL)
  const mockExportNames = Object.keys(def).sort().join()
  const mockModuleKey = (fileURL || 'file:///' + key) + '?' + [
    'esmockKey=' + treeid,
    'esmockModuleKey=' + key,
    'isesm=' + isesm,
    fileURL ? 'found' : 'notfound=' + key,
    mockExportNames ? 'exportNames=' + mockExportNames : 'exportNone'
  ].join('&')

  esmockCacheSet(mockModuleKey, def)

  return mockModuleKey
}

const esmockModuleId = async (parent, treeid, defs, ids, opt, mocks, id) => {
  ids = ids || Object.keys(defs)
  id = ids[0]
  mocks = mocks || []

  if (!id) return mocks

  const mockedPathFull = resolvewith(id, parent)
  if (!mockedPathFull && opt.isModuleNotFoundError !== false)
    throw esmockModuleIdNotFoundError(id, parent)

  mocks.push(
    await esmockModuleCreate(treeid, id, mockedPathFull, defs[id], opt))

  return esmockModuleId(parent, treeid, defs, ids.slice(1), opt, mocks)
}

const esmockModule = async (moduleId, parent, defs, gdefs, opt) => {
  const moduleFileURL = resolvewith(moduleId, parent)
  if (!moduleFileURL)
    throw esmockModuleIdNotFoundError(moduleId, parent)

  const treeid = typeof opt.key === 'number' ? opt.key : esmockNextId()
  const treeidspec = `${moduleFileURL}?key=${treeid}?` + [
    'esmkgdefs=' + (gdefs && (await esmockModuleId(
      parent, treeid, gdefs, Object.keys(gdefs), opt)).join('#-#') || 0),
    'esmkdefs=', (defs && (await esmockModuleId(
      parent, treeid, defs, Object.keys(defs), opt)).join('#-#') || 0)
  ].join('#-#')

  esmockTreeIdSet(String(treeid), treeidspec)

  return moduleFileURL + `?esmk=${treeid}`
}

export default Object.assign(esmockModule, {
  purge: esmockModuleImportedPurge,
  sanitize: esmockModuleImportedSanitize
})
