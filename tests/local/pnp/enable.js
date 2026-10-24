import module from 'node:module'

function resolve (specifier, context, next) {
  return next(
    specifier === 'pnpapi'
      ? '../tests/local/pnp/api.js'
      : specifier, context)
}

process.versions.pnp = '3'
module.registerHooks({ resolve })
