import test from 'node:test'
import assert from 'node:assert/strict'
import module from 'node:module'
import esmock from 'esmock'

function resolverCustom (moduleId, parent) {
  return /RESOLVECUSTOM$/.test(moduleId) && parent
    .replace(/\/tests\/.*$/, '/tests/local/customResolverChild.js')
}

async function resolve (specifier, context, next) {
  return next(
    specifier === 'RESOLVECUSTOM'
      ? resolverCustom(specifier, context.parentURL)
      : specifier, context)
}

module.register(`
data:text/javascript,
${encodeURIComponent(resolverCustom)}
export ${encodeURIComponent(resolve)}`.slice(1))

test('should use custom resolver', async () => {
  const customResolverParent = await esmock(
    '../local/customResolverParent.js', {}, {
      RESOLVECUSTOM: ({ isMocked: true })
    }, {
      resolvers: [resolverCustom]
    })

  assert.ok(customResolverParent.child.isCustomResolverChild)
  assert.ok(customResolverParent.child.isMocked)
})
