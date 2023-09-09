import module from 'node:module'
import threads from 'node:worker_threads'
import * as hooks from './esmockLoader.js'
import esmockRegister from './esmockRegister.js'
import esmockLoader from './esmockLoader.js'
import esmockModule from './esmockModule.js'
import esmockArgs from './esmockArgs.js'
import esmockErr from './esmockErr.js'

const esmockGo = opts => async (...args) => {
  const [moduleId, parent, defs, gdefs, opt] = esmockArgs(args, opts)
  if (!esmockRegister && !await esmockLoader())
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

// for older node versions, to support "--loader=esmock" rather than
// "--loader=esmock/loader", esmock.js exported loader hook definitions here
//
// for newer node versions 20.6+, exporting hook definitions here causes
// problems when --loader is ued and esmock initializes newer message channels
const isMessageChannel = Boolean(module.register && threads.MessageChannel)
const hooksFinal = isMessageChannel ? {} : hooks
const { load, resolve, getSource, initialize, globalPreload } = hooksFinal
export { load, resolve, getSource, initialize, globalPreload }
