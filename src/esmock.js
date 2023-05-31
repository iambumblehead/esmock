import esmockIsLoader from './esmockIsLoader.js'
import esmockModule from './esmockModule.js'
import esmockArgs from './esmockArgs.js'
import esmockErr from './esmockErr.js'

const esmockGo = opts => async (...args) => {
  const [moduleId, parent, defs, gdefs, opt] = esmockArgs(args, opts)
  if (!await esmockIsLoader())
    throw esmockErr.errMissingLoader()

  const fileURLKey = await esmockModule(moduleId, parent, defs, gdefs, opt)
  const importedModule = await import(fileURLKey)

  if (opt.purge !== false)
    esmockModule.purge(fileURLKey)

  return esmockModule.sanitize(importedModule, fileURLKey)
}

const purge = mockModule => mockModule
  && /object|function/.test(typeof mockModule) && 'esmkTreeId' in mockModule
  && esmockModule.purge(mockModule.esmkTreeId)

const strict = Object.assign(esmockGo({ strict: 1 }), {
  purge, p: esmockGo({ strict: 1, purge: false }) })

const strictest = Object.assign(esmockGo({ strict: 3 }), {
  purge, p: esmockGo({ strict: 3, purge: false }) })

const esmock = Object.assign(esmockGo(), {
  purge, p: esmockGo({ purge: false }), strict, strictest })

export {esmock as default, strict, strictest}
export * from './esmockLoader.js'
