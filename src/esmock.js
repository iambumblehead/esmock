import {
  esmockModuleMock,
  esmockModuleImportedPurge,
  esmockModuleImportedSanitize
} from './esmockModule.js';

import {
  esmockCache
} from './esmockCache.js';

const argHasKey = (arg, key) => (
  arg && !/number|boolean/.test(typeof arg) && key in arg);

const esmock = async (modulePath, mockDefs, globalDefs, opt = {}, err) => {
  // callee path is stack item '2'
  const calleePath = (err || new Error()).stack.split('\n')[2]
    .replace(/^.*file:\/\//, '') // rm everything before filepathfe
    .replace(/:[\d]*:[\d]*.*$/, '') // rm line and row number
    .replace(/^.*:/, ''); // rm windows-style drive locations

  const modulePathKey = await esmockModuleMock(
    calleePath, modulePath, mockDefs || {}, globalDefs || {}, opt);

  const importedModule = await import(modulePathKey);

  if (opt.purge !== false)
    esmockModuleImportedPurge(modulePathKey);

  return esmockModuleImportedSanitize(importedModule, modulePathKey);
};

esmock.p = async (modulePath, mockDefs, globalDefs) => (
  esmock(modulePath, mockDefs, globalDefs, { purge : false }, new Error()));

esmock.purge = mockModule => {
  if (argHasKey(mockModule, 'esmockKey'))
    esmockModuleImportedPurge(mockModule.esmockKey);
};

esmock.esmockCache = esmockCache;

export default esmock;
