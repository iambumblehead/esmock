import module from 'module';

const esmockCache = {
  activeModuleIds : {},
  liveModuleDetached : {}
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

export {
  esmockCache,
  esmockCachePurge,
  esmockCacheActivePurge,
  esmockCacheActiveSet,
  esmockCacheLiveModuleDetachedSet,
  esmockCacheLiveModuleDetachedGet
};
