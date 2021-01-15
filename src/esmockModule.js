import module from 'module';
import {
  esmockPathCalleeDirJoin
} from './esmockPath.js';

const esmockCache = {};

const esmockImportedModuleSanitize = importedModule => {
  if ( 'default' in importedModule ) {
    importedModule = Object.keys( importedModule ).reduce( (sanitize, key) => {
      if ( key !== 'default' ) {
          sanitize[key] = importedModule[key];
      }

      return sanitize;
    }, importedModule.default );
  }

  return importedModule;
};

const esmockNextKey = ( ( key = 0 ) => () => {
    return ++key;
})();

const esmockModuleStore = {};

const esmockAddMocked = ( modulePath, mockDefs ) => {
  const esmockCacheKey =
        'file://:rootmodulepath?key=:key'
        .replace(/:rootmodulepath/, esmockPathCalleeDirJoin( modulePath ) )
        .replace(/:key/, esmockNextKey() );

  Object.keys( mockDefs ).reduce( (cache, key) => {
    cache[`${esmockCacheKey}&${esmockPathCalleeDirJoin( key )}`] = mockDefs[key];

    return cache;
  }, esmockCache );

  return esmockCacheKey;
};

const esmockModuleLoadNative = module._load;

module._load = (path, context, ...args ) => {

    
  console.log({
    esmockCache,
    path,
    context: Object.keys( context ),
    contextId: context.id,
    contextParent: context.parent
  })

  return esmockModuleLoadNative( path, context, ...args );
}

const esmockModuleStoreSet = () => {};

export {
  esmockCache,
  esmockNextKey,
  esmockModuleStoreSet,
  esmockAddMocked,
  esmockImportedModuleSanitize
}
