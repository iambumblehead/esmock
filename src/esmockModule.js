import fs from 'fs';
import resolvewith from 'resolvewithplus';

import {
  esmockCache,
  esmockCacheSet,
  
  esmockCacheResolvedPathGet,
  esmockCacheResolvedPathSet,

  esmockCacheResolvedPathIsESMGet,
  esmockCacheResolvedPathIsESMSet
} from './esmockCache.js';

const esmockModuleApply = (definitionLive, definitionMock) => {
  const definition = Object.assign(
    {}, definitionLive, definitionMock);

  if (Object.keys(definitionMock).length === 0
    && typeof definitionMock !== 'object') {
    if (definition && 'default' in definition) {

      if (typeof definition.default === 'object'
        && 'default' in definition.default) {
        // some babel-generated files have nested default
        definition.default = definitionMock;
        definition.default.default = definitionMock;
      } else {
        definition.default = definitionMock;
      }
    }
  }

  return definition;
};

// eslint-disable-next-line max-len
const esmockModuleESMRe = /(^\s*|[}\);\n]\s*)(import\s+(['"]|(\*\s+as\s+)?[^"'\(\)\n;]+\s+from\s+['"]|\{)|export\s+\*\s+from\s+["']|export\s+(\{|default|function|class|var|const|let|async\s+function))/;

// tries to return resolved value from a cache first
// else, builds value, stores in cache and returns
const esmockModuleIsESM = (mockPathFull, isesm) => {
  isesm = esmockCacheResolvedPathIsESMGet(mockPathFull);

  if (typeof isesm === 'boolean')
    return isesm;

  isesm = esmockModuleESMRe.test(
    fs.readFileSync(mockPathFull, 'utf-8'));

  esmockCacheResolvedPathIsESMSet(mockPathFull, isesm);

  return isesm;
};

// return the default value directly, so that the esmock caller
// does not need to lookup default as in "esmockedValue.default"
const esmockImportedModuleSanitize = importedModule => {
  if ('default' in importedModule
    && !/boolean|string|number/.test(typeof importedModule.default)) {
    return Object.assign(importedModule.default, importedModule);
  }

  return importedModule;
};

const esmockImportedModulePurge = modulePathKey => modulePathKey
  .replace(/.*esmockModuleKeys=(.*)/, '$1')
  .split('#')
  .forEach(key => esmockCacheSet(key, null));

const esmockNextKey = ((key = 0) => () => ++key)();

// tries to return resolved path from a cache store first
// else, builds resolved path, stores in cache and returns
const esmockCacheResolvedPathGetCreate = (calleePath, modulePath) => (
  esmockCacheResolvedPathGet(calleePath, modulePath)
    || esmockCacheResolvedPathSet(
      calleePath, modulePath, resolvewith(modulePath, calleePath))
);

const esmockModuleCreate = async (esmockKey, key, mockPathFull, mockDef) => {
  const isesm = esmockModuleIsESM(mockPathFull);
  const mockDefinitionFinal = esmockModuleApply(
    await import(mockPathFull), mockDef);

  const mockModuleKey = `file://${mockPathFull}?` + [
    'esmockKey=' + esmockKey,
    'esmockModuleKey=' + key,
    'isesm=' + isesm,
    'exportNames=' + Object.keys(mockDefinitionFinal).sort().join()
  ].join('&');

  esmockCacheSet(mockModuleKey, mockDefinitionFinal);

  return mockModuleKey;
};

// eslint-disable-next-line max-len
const esmockModulesCreate = async (pathCallee, pathModule, esmockKey, defs, keys, mocks) => {
  keys = keys || Object.keys(defs);
  mocks = mocks || [];

  if (!keys.length)
    return mocks;

  const mockedPathFull = esmockCacheResolvedPathGetCreate(pathCallee, keys[0]);
  if (!mockedPathFull) {
    throw new Error('not a valid path ' + pathCallee + ', ' + keys[0]);
  }

  mocks.push(await esmockModuleCreate(
    esmockKey,
    keys[0],
    mockedPathFull,
    defs[keys[0]]
  ));

  return esmockModulesCreate(
    pathCallee, pathModule, esmockKey, defs, keys.slice(1), mocks);
};

const esmockAddMocked = async (calleePath, modulePath, defs) => {
  const pathModuleFull = esmockCacheResolvedPathGetCreate(
    calleePath, modulePath);
  const esmockKey = esmockNextKey();
  const esmockModuleKeys = await esmockModulesCreate(
    calleePath, pathModuleFull, esmockKey, defs, Object.keys(defs));
  const esmockCacheKey =
    'file://:rootmodulepath?key=:esmockKey#esmockModuleKeys=:moduleKeys'
      .replace(/:esmockKey/, esmockKey)
      .replace(/:rootmodulepath/, pathModuleFull)
      .replace(/:moduleKeys/, esmockModuleKeys.join('#'));

  return esmockCacheKey;
};

export {
  esmockCache,
  esmockNextKey,
  esmockAddMocked,
  esmockImportedModulePurge,
  esmockImportedModuleSanitize
};
