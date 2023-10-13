import test from 'node:test'
import assert from 'node:assert/strict'
import module from 'node:module'
import esmock from 'esmock'

function resolverCustom (moduleId, parent) {
  // This logic looks unusual because of constraints here. This function must:
  //  * must work at windows, where path.join and path.resolve cause issues
  //  * must be string-serializable, no external funcions
  //  * must resolve these moduleIds to corresponding, existing filepaths
  //    * '../local/customResolverParent.js',
  //    * 'RESOLVECUSTOM/
  if (/(node:)?path/.test(moduleId))
    return 'node:path'

  return (
    parent.replace(/\/tests\/.*$/, '/tests/tests-node/') + (
      /RESOLVECUSTOM$/.test(moduleId)
        ? '../local/customResolverChild.js'
        : moduleId
    )
  ).replace(/\/tests-node\/\.\./, '')
}

async function resolve (specifier, context, next) {
  return next(
    specifier === 'RESOLVECUSTOM'
      ? resolverCustom(specifier, context.parentURL)
      : specifier, context)
}

module.register && module.register(`
data:text/javascript,
${encodeURIComponent(resolverCustom)}
export ${encodeURIComponent(resolve)}`.slice(1))

test('should use custom resolver', async () => {
  if (!module.register)
    return assert.ok('skip test')

  const customResolverParent = await esmock(
    '../local/customResolverParent.js', {}, {
      RESOLVECUSTOM: ({ isMocked: true })
    }, {
      resolver: resolverCustom
    })

  assert.ok(customResolverParent.child.isCustomResolverChild)
  assert.ok(customResolverParent.child.isMocked)
})

test('should not call custom resover with builtin moduleIds', async () => {
  if (!module.register)
    return assert.ok('skip test')

  const customResolverParent = await esmock(
    '../local/customResolverParent.js', {}, {
      RESOLVECUSTOM: ({ isMocked: true }),
      path: { basename: () => 'basenametest' }
    }, {
      resolver: resolverCustom
    })

  assert.ok(customResolverParent.child.isCustomResolverChild)
  assert.ok(customResolverParent.child.isMocked)
  assert.strictEqual(
    customResolverParent.pathbasenameresult,
    'basenametest')
})
