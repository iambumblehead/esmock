import esmock from './esmock.js'
import esmockArgs from './esmockArgs.js'

const esmockPartial = async (...args) => esmock(
  ...esmockArgs(args, { partial: true }, new Error))

Object.assign(esmockPartial, esmock, {
  strict: async (...args) => esmock(
    ...esmockArgs(args, { partial: false }, new Error)),
  p: async (...args) => esmock(
    ...esmockArgs(args, { partial: true, purge: false }, new Error))
})

export default esmockPartial
