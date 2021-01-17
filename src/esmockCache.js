import module from 'module';

const esmockCache = {
  activeModuleIds : {},
  liveModuleDetached : {}
};

const esmockCacheActivePurge = () => {
  Object.keys(esmockCache.activeModuleIds).forEach(esmockCacheKey => {
    delete module._cache[esmockCacheKey];
  });

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
  esmockCacheActivePurge,
  esmockCacheActiveSet,
  esmockCacheLiveModuleDetachedSet,
  esmockCacheLiveModuleDetachedGet
};
