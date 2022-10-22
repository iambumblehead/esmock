const esmockCache = {
  isESM: {},

  // record of fullpaths with associated mocks
  // eg, { '/path/to/mock.js': true }
  mockDefs: {}
}

const esmockTreeIdSet = (key, keylong) => (
  global.mockKeys[String(key)] = keylong)

const esmockTreeIdGet = key => (
  global.mockKeys[String(key)])

const esmockCacheSet = (key, mockDef) => (
  global.esmockCache.mockDefs[key] = mockDef)

const esmockCacheGet = key => (
  global.esmockCache.mockDefs[key])

const esmockCacheResolvedPathIsESMGet = mockPathFull => (
  esmockCache.isESM[mockPathFull])

const esmockCacheResolvedPathIsESMSet = (mockPathFull, isesm) => (
  esmockCache.isESM[mockPathFull] = isesm)

Object.assign(global, {
  esmockCache,
  esmockCacheGet,
  esmockTreeIdGet,
  mockKeys: {}
})

export {
  esmockCache as default,
  esmockCacheSet,
  esmockCacheGet,
  esmockTreeIdSet,
  esmockTreeIdGet,
  esmockCacheResolvedPathIsESMGet,
  esmockCacheResolvedPathIsESMSet
}
