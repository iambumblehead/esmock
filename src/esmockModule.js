import fs from 'fs'
import url from 'url'
import resolvewith from 'resolvewithplus'
import esmockErr from './esmockErr.js'
import esmockIsESMRe from './esmockIsESMRe.js'

import {
  esmockTreeIdSet,
  esmockTreeIdGet,
  esmockCacheSet,
  esmockModuleIdSourceSet,
  esmockCacheResolvedPathIsESMGet,
  esmockCacheResolvedPathIsESMSet
} from './esmockCache.js'

const isObj = o => typeof o === 'object' && o
const isDefaultIn = o => isObj(o) && 'default' in o
const isDirPathRe = /^\.?\.?([a-zA-Z]:)?(\/|\\)/
const nextId = ((id = 0) => () => ++id)()
const objProto = Object.getPrototypeOf({})
const isPlainObj = o => Object.getPrototypeOf(o) === objProto
const iscoremodule = resolvewith.iscoremodule
const isJSONExtnRe = /\.json$/i

// assigning the object to its own prototypal inheritor can error, eg
//   'Cannot assign to read only property \'F_OK\' of object \'#<Object>\''
// 
// if not plain obj, assign enumerable vals only. core modules === plain obj
const esmockModuleMerge = (defLive, def) => isPlainObj(defLive)
  ? Object.assign({}, defLive, def)
  : Object.assign(Object.keys(defLive).reduce(
    (prev, k) => (Object.defineProperty(prev, k, {
      value: defLive[k],
      writable: true
    }), prev), Object.create(defLive)), def)

const esmockModuleMergeDefault = (defLive, def) =>
  (isObj(defLive) && isObj(def)) ? esmockModuleMerge(defLive, def) : def

const esmockModuleApply = (defLive, def, fileURL) => {
  // no fileURL here indicates 'import' mock, 'default' not needed
  if (fileURL === null || isJSONExtnRe.test(fileURL))
    return Object.assign({}, defLive || {}, def)

  if (Array.isArray(def))
    return { default: def.slice() }

  def = Object.assign({}, defLive || {}, {
    default: esmockModuleMergeDefault(
      isDefaultIn(defLive) && defLive.default,
      isDefaultIn(def) ? def.default : def)
  }, def)

  // if safe, an extra "default.default" is added for compatibility with
  // babel-generated dist cjs files which also define "default.default"
  if (!iscoremodule(fileURL) && Object.isExtensible(def.default))
    def.default.default = def.default

  return def
}

// returns cached results when available
const esmockModuleIsESM = (fileURL, isesm) => {
  isesm = esmockCacheResolvedPathIsESMGet(fileURL)

  if (typeof isesm === 'boolean')
    return isesm

  isesm = !iscoremodule(fileURL)
    && isDirPathRe.test(fileURL)
    && esmockIsESMRe.test(fs.readFileSync(fileURL, 'utf-8'))

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

const esmockModuleImportedPurge = treeid => {
  const purgeKey = key => key === 'null' || esmockCacheSet(key, null)
  const longKey = esmockTreeIdGet(treeid.split('esmk=')[1])
  const [url, keys] = longKey.split('#-#esmkdefs=')

  String(keys).split('#-#').forEach(purgeKey)
  String(url.split('esmkgdefs=')[1]).split('#-#').forEach(purgeKey)
}

const esmockImport = async fileURL => isJSONExtnRe.test(fileURL)
  ? JSON.parse(fs.readFileSync(new url.URL(fileURL), 'utf-8'))
  : import(fileURL)

const esmockModuleCreate = async (treeid, def, id, fileURL, opt) => {
  def = esmockModuleApply(
    opt.strict || !fileURL || await esmockImport(fileURL), def, fileURL)

  const mockModuleKey = (fileURL || 'file:///' + id) + '?' + [
    'esmkTreeId=' + treeid,
    'esmkModuleId=' + id,
    'isfound=' + Boolean(fileURL),
    'isesm=' + esmockModuleIsESM(fileURL),
    'exportNames=' + Object.keys(def).sort().join()
  ].join('&')

  if (isJSONExtnRe.test(fileURL)) {
    esmockModuleIdSourceSet(mockModuleKey, JSON.stringify(def))
  }

  esmockCacheSet(mockModuleKey, def)

  return mockModuleKey
}

const esmockModuleId = async (parent, treeid, defs, ids, opt, mocks, id) => {
  ids = ids || Object.keys(defs)
  id = ids[0]
  mocks = mocks || []

  if (!id) return mocks

  const fileURL = opt.resolver(id, parent)
  if (!fileURL && opt.isModuleNotFoundError !== false && id !== 'import')
    throw esmockErr.errModuleIdNotFound(id, parent)

  mocks.push(await esmockModuleCreate(treeid, defs[id], id, fileURL, opt))

  return esmockModuleId(parent, treeid, defs, ids.slice(1), opt, mocks)
}

const esmockModule = async (moduleId, parent, defs, gdefs, opt) => {
  const moduleFileURL = opt.resolver(moduleId, parent)
  if (!moduleFileURL)
    throw esmockErr.errModuleIdNotFound(moduleId, parent)

  const gkeys = gdefs ? Object.keys(gdefs) : []
  const dkeys = defs ? Object.keys(defs) : []
  if (opt.strict === 3 && !gkeys.length && !dkeys.length)
    throw esmockErr.errModuleIdNoDefs(moduleId, parent)

  const treeid = typeof opt.id === 'number' ? opt.id : nextId()
  const treeidspec = `${moduleFileURL}?key=${treeid}&strict=${opt.strict}?` + [
    'esmkgdefs=' + (gkeys.length && (await esmockModuleId(
      parent, treeid, gdefs, gkeys, opt)).join('#-#') || 0),
    'esmkdefs=', (dkeys.length && (await esmockModuleId(
      parent, treeid, defs, dkeys, opt)).join('#-#') || 0)
  ].join('#-#')

  esmockTreeIdSet(String(treeid), treeidspec)

  return moduleFileURL + `?esmk=${treeid}`
}

export default Object.assign(esmockModule, {
  purge: esmockModuleImportedPurge,
  sanitize: esmockModuleImportedSanitize
})
