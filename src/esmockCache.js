const esmockCache = {
  isESM: {},

  // record of fullpaths with associated mocks
  // eg, { '/path/to/mock.js': true }
  mockDefs: {}
};

const esmockKeySet = (key, keylong) => (
  global.mockKeys[String(key)] = keylong);

const esmockKeyGet = key => (
  global.mockKeys[String(key)]);

const esmockCacheSet = (key, mockDef) => (
  esmockCache.mockDefs[key] = mockDef);

const esmockCacheGet = key => (
  esmockCache.mockDefs[key]);

const esmockCacheResolvedPathIsESMGet = mockPathFull => (
  esmockCache.isESM[mockPathFull]);

const esmockCacheResolvedPathIsESMSet = (mockPathFull, isesm) => (
  esmockCache.isESM[mockPathFull] = isesm);

Object.assign(global, {
  esmockCacheGet,
  esmockKeyGet,
  mockKeys: {}
});

export {
  esmockCache,
  esmockCacheSet,
  esmockCacheGet,
  esmockKeySet,
  esmockKeyGet,
  esmockCacheResolvedPathIsESMGet,
  esmockCacheResolvedPathIsESMSet
};
