import {
  esmockModuleMock,
  esmockModuleImportedPurge,
  esmockModuleImportedSanitize
} from './esmockModule.js'

import {
  esmockCache
} from './esmockCache.js'

const argsToObj = args => {
  // Distinguish between the two overloads; see esmock.d.ts.
  let modulePath, parent, mockDefs, globalDefs, opt
  if (typeof args[1] === "string") {
    [ modulePath, parent, mockDefs, globalDefs, opt ] = args
  } else {
    [ modulePath, mockDefs, globalDefs, opt ] = args
  }
  return { modulePath, parent, mockDefs, globalDefs, opt }
}

const _esmock = async (argsObj, err) => {
  const { modulePath, parent, mockDefs, globalDefs, opt = {} } = argsObj

  const calleePath = (parent || err.stack.split('\n')[2])
    .replace(/^.*file:\/\//, '') // rm every before filepath
    .replace(/:[\d]*:[\d]*.*$/, '') // rm line and row number
    .replace(/^.*:/, '') // rm windows-style drive location
    .replace(/.*at [^(]*\(/, '') // rm ' at TestContext.<anonymous> ('

  if (!global.esmockloader)
    throw new Error('process must be started with --loader=esmock')

  const modulePathKey = await esmockModuleMock(
    calleePath, modulePath, mockDefs || {}, globalDefs || {}, opt)

  const importedModule = await import(modulePathKey)

  if (opt.purge !== false)
    esmockModuleImportedPurge(modulePathKey)

  return esmockModuleImportedSanitize(importedModule, modulePathKey)
}

const esmock = async (...args) => _esmock(argsToObj(args), new Error)

esmock.px = async (...args) => {
  const argsObj = argsToObj(args)
  argsObj.opt = { ...argsObj.opt, partial: true }
  return _esmock(argsObj, new Error)
}

esmock.p = async (...args) => {
  const argsObj = argsToObj(args)
  argsObj.opt = { ...argsObj.opt, purge: false }
  return _esmock(argsObj, new Error)
}

esmock.purge = mockModule => {
  if (mockModule && /object|function/.test(typeof mockModule)
      && 'esmockKey' in mockModule)
    esmockModuleImportedPurge(mockModule.esmockKey)
}

esmock.esmockCache = esmockCache

export default esmock
