import esmockIsLoader from './esmockIsLoader.js'
import esmockModule from './esmockModule.js'
import esmockArgs from './esmockArgs.js'

const esmockGo = opts => async (...args) => {
  if (!esmockIsLoader())
    throw new Error('process must be started with --loader=esmock')

  const [moduleId, parent, defs, gdefs, opt] = esmockArgs(args, opts)
  const fileURLKey = await esmockModule(moduleId, parent, defs, gdefs, opt)
  const importedModule = await import(fileURLKey)

  if (opt.purge !== false)
    esmockModule.purge(fileURLKey)

  return esmockModule.sanitize(importedModule, fileURLKey)
}

const purge = mockModule => mockModule
  && /object|function/.test(typeof mockModule) && 'esmkTreeId' in mockModule
  && esmockModule.purge(mockModule.esmkTreeId)

const strict = Object.assign(esmockGo({ strict: true }), {
  purge, p: esmockGo({ strict: true, purge: false }) })

const esmock = Object.assign(esmockGo(), {
  purge, p: esmockGo({ purge: false }), strict })

export {esmock as default, strict}
