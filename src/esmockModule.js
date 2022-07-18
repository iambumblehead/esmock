import fs from 'fs';
import path from 'path';
import resolvewith from 'resolvewithplus';

import {
  esmockKeySet,
  esmockKeyGet,
  esmockCacheSet,
  esmockCacheResolvedPathIsESMGet,
  esmockCacheResolvedPathIsESMSet
} from './esmockCache.js';

// https://url.spec.whatwg.org/, eg, file:///C:/demo file://root/linux/path
const pathAddProtocol = (pathFull, protocol) => (
  (protocol || (resolvewith.iscoremodule(pathFull) ? 'node:' : 'file:///'))
    + pathFull.replace(/^\//, ''));

const esmockModuleApply = (definitionLive, definitionMock, definitionPath) => {
  const isDefaultNamespace = o => typeof o === 'object' && o && 'default' in o;
  const isCorePath = resolvewith.iscoremodule(definitionPath);
  const definition = isCorePath
    ? Object.assign({ default : definitionMock }, definitionMock)
    : Object.assign({}, definitionLive || {}, definitionMock);
  const isDefaultLive = isDefaultNamespace(definitionLive);
  const isDefaultMock = isDefaultNamespace(definitionMock);
  const isDefault = isDefaultNamespace(definition);

  // no names 'default' or otherwise exported at mock
  const mockNameIsNotExported = typeof definitionMock !== 'object'
    && Object.keys(definitionMock).length === 0;

  // live module exports only a 'default' value. mock defines
  // single value that is not 'default'
  const liveExportsDefaultOnly = isDefaultLive && !isDefaultMock
    && Object.keys(definitionLive).length === 1;

  // if safe, an extra default definition is added for compatibility
  // babel-generated dist cjs files often import this way,
  //   import package from 'package';
  //   package.default(); <- extra default definition
  if (!definitionLive && mockNameIsNotExported) {
    definition.default = definitionMock;
    if (definitionMock && /object|function/.test(typeof definitionMock)
      && !definitionMock.default) {
      definition.default.default = definitionMock;
    }
  }

  if ((mockNameIsNotExported || liveExportsDefaultOnly) && isDefault) {
    if (isDefaultNamespace(definition.default)) {
      definition.default = definitionMock;
      definition.default.default = definitionMock;
    } else {
      definition.default = definitionMock;
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

  isesm = !resolvewith.iscoremodule(mockPathFull)
    && esmockModuleESMRe.test(fs.readFileSync(mockPathFull, 'utf-8'));

  esmockCacheResolvedPathIsESMSet(mockPathFull, isesm);

  return isesm;
};

// return the default value directly, so that the esmock caller
// does not need to lookup default as in "esmockedValue.default"
const esmockModuleImportedSanitize = (importedModule, esmockKey) => {
  const importedDefault = 'default' in importedModule && importedModule.default;

  if (!/boolean|string|number/.test(typeof importedDefault)) {
    // an example of [object Module]: import * as mod from 'fs'; export mod;
    return Object.prototype.toString.call(importedDefault) === '[object Module]'
      ? Object.assign({}, importedDefault, importedModule, { esmockKey })
      : Object.assign(importedDefault, importedModule, { esmockKey });
  }

  return importedModule;
};

const esmockModuleImportedPurge = modulePathKey => {
  const purgeKey = key => key === 'null' || esmockCacheSet(key, null);
  const longKey = esmockKeyGet(modulePathKey.split('esmk=')[1]);
  const [ url, keys ] = longKey.split('#esmockModuleKeys=');

  String(keys).split('#').forEach(purgeKey);
  String(url.split('esmockGlobals=')[1]).split('#').forEach(purgeKey);
};

const esmockNextKey = ((key = 0) => () => ++key)();

// eslint-disable-next-line max-len
const esmockModuleCreate = async (esmockKey, key, mockPathFull, mockDef, opt) => {
  const isesm = esmockModuleIsESM(mockPathFull);
  const originalDefinition = opt.partial
    ? await import(pathAddProtocol(mockPathFull)) : null;
  const mockDefinitionFinal = esmockModuleApply(
    originalDefinition, mockDef, mockPathFull);
  const mockExportNames = Object.keys(mockDefinitionFinal).sort().join();
  const mockModuleKey = `${pathAddProtocol(mockPathFull)}?` + [
    'esmockKey=' + esmockKey,
    'esmockModuleKey=' + key,
    'isesm=' + isesm,
    mockExportNames ? 'exportNames=' + mockExportNames : 'exportNone'
  ].join('&');

  esmockCacheSet(mockModuleKey, mockDefinitionFinal);

  return mockModuleKey;
};

// eslint-disable-next-line max-len
const esmockModulesCreate = async (pathCallee, pathModule, esmockKey, defs, keys, mocks, opt) => {
  keys = keys || Object.keys(defs);
  mocks = mocks || [];

  if (!keys.length)
    return mocks;

  let mockedPathFull = resolvewith(keys[0], pathCallee);
  if (!mockedPathFull) {
    pathCallee = pathCallee
      .replace(/^\/\//, '')
      .replace(process.cwd(), '.')
      .replace(process.env.HOME, '~');
    throw new Error(`not a valid path: "${keys[0]}" (used by ${pathCallee})`);
  }

  if (process.platform === 'win32')
    mockedPathFull = mockedPathFull.split(path.sep).join(path.posix.sep);

  mocks.push(await esmockModuleCreate(
    esmockKey,
    keys[0],
    mockedPathFull,
    defs[keys[0]],
    opt
  ));

  return esmockModulesCreate(
    pathCallee, pathModule, esmockKey, defs, keys.slice(1), mocks, opt);
};

const esmockModuleMock = async (calleePath, modulePath, defs, gdefs, opt) => {
  const pathModuleFull = resolvewith(modulePath, calleePath);
  const esmockKey = typeof opt.key === 'number' ? opt.key : esmockNextKey();
  const esmockModuleKeys = await esmockModulesCreate(
    calleePath, pathModuleFull, esmockKey, defs, Object.keys(defs), 0, opt);
  const esmockGlobalKeys = await esmockModulesCreate(
    calleePath, pathModuleFull, esmockKey, gdefs, Object.keys(gdefs), 0, opt);

  if (pathModuleFull === null)
    throw new Error(`modulePath not found: "${modulePath}"`);

  const esmockKeyLong = pathAddProtocol(pathModuleFull, 'file:///') + '?'
    + 'key=:esmockKey?esmockGlobals=:esmockGlobals#esmockModuleKeys=:moduleKeys'
      .replace(/:esmockKey/, esmockKey)
      .replace(/:esmockGlobals/, esmockGlobalKeys.join('#') || 'null')
      .replace(/:moduleKeys/, esmockModuleKeys.join('#'));

  esmockKeySet(String(esmockKey), esmockKeyLong);

  return pathAddProtocol(pathModuleFull, 'file:///') + `?esmk=${esmockKey}`;
};

export {
  esmockModuleMock,
  esmockModuleImportedPurge,
  esmockModuleImportedSanitize
};
