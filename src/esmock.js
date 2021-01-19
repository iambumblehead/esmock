import { Mutex } from 'async-mutex';

import {
  esmockAddMocked,
  esmockImportedModuleSanitize,
} from './esmockModule.js';

import {
  esmockCachePurge,
  esmockCacheActivePurge
} from './esmockCache.js';

const mutex = new Mutex();

const esmock = async (modulePath, mockDefs = {}) => {
  const modulePathKey = esmockAddMocked(
    modulePath, mockDefs, esmockCachePurge);

  return await mutex.runExclusive(async () => {
    // if any modules exist in module._cache when import occurs,
    // they are returned regardless of what occurs in module._load
    esmockCacheActivePurge();
    const importedModule = await import(modulePathKey);

    const esm = esmockImportedModuleSanitize(importedModule);

    // re-obtain reference to the object
    // delete it from module before garbage collected

    return esm;
  });
};

export default esmock;
