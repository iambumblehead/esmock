import module from 'module';
import resolvewith from 'resolvewithplus';
import formurlencoded from 'form-urlencoded';

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
  esmockCachePurge,
  esmockCacheMockDefinitionSet,
  esmockCacheMockDefinitionGet,
  esmockCacheLiveModuleDetachedSet,
  esmockCacheLiveModuleDetachedGet,
  esmockCacheResolvedPathGet,
  esmockCacheResolvedPathSet,
  esmockCacheResolvePathKey,
  esmockCachePathFullSet
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

  console.log('imported f', importedModule);
  // throw new Error('--');
  return importedModule;
};

const esmockNextKey = ((key = 0) => () => ++key)();

const esmockCacheResolvedPathGetCreate = (calleePath, modulePath) => (
  esmockCacheResolvedPathGet(calleePath, modulePath)
    || esmockCacheResolvedPathSet(
      calleePath, modulePath, resolvewith(modulePath, calleePath))
);

'detect root module is loaded in cached'
'compare w/ new definition to detect (and build) default and reg namespace'
const esmockModuleConstructed = async ( rootKey, key, fullpathroot, fullpathtarget, newdef ) => {
  const modulerootcache = null;
  const mockDefinitionKey = formurlencoded.default({ rootKey, key });

  console.log('GLGOGOGO');
  console.log( fullpathtarget );
  const mockDefinitionOriginal = await import(
    fullpathtarget + '?' + mockDefinitionKey);

  console.log('VVVVVVVVVVVVVVVVV');
  
  console.log('loading', mockDefinitionOriginal);
  const mockDefinitionFinal = esmockLiveModuleApply(
    mockDefinitionOriginal, newdef);


  console.log({
    mockDefinitionFinal
  });
  // const mockDefinitionValue = 
  
  console.log({
    fullpathtarget,
    rootKey,
    key
  });

  throw new Error('applying new definition and storing', key);

  console.log( 'GO', key, fullpathroot, fullpathtarget, moduletarget );
};

const esmockModulesConstructed = async ( modulePathFull, entries, calleePath, cachekey, res = {} ) => {
  console.log('mock modules constructed', entries );
  if ( !entries.length )
    return res;

  const [ [ key, def ] ] = entries;
  const mockedPathFull = esmockCacheResolvedPathGetCreate(calleePath, key);

  const esmKey = {
    key,
    fullpathroot : modulePathFull,
    fullpathtarget : mockedPathFull
  };
    
  const finalModule = await esmockModuleConstructed(
    cachekey,
    key,
    esmKey.fullpathroot,
    esmKey.fullpathtarget,
    def
  );

  console.log('final module', finalModule);
};

const esmockAddMocked = async (calleePath, modulePath, mockDefs, fn) => {
  const modulePathFull = esmockCacheResolvedPathGetCreate(
    calleePath, modulePath);
  const key = esmockNextKey();
  const esmockCacheKey = 'file://:rootmodulepath?key=:key'
    .replace(/:rootmodulepath/, modulePathFull)
    .replace(/:key/, key);

  esmockCachePathFullSet(modulePathFull);

  // what is goin on here...
  const modulesConstructed = await esmockModulesConstructed(
    modulePathFull,
    Object.entries(mockDefs),
    calleePath,
    esmockCacheKey
  );
  
  Object.keys(mockDefs).forEach(key => {
    const mockedPathFull = esmockCacheResolvedPathGetCreate(calleePath, key);

    // if no default definition AND
    // if only one key or not play object...
    // define on 'default'
    // choose from 'mock' caller default or not, because merges with existing module
    
    // const esmKey = formurlencoded.default({
    // detect from live module ....
    // detect load if not cached, compare with new definition
    const esmKey = {
      key,
      fullpathroot : modulePathFull,
      fullpathtarget : mockedPathFull
    };
    
    esmockModuleConstructed(
      key,
      esmKey.fullpathroot,
      esmKey.fullpathtarget
    );

    console.log(mockedPathFull, mockDefs[key]);
    console.log(esmKey);

    throw new Error('--');
    
    esmockCachePathFullSet(
      esmockCacheResolvePathKey(modulePathFull, key));

    esmockCachePathFullSet(mockedPathFull);
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

const esmockModuleLoad = (path, context, isMain) => {
  // do not engage custom behaviour unless module has been mocked
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
    esmockCachePurge(mockModulePathFull);
  }

  const liveModule = esmockModuleLoadNative(path, context, isMain);

  if (mockModuleDef) {
    esmockCacheActiveSet(mockModulePathFull);

    const liveModuleDetached = detachedModuleDef
          || esmockCacheLiveModuleDetachedSet(
            mockModulePathFull, esmockLiveModuleDetached(liveModule));

    const mockModule = esmockLiveModuleApply(
      liveModule, liveModuleDetached, mockModuleDef);

    esmockCachePurge(mockModulePathFull);

    return mockModule;
  }

  return liveModule;
};

module._load = (path, context, isMain) => (
  context
    ? esmockModuleLoad(path, context, isMain)
    : esmockModuleLoadNative(path, context, isMain));

export {
  esmockCache,
  esmockNextKey,
  esmockAddMocked,
  esmockImportedModuleSanitize
};
