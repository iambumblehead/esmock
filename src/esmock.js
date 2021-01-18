import {
  esmockAddMocked,
  esmockImportedModuleSanitize,
  esmockCacheActivePurge
} from './esmockModule.js';

const esmock = async (modulePath, mockDefs = {}) => {
  const modulePathKey = esmockAddMocked(modulePath, mockDefs);

  // if any modules exist in module._cache when import occurs,
  // they are returned regardless of what occurs in module._load
  esmockCacheActivePurge();
  const importedModule = await import(modulePathKey);

  return esmockImportedModuleSanitize(importedModule);
};

export default esmock;
