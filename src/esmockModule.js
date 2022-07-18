import path from 'path';
import resolvewith from 'resolvewithplus';

import {
  esmockKeySet,
  esmockKeyGet,
  esmockCacheSet
} from './esmockCache.js';

const isObj = o => typeof o === 'object' && o;
const isObjOrFnRe = /^(object|function)$/;
const isObjOrFn = o => isObjOrFnRe.test(typeof o) && o;
const isDefaultDefined = o => isObj(o) && 'default' in o;

// https://url.spec.whatwg.org/, eg, file:///C:/demo file://root/linux/path
const pathAddProtocol = (pathFull, protocol) => (
  (protocol || (resolvewith.iscoremodule(pathFull) ? 'node:' : 'file:///'))
    + pathFull.replace(/^\//, ''));

const esmockModuleMergeDefault = (defaultLive, defaultMock, merged)  => {
  const defaultLiveIsObj = isObj(defaultLive);
  const defaultMockIsObj = isObj(defaultMock);

  if (defaultLiveIsObj && defaultMockIsObj) {
    merged = Object.assign({}, defaultLive, defaultMock);
  } else if (defaultMock) {
    merged = defaultMock;
  } else if (defaultLiveIsObj) {
    merged = Object.assign({}, defaultLive);
  } else if (defaultLive) {
    merged = defaultLive;
  }

  return merged;
};

const esmockModuleApply = (definitionLive, definitionMock, definitionPath) => {
  const isCorePath = resolvewith.iscoremodule(definitionPath);
  const definitionDefault = esmockModuleMergeDefault(
    isDefaultDefined(definitionLive) && definitionLive.default,
    isDefaultDefined(definitionMock) ? definitionMock.default : definitionMock);
  const definition = Object.assign({}, definitionLive || {}, {
    default : definitionDefault
  }, definitionMock);

  // if safe, an extra default definition is added for compatibility,
  // because babel-generated dist cjs files often import in this way,
  // note: core modules do not define "default.default"
  //   import package from 'package';
  //   package.default(); <- extra default definition
  if (!isCorePath && isObjOrFn(definition.default))
    definition.default.default = definition.default;

  return definition;
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
  const iscore = resolvewith.iscoremodule(mockPathFull);
  const originalDefinition = opt.partial
    ? await import(pathAddProtocol(mockPathFull)) : null;
  const mockDefinitionFinal = esmockModuleApply(
    originalDefinition, mockDef, mockPathFull);
  const mockExportNames = Object.keys(mockDefinitionFinal).sort().join();
  const mockModuleKey = `${pathAddProtocol(mockPathFull)}?` + [
    'esmockKey=' + esmockKey,
    'esmockModuleKey=' + key,
    'iscore=' + iscore,
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
