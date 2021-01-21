import module from 'module';
import path from 'path';

const esmockCache = {
  activeModuleIds : {},
  liveModuleDetached : {},
  resolvedPaths : {},
  mockDefinitions : {}
};

const esmockCachePurge = pathKey => {
  delete module._cache[pathKey];
};

const esmockCacheActivePurge = () => {
  Object.keys(esmockCache.activeModuleIds)
    .forEach(esmockCachePurge);

  esmockCache.activeModuleIds = {};
};

const esmockCacheActiveSet = mockModulePathFull =>
  esmockCache.activeModuleIds[mockModulePathFull] = true;

// eslint-disable-next-line max-len
const esmockCacheMockDefinitionSet = (loadKey, mockPathFull, mockKey, mockDef) => {
  const cache = esmockCache.mockDefinitions;

  cache[loadKey] = cache[loadKey] || [];
  cache[loadKey].push(mockPathFull);
  cache[loadKey + mockPathFull] = mockDef;

  return cache;
};

const esmockCacheMockDefinitionGet = loadKeyPathFull => (
  esmockCache.mockDefinitions[loadKeyPathFull]
);

const esmockCacheLiveModuleDetachedSet = (liveModulePath, detachedModule) => {
  esmockCache.liveModuleDetached[liveModulePath] = detachedModule;

  return detachedModule;
};

const esmockCacheLiveModuleDetachedGet = liveModulePath => (
  esmockCache.liveModuleDetached[liveModulePath]);

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

export {
  esmockCache,
  esmockCachePurge,
  esmockCacheMockDefinitionSet,
  esmockCacheMockDefinitionGet,
  esmockCacheActivePurge,
  esmockCacheActiveSet,
  esmockCacheLiveModuleDetachedSet,
  esmockCacheLiveModuleDetachedGet,
  esmockCacheResolvedPathGet,
  esmockCacheResolvedPathSet
};
