import core from 'path'
import local from './usesCoreModule.js'
import pkg from 'form-urlencoded'

export const corePathBasename = p => core.basename(p)
export const localReadSync = p => local.readPath(p)
export const packageFn = p => pkg(p)
