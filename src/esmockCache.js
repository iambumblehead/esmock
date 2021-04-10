import path from 'path';

const esmockCache = {
  resolvedPaths : {},
  isESM : {},

  // record of fullpaths with associated mocks
  // eg, { '/path/to/mock.js': true }
  mockDefs : {}
};

const esmockCacheSet = (key, mockDef) => (
  esmockCache.mockDefs[key] = mockDef);

const esmockCacheGet = key => (
  esmockCache.mockDefs[key]);

const esmockCacheResolvePathKey = (calleePath, localPath) => (
  path.join(path.dirname(calleePath), localPath));

const esmockCacheResolvedPathSet = (calleePath, localPath, resolvedPath) => {
  esmockCache.resolvedPaths[
    esmockCacheResolvePathKey(calleePath, localPath)
  ] = resolvedPath;

  return resolvedPath;
};

const esmockCacheResolvedPathGet = (calleePath, localPath) => (
  esmockCache.resolvedPaths[esmockCacheResolvePathKey(calleePath, localPath)]
);

const esmockCacheResolvedPathIsESMGet = mockPathFull => (
  esmockCache.isESM[mockPathFull]);

const esmockCacheResolvedPathIsESMSet = (mockPathFull, isesm) => (
  esmockCache.isESM[mockPathFull] = isesm);

Object.assign(global, { esmockCacheGet });

export {
  esmockCache,
  esmockCacheSet,
  esmockCacheGet,
  esmockCacheResolvedPathGet,
  esmockCacheResolvedPathSet,
  esmockCacheResolvePathKey,

  esmockCacheResolvedPathIsESMGet,
  esmockCacheResolvedPathIsESMSet
};
