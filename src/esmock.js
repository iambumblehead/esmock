import {
  esmockModuleMock,
  esmockModuleImportedPurge,
  esmockModuleImportedSanitize
} from './esmockModule.js';

import {
  esmockCache
} from './esmockCache.js';

const esmock = async (modulePath, mockDefs, globalDefs, opt = {}, err) => {
  const calleePath = (err || new Error()).stack.split('\n')[2]
    .replace(/^.*file:\/\//, '') // rm every before filepath
    .replace(/:[\d]*:[\d]*.*$/, '') // rm line and row number
    .replace(/^.*:/, '') // rm windows-style drive location
    .replace(/.*at [^(]*\(/, ''); // rm ' at TestContext.<anonymous> (' before path

  if (!global.esmockloader)
    throw new Error('process must be started with --loader=esmock');

  const modulePathKey = await esmockModuleMock(
    calleePath, modulePath, mockDefs || {}, globalDefs || {}, opt);

  // throw new Error('MODULEPATHKEYCON:REMOVE' + modulePathKey);
  const importedModule = await import(modulePathKey);
  // throw new Error('MODULEPATHKEYCON:RESOLVED' + modulePathKey);

  if (opt.purge !== false)
    esmockModuleImportedPurge(modulePathKey);

  return esmockModuleImportedSanitize(importedModule, modulePathKey);
};

esmock.px = async (modulePath, mockDefs, globalDefs) => (
  esmock(modulePath, mockDefs, globalDefs, { partial : true }, new Error()));

esmock.p = async (modulePath, mockDefs, globalDefs) => (
  esmock(modulePath, mockDefs, globalDefs, { purge : false }, new Error()));

esmock.purge = mockModule => {
  if (mockModule && /object|function/.test(typeof mockModule)
      && 'esmockKey' in mockModule)
    esmockModuleImportedPurge(mockModule.esmockKey);
};

esmock.esmockCache = esmockCache;

export default esmock;
