import module from 'module';
import resolvewith from 'resolvewithplus';

import {
  esmockPathCallee,
  esmockPathFullIsLocalModule
} from './esmockPath.js';

import {
  esmockLiveModuleApply,
  esmockLiveModuleDetached
} from './esmockLiveModule.js';

import {
  esmockCache,
  esmockCacheActiveSet,
  esmockCacheLiveModuleDetachedSet,
  esmockCacheLiveModuleDetachedGet
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

const esmockAddMocked = (modulePath, mockDefs) => {
  const calleePath = esmockPathCallee();
  const modulePathFull = resolvewith(modulePath, calleePath);
  const esmockCacheKey = 'file://:rootmodulepath?key=:key'
    .replace(/:rootmodulepath/, modulePathFull)
    .replace(/:key/, esmockNextKey());

  Object.keys(mockDefs).reduce((cache, key) => {
    const mockedPathFull = resolvewith(key, calleePath);

    cache[esmockCacheKey] = cache[esmockCacheKey] || [];
    cache[esmockCacheKey].push(mockedPathFull);
    cache[esmockCacheKey + mockedPathFull] = mockDefs[key];

    return cache;
  }, esmockCache);

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

module._load = (path, context, ...args) => {
  const mockId = esmockModuleContextFindMockId(context);
  const mockModulePathFull = resolvewith(path, context.filename);
  const mockModuleId = mockId + mockModulePathFull;
  const mockModuleDef = esmockCache[mockModuleId];
  const detachedModuleDef = esmockCacheLiveModuleDetachedGet(
    mockModulePathFull);

  // all local modules are reloaded everytime to clear any
  // stale mock data. 'core' modules and 'node_modules' are only
  // cleared if they are to be or have been mocked
  if (mockId && (esmockPathFullIsLocalModule(mockModulePathFull)
                 || (mockModuleDef || detachedModuleDef))) {
    delete module._cache[mockModulePathFull];
  }

  const liveModule = esmockModuleLoadNative(path, context, ...args);

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

export {
  esmockCache,
  esmockNextKey,
  esmockAddMocked,
  esmockImportedModuleSanitize
};
