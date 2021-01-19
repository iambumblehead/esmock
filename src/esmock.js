import { Mutex } from 'async-mutex';

import {
  esmockPathCallee,
} from './esmockPath.js';

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
  const calleePath = esmockPathCallee();

  return await mutex.runExclusive(async () => {
    const modulePathKey = esmockAddMocked(
      calleePath, modulePath, mockDefs, esmockCachePurge);

    // if any modules exist in module._cache when import occurs,
    // they are returned regardless of what occurs in module._load
    esmockCacheActivePurge();
    const importedModule = await import(modulePathKey);

    return esmockImportedModuleSanitize(importedModule);
  });
};

export default esmock;
