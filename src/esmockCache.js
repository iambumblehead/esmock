import module from 'module';
import path from 'path';

const esmockCache = {
  activeModuleIds : {},
  liveModuleDetached : {},
  resolvedPaths : {}
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
  esmockCacheActivePurge,
  esmockCacheActiveSet,
  esmockCacheLiveModuleDetachedSet,
  esmockCacheLiveModuleDetachedGet,
  esmockCacheResolvedPathGet,
  esmockCacheResolvedPathSet
};
