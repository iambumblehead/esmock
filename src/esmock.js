import {
  esmockPathCallee
} from './esmockPath.js';

import {
  esmockModuleMock,
  esmockModuleImportedPurge,
  esmockModuleImportedSanitize
} from './esmockModule.js';

import {
  esmockCache
} from './esmockCache.js';

const esmock = async (modulePath, mockDefs, globalDefs, opt) => {
  const calleePath = esmockPathCallee();
  const modulePathKey = await esmockModuleMock(
    calleePath, modulePath, mockDefs || {}, globalDefs || {}, opt || {});

  const importedModule = await import(modulePathKey);

  esmockModuleImportedPurge(modulePathKey);
  
  return esmockModuleImportedSanitize(importedModule);
};

esmock.esmockCache = esmockCache;

export default esmock;
