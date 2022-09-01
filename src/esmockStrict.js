import esmock from './esmock.js'
import esmockArgs from './esmockArgs.js'

const esmockStrict = async (...args) => esmock(
  ...esmockArgs(args, { partial: false }, new Error))

Object.assign(esmockStrict, esmock, {
  partial: async (...args) => esmock(
    ...esmockArgs(args, { partial: true }, new Error)),
  p: async (...args) => esmock(
    ...esmockArgs(args, { partial: false, purge: false }, new Error))
})

export default esmockStrict
