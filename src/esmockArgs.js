// this function normalizes "overloaded" args signatures, returning
// one predictable args list. ex,
//   esmockArgs([modulepath, mockdefs, globaldefs, opts])
//     -> [modulepath, mockdefs, globaldefs, opts]
//   esmockArgs([modulepath, parent, mockdefs, globaldefs, opts])
//     -> [modulepath, mockdefs, globaldefs, { ...opts, parent }]
export default (args, optsextra, err, parent) => {
  parent = typeof args[1] === 'string' && args[1]
  args = parent ? [args[0], ...args.slice(2)] : args
  // extracts path or fileurl from stack,
  // '  at <anonymous> (/root/index.test.js:11:31)' -> /root/index.test.js
  // '  at file:///root/index.test.js:7:9' -> file:///root/index.test.js
  parent = parent || (new Error).stack.split('\n')[3]
    .replace(/^.*(\(|at )(.*):[\d]*:[\d]*.*$/, '$2')

  console.log({ parent, stack: (new Error).stack.split('\n')[3] })
  args[3] = { parent, ...args[3], ...optsextra }

  return args
}
