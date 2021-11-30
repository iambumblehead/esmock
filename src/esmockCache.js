const esmockCache = {
  isESM : {},

  // record of fullpaths with associated mocks
  // eg, { '/path/to/mock.js': true }
  mockDefs : {}
};

const esmockCacheSet = (key, mockDef) => (
  esmockCache.mockDefs[key] = mockDef);

const esmockCacheGet = key => (
  esmockCache.mockDefs[key]);

const esmockCacheResolvedPathIsESMGet = mockPathFull => (
  esmockCache.isESM[mockPathFull]);

const esmockCacheResolvedPathIsESMSet = (mockPathFull, isesm) => (
  esmockCache.isESM[mockPathFull] = isesm);

Object.assign(global, { esmockCacheGet });

export {
  esmockCache,
  esmockCacheSet,
  esmockCacheGet,
  esmockCacheResolvedPathIsESMGet,
  esmockCacheResolvedPathIsESMSet
};
