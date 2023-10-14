import module from 'node:module'

async function resolve (specifier, context, next) {
  return next(
    specifier === 'pnpapi'
      ? '../tests/local/pnp/api.js'
      : specifier, context)
}
  
module.register && module.register(`
data:text/javascript,
export ${encodeURIComponent(resolve)}`.slice(1))

process.versions.pnp = '3'
