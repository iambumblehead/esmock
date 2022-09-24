// extracts path or fileurl from stack,
// '  at <anonymous> (/root/test.js:11:31)' -> /root/test.js
// '  at Object.handler (file:///D:/a/test.js:11:31)' -> file:///D:/a/test.js
// '  at file:///root/test.js:7:9' -> file:///root/test.js
// '  at file:///D:/a/test.js:7:9' -> file:///D:/a/test.js
const stackpathre = /^.*(\(|at )(.*):[\d]*:[\d]*.*$/

// this function normalizes "overloaded" args signatures, returning
// one predictable args list. ex,
//   [moduleId, defs, gdefs, opts]
//     -> [moduleId, parent, defs, gdefs, opts]
//   [moduleId, parent, defs, gdefs, opts]
//     -> [moduleId, parent, defs, gdefs, opts]
export default (arg, optsextra, o = {}) => {
  arg = typeof arg[1] === 'string' ? arg : [
    arg[0],
    (new Error).stack.split('\n')[3].replace(stackpathre, '$2'),
    ...arg.slice(1)
  ]

  return [arg[0], arg[1], arg[2] || o, arg[3] || o, {...arg[4], ...optsextra}]
}
