import {
  esmockPathCallee
} from './esmockPath.js';

import {
  esmockAddMocked,
  esmockImportedModuleSanitize
} from './esmockModule.js';

const esmock = async (modulePath, mockDefs = {}) => {
  const calleePath = esmockPathCallee();
  const modulePathKey = await esmockAddMocked(
    calleePath, modulePath, mockDefs);

  const importedModule = await import(modulePathKey);

  // return importedModule;
  return esmockImportedModuleSanitize(importedModule);
};

export default esmock;
