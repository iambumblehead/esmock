import {
  esmockPathCalleeDirJoin
} from './esmockPath.js';

import {
  esmockCache,
  esmockNextKey,
  esmockModuleStoreSet,
  esmockAddMocked,
  esmockImportedModuleSanitize
} from './esmockModule.js';

// import module from 'module';
// console.log('module', Object.keys( module ));
/*
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
*/

const esmock = async ( modulepath, mockDefs ) => {
  const key = esmockAddMocked( modulepath, mockDefs );
    console.log({ mockDefs });
/*
  const esmockCacheKey =
      esmockPathCalleeDirJoin( modulepath ) + `?mock=${esmockNextKey()}`;

    Object.keys( mockDefs ).reduce( (cache, key) => {
        console.log({ key })
      cache[`esmockCacheKey&${esmockPathCalleeDirJoin( key )}`] = mockDefs[key];

      return cache;
  }, esmockCache );
*/    
  const [ importedModule ] = await Promise.all([
      // import( esmockPathCalleeDirJoin( modulepath ) + `?mock=${key}` )
      import( key )
  ]);

  return esmockImportedModuleSanitize( importedModule );
}

export default esmock;
