import {
  esmockModuleMock,
  esmockModuleImportedPurge,
  esmockModuleImportedSanitize
} from './esmockModule.js';

import {
  esmockCache
} from './esmockCache.js';

const esmock = async (modulePath, mockDefs, globalDefs, opt) => {
  // this functions caller is stack item '2'
  const calleePath = new Error().stack.split('\n')[2]
    .replace(/^.*file:\/\//, '') // rm everything before filepathfe
    .replace(/:[\d]*:[\d]*.*$/, '') // rm line and row number
    .replace(/^.*:/, ''); // rm windows-style drive locations
  const modulePathKey = await esmockModuleMock(
    calleePath, modulePath, mockDefs || {}, globalDefs || {}, opt || {});

  const importedModule = await import(modulePathKey);

  esmockModuleImportedPurge(modulePathKey);
  
  return esmockModuleImportedSanitize(importedModule);
};

esmock.esmockCache = esmockCache;

export default esmock;
