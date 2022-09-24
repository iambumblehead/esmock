// extracts path or fileurl from stack,
// '  at <anonymous> (/root/test.js:11:31)' -> /root/test.js
// '  at Object.handler (file:///D:/a/test.js:11:31)' -> file:///D:/a/test.js
// '  at file:///root/test.js:7:9' -> file:///root/test.js
// '  at file:///D:/a/test.js:7:9' -> file:///D:/a/test.js
const stackpathre = /^.*(\(|at )(.*):[\d]*:[\d]*.*$/

// this function normalizes "overloaded" args signatures, returning
// one predictable args list. ex,
//   esmockArgs([modulepath, mockdefs, globaldefs, opts])
//     -> [modulepath, mockdefs, globaldefs, opts]
//   esmockArgs([modulepath, parent, mockdefs, globaldefs, opts])
//     -> [modulepath, mockdefs, globaldefs, { ...opts, parent }]
export default (args, optsextra, parent) => {
  parent = typeof args[1] === 'string' && args[1]
  args = parent ? [args[0], ...args.slice(2)] : args
  parent = parent || (new Error).stack.split('\n')[3].replace(stackpathre, '$2')
  args[3] = { parent, ...args[3], ...optsextra }

  return args
}
