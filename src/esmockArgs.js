// this function normalizes "overloaded" args signatures, returning
// one predictable args list. ex,
//   esmockArgs([modulepath, mockdefs, globaldefs, opts])
//     -> [modulepath, mockdefs, globaldefs, opts]
//   esmockArgs([modulepath, parent, mockdefs, globaldefs, opts])
//     -> [modulepath, mockdefs, globaldefs, { ...opts, parent }]
export default (args, optsextra, err, parent) => {
  parent = typeof args[1] === 'string' && args[1]
  args = parent ? [args[0], ...args.slice(2)] : args
  parent = parent || (new Error).stack.split('\n')[3]
    .replace(/^.*(file:)/, '$1') // rm every before fileurl
    .replace(/:[\d]*:[\d]*.*$/, '') // rm line and row number
  args[3] = { parent, ...args[3], ...optsextra }

  return args
}
