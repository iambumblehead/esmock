import module from 'module';
import resolvewith from 'resolvewithplus';

import {
  esmockPathFullIsLocalModule
} from './esmockPath.js';

import {
  esmockLiveModuleApply,
  esmockLiveModuleDetached
} from './esmockLiveModule.js';

import {
  esmockCache,
  esmockCacheActiveSet,
  esmockCacheIsFullPathMocked,
  esmockCacheMockDefinitionSet,
  esmockCacheMockDefinitionGet,
  esmockCacheLiveModuleDetachedSet,
  esmockCacheLiveModuleDetachedGet,
  esmockCacheResolvedPathGet,
  esmockCacheResolvedPathSet
} from './esmockCache.js';

// return 'default' value with named exports alongside, because
// esmock callee cannot do this: `filedefault as esmock('./file.js');`
const esmockImportedModuleSanitize = importedModule => {
  if ('default' in importedModule) {
    importedModule = Object.keys(importedModule).reduce((sanitize, key) => {
      if (key !== 'default') {
        sanitize[key] = importedModule[key];
      }

      return sanitize;
    }, importedModule.default);
  }

  return importedModule;
};

const esmockNextKey = ((key = 0) => () => ++key)();

const esmockCacheResolvedPathGetCreate = (calleePath, modulePath) => (
  esmockCacheResolvedPathGet(calleePath, modulePath)
    || esmockCacheResolvedPathSet(
      calleePath, modulePath, resolvewith(modulePath, calleePath))
);

const esmockAddMocked = (calleePath, modulePath, mockDefs, fn) => {
  const modulePathFull = esmockCacheResolvedPathGetCreate(
    calleePath, modulePath);
  const esmockCacheKey = 'file://:rootmodulepath?key=:key'
    .replace(/:rootmodulepath/, modulePathFull)
    .replace(/:key/, esmockNextKey());

  Object.keys(mockDefs).forEach(key => {
    const mockedPathFull = esmockCacheResolvedPathGetCreate(calleePath, key);
    esmockCacheMockDefinitionSet(
      esmockCacheKey, mockedPathFull, key, mockDefs[key]);

    if (typeof fn === 'function') fn(mockedPathFull);
  });

  return esmockCacheKey;
};

const esmockModuleLoadNative = module._load;

const ismockModuleIsId = str => /^file:\/\/.*\?key=/.test(str);

const esmockModuleContextFindMockId = (context, idDefault = null) => {
  if (ismockModuleIsId(context.id)) {
    idDefault = context.id;
  } else if (context.parent) {
    idDefault = esmockModuleContextFindMockId(context.parent);
  }

  return idDefault;
};

const esmockModuleLoad = (path, context) => {
  const mockId = esmockModuleContextFindMockId(context);
  const mockModulePathFull = esmockCacheResolvedPathGetCreate(
    context.filename, path
  );
  const mockModuleId = mockId + mockModulePathFull;
  const mockModuleDef = esmockCacheMockDefinitionGet(mockModuleId);
  const detachedModuleDef = esmockCacheLiveModuleDetachedGet(
    mockModulePathFull);

  // all local modules are reloaded everytime to clear any
  // stale mock data. 'core' modules and 'node_modules' are only
  // cleared if they are to be or have been mocked
  if (mockId && (esmockPathFullIsLocalModule(mockModulePathFull)
                 || (mockModuleDef || detachedModuleDef))) {
    delete module._cache[mockModulePathFull];
  }

  const liveModule = esmockModuleLoadNative(path, context);

  if (mockModuleDef) {
    esmockCacheActiveSet(mockModulePathFull);

    const liveModuleDetached = detachedModuleDef
          || esmockCacheLiveModuleDetachedSet(
            mockModulePathFull, esmockLiveModuleDetached(liveModule));

    const mockModule = esmockLiveModuleApply(
      liveModule, liveModuleDetached, mockModuleDef);

    return mockModule;
  }

  return liveModule;
};

module._load = (path, context) => {
  // do not engage custom behaviour unless module has been mocked
  if (!esmockCacheIsFullPathMocked(context.filename)) {
    return esmockModuleLoad(path, context);
  }

  return esmockModuleLoad(path, context);
};

export {
  esmockCache,
  esmockNextKey,
  esmockAddMocked,
  esmockImportedModuleSanitize
};
