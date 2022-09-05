import esmockIsLoader from './esmockIsLoader.js'
import esmockArgs from './esmockArgs.js'

import {
  esmockModuleMock,
  esmockModuleImportedPurge,
  esmockModuleImportedSanitize
} from './esmockModule.js'

import {
  esmockCache
} from './esmockCache.js'

const esmock = async (...args) => {
  const [modulePath, mockDefs, globalDefs, opt = {}, err] = esmockArgs(args)
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

const strict = async (...args) => esmock(
  ...esmockArgs(args, { partial: false }, new Error))
strict.p = async (...args) => esmock(
  ...esmockArgs(args, { partial: false, purge: false }, new Error))

const partial = async (...args) => esmock(
  ...esmockArgs(args, { partial: true }, new Error))
partial.p = async (...args) => esmock(
  ...esmockArgs(args, { partial: true, purge: false }, new Error))

Object.assign(esmock, strict, { strict, partial })

esmock.purge = mockModule => {
  if (mockModule && /object|function/.test(typeof mockModule)
      && 'esmockKey' in mockModule)
    esmockModuleImportedPurge(mockModule.esmockKey)
}

esmock.esmockCache = esmockCache

export {esmock as default, partial, strict}
