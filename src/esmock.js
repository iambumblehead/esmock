import esmockIsLoader from './esmockIsLoader.js'
import esmockModule from './esmockModule.js'
import esmockCache from './esmockCache.js'
import esmockArgs from './esmockArgs.js'

const esmockGo = opts => async (...args) => {
  const [moduleId, defs, gefs, opt = {}, err] = esmockArgs(args, opts)
  const parent = (opt.parent || err.stack.split('\n')[3])
    .replace(/^.*file:\/\//, '') // rm every before filepath
    .replace(/:[\d]*:[\d]*.*$/, '') // rm line and row number
    .replace(/^.*:/, '') // rm windows-style drive location
    .replace(/.*at [^(]*\(/, '') // rm ' at TestContext.<anonymous> ('

  if (!esmockIsLoader())
    throw new Error('process must be started with --loader=esmock')

  const modulePathKey = await esmockModule(
    parent, moduleId, defs || {}, gefs || {}, opt)

  const importedModule = await import(modulePathKey)

  if (opt.purge !== false)
    esmockModule.purge(modulePathKey)

  return esmockModule.sanitize(importedModule, modulePathKey)
}

const purge = mockModule => mockModule
  && /object|function/.test(typeof mockModule) && 'esmockKey' in mockModule
  && esmockModule.purge(mockModule.esmockKey)

const strict = Object.assign(esmockGo({ strict: true }), {
  purge, cache: esmockCache, p: esmockGo({ strict: true, purge: false }) })

const esmock = Object.assign(esmockGo(), {
  purge, cache: esmockCache, p: esmockGo({ purge: false }), strict })

export {esmock as default, strict}
