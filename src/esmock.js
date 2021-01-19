import {
  esmockAddMocked,
  esmockImportedModuleSanitize,
} from './esmockModule.js';

import {
  esmockCachePurge,
  esmockCacheActivePurge
} from './esmockCache.js';

const esmock = async (modulePath, mockDefs = {}) => {
  const modulePathKey = esmockAddMocked(
    modulePath, mockDefs, esmockCachePurge);

  // if any modules exist in module._cache when import occurs,
  // they are returned regardless of what occurs in module._load
  esmockCacheActivePurge();
  const importedModule = await import(modulePathKey);

  return esmockImportedModuleSanitize(importedModule);
};

export default esmock;
