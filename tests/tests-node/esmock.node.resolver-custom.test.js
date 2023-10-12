import test from 'node:test'
import assert from 'node:assert/strict'
import module from 'node:module'
import esmock from 'esmock'

function resolverCustom (moduleId, parent) {
  parent = parent.replace(/\/tests\/.*$/, '/tests/tests-node/')

  // This logic looks unusual because of constraints here. This function must:
  //  * must work at windows, where path.join and path.resolve cause issues
  //  * must be string-serializable, no external funcions
  //  * must resolve these moduleIds to corresponding, existing filepaths
  //    * '../local/customResolverParent.js',
  //    * 'RESOLVECUSTOM/
  return (
    /RESOLVECUSTOM$/.test(moduleId)
      ? parent + '../local/customResolverChild.js'
      : parent + moduleId
  ).replace(/\/tests-node\/\.\./, '')
}

async function resolve (specifier, context, next) {
  return next(
    specifier === 'RESOLVECUSTOM'
      ? resolverCustom(specifier, context.parentURL)
      : specifier, context)
}

const loader = `
data:text/javascript,
${encodeURIComponent(resolverCustom)}
export ${encodeURIComponent(resolve)}`.slice(1)

test('should use custom resolver', async () => {
  if (!module.register)
    return assert.ok('skip test')

  module.register(loader)
  const customResolverParent = await esmock(
    '../local/customResolverParent.js', {}, {
      RESOLVECUSTOM: ({ isMocked: true })
    }, {
      resolver: resolverCustom
    })

  assert.ok(customResolverParent.child.isCustomResolverChild)
  assert.ok(customResolverParent.child.isMocked)
})
