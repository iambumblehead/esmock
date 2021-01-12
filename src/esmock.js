import {
  esmockPathCalleeDirJoin
} from './esmockPath.js';

import {
  esmockModuleStoreSet
} from './esmockModule.js';

// import module from 'module';
// console.log('module', Object.keys( module ));

const esmockImportedModuleSanitize = importedModule => {
  if ( 'default' in importedModule ) {
    importedModule = Object.keys( importedModule ).reduce( (sanitize, key) => {
      if ( key !== 'default' ) {
        sanitize[key] = importedModule[key]
      }
      
      return sanitize;
    }, importedModule.default )
  }

  return importedModule;
}

const esmock = async modulepath => {
  const [ importedModule ] = await Promise.all([
    import( esmockPathCalleeDirJoin( modulepath ) + '?hey=1' )
  ]);

  return esmockImportedModuleSanitize( importedModule );
  
}

export default esmock;
