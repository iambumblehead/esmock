import esmockIsLoader from './esmockIsLoader.js'

import {
  esmockModuleMock,
  esmockModuleImportedPurge,
  esmockModuleImportedSanitize
} from './esmockModule.js'

import {
  esmockCache
} from './esmockCache.js'

// this function normalizes different "overloaded" args signatures, returning
// one predictable args list. ex,
//   [modulepath, mockdefs, globaldefs, opts]
//     -> [modulepath, mockdefs, globaldefs, opts]
//   [modulepath, parent, mockdefs, globaldefs, opts]
//     -> [modulepath, mockdefs, globaldefs, { ...opts, parent }]
const argsnormal = (args, argsextra, parent) => {
  parent = typeof args[1] === 'string' && args[1]
  args = typeof parent === 'string' ? [args[0], ...args.slice(2)] : args
  args[3] = { parent, ...args[3], ...(argsextra && argsextra[0]) }
  args[4] = (argsextra && argsextra[1]) || args[4]

  return args
}

const esmock = async (...args) => {
  const [modulePath, mockDefs, globalDefs, opt = {}, err] = argsnormal(args)
  const calleePath = (opt.parent || (err || new Error).stack.split('\n')[2])
    .replace(/^.*file:\/\//, '') // rm every before filepath
    .replace(/:[\d]*:[\d]*.*$/, '') // rm line and row number
    .replace(/^.*:/, '') // rm windows-style drive location
    .replace(/.*at [^(]*\(/, '') // rm ' at TestContext.<anonymous> ('

  if (!esmockIsLoader())
    throw new Error('process must be started with --loader=esmock')

  const modulePathKey = await esmockModuleMock(
    calleePath, modulePath, mockDefs || {}, globalDefs || {}, opt)

  const importedModule = await import(modulePathKey)

  if (opt.purge !== false)
    esmockModuleImportedPurge(modulePathKey)

  return esmockModuleImportedSanitize(importedModule, modulePathKey)
}

esmock.px = async (...args) => (
  esmock(...argsnormal(args, [{ partial: true }, new Error])))

esmock.p = async (...args) => (
  esmock(...argsnormal(args, [{ purge: false }, new Error])))

esmock.purge = mockModule => {
  if (mockModule && /object|function/.test(typeof mockModule)
      && 'esmockKey' in mockModule)
    esmockModuleImportedPurge(mockModule.esmockKey)
}

esmock.esmockCache = esmockCache

export default esmock
