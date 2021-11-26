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

const esmock = async (modulePath, mockDefs, globalDefs, opt) => {
  // this functions caller is stack item '2'
  const calleePath = new Error().stack.split('\n')[2]
    .replace(/^.*file:\/\//, '') // rm everything before filepathfe
    .replace(/:[\d]*:[\d]*.*$/, '') // rm line and row number
    .replace(/^.*:/, ''); // rm windows-style drive locations

  // remap params in case options are provided as first arg
  [ opt, mockDefs, globalDefs ] = argHasKey(mockDefs, 'isPurge')
    ? [ mockDefs || {}, globalDefs || {}, opt || {} ]
    : [ opt || {}, mockDefs || {}, globalDefs || {} ];

  const modulePathKey = await esmockModuleMock(
    calleePath, modulePath, mockDefs || {}, globalDefs || {}, opt || {});

  const importedModule = await import(modulePathKey);

  if (opt.isPurge !== false)
    esmockModuleImportedPurge(modulePathKey);
  
  return esmockModuleImportedSanitize(importedModule, modulePathKey);
};

esmock.purge = mockModule => {
  if (argHasKey(mockModule, 'esmockKey'))
    esmockModuleImportedPurge(mockModule.esmockKey);
};

esmock.esmockCache = esmockCache;

export default esmock;
