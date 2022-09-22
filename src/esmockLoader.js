import process from 'process'
import urlDummy from './esmockDummy.js'

const [major, minor] = process.versions.node.split('.').map(it => +it)
const isLT1612 = major < 16 || (major === 16 && minor < 12)

const esmockGlobalsAndAfterRe = /\?esmockGlobals=.*/
const esmockGlobalsAndBeforeRe = /.*\?esmockGlobals=/
const esmockModuleKeysRe = /#-#esmockModuleKeys/
const exportNamesRe = /.*exportNames=(.*)/
const esmockKeyRe = /esmockKey=\d*/
const withHashRe = /.*#-#/
const isesmRe = /isesm=true/
const notfoundRe = /notfound=([^&]*)/

// new versions of node: when multiple loaders are used and context
// is passed to nextResolve, the process crashes in a recursive call
// see: /esmock/issues/#48
//
// old versions of node: if context.parentURL is defined, and context
// is not passed to nextResolve, the tests fail
//
// later versions of node v16 include 'node-addons'
const nextResolveCall = async (nextResolve, specifier, context) => (
  context.parentURL &&
    (context.conditions.slice(-1)[0] === 'node-addons'
     || context.importAssertions || isLT1612)
    ? await nextResolve(specifier, context)
    : await nextResolve(specifier))

const resolve = async (specifier, context, nextResolve) => {
  const { parentURL } = context
  const [esmockKeyParamSmall] =
    (parentURL && parentURL.match(/\?esmk=\d*/)) || []
  const esmockKeyLong = esmockKeyParamSmall
    ? global.esmockKeyGet(esmockKeyParamSmall.split('=')[1])
    : parentURL

  if (!esmockKeyRe.test(esmockKeyLong))
    return nextResolveCall(nextResolve, specifier, context)

  const [esmockKeyParam] = String(esmockKeyLong).match(esmockKeyRe)
  const [keyUrl, keys] = esmockKeyLong.split(esmockModuleKeysRe)
  const moduleGlobals = keyUrl && keyUrl.replace(esmockGlobalsAndBeforeRe, '')
  // do not call 'nextResolve' for notfound modules
  if (esmockKeyLong.includes(`notfound=${specifier}`)) {
    const moduleKeyRe = new RegExp(
      '.*file:///' + specifier + '(\\?' + esmockKeyParam + '(?:(?!#-#).)*).*')
    const moduleKey = (
      moduleGlobals.match(moduleKeyRe) || keys.match(moduleKeyRe) || [])[1]
    if (moduleKey) {
      return {
        shortCircuit: true,
        url: urlDummy + moduleKey
      }
    }
  }

  const resolved = await nextResolveCall(nextResolve, specifier, context)
  const resolvedurl = decodeURI(resolved.url)
  const moduleKeyRe = new RegExp(
    '.*(' + resolvedurl + '\\?' + esmockKeyParam + '(?:(?!#-#).)*).*')
  const moduleKeyChild = moduleKeyRe.test(keys)
        && keys.replace(moduleKeyRe, '$1')
  const moduleKeyGlobal = moduleKeyRe.test(moduleGlobals)
        && moduleGlobals.replace(moduleKeyRe, '$1')

  const moduleKey = moduleKeyChild || moduleKeyGlobal
  if (moduleKey) {
    resolved.url = isesmRe.test(moduleKey)
      ? moduleKey
      : urlDummy + '#-#' + moduleKey
  } else if (moduleGlobals && moduleGlobals !== '0') {
    if (!resolved.url.startsWith('node:')) {
      resolved.url += '?esmockGlobals=' + moduleGlobals
    }
  }

  return resolved
}

const load = async (url, context, nextLoad) => {
  if (esmockModuleKeysRe.test(url)) // parent of mocked modules
    return nextLoad(url, context)

  url = url.replace(esmockGlobalsAndAfterRe, '')
  if (url.startsWith(urlDummy)) {
    url = url.replace(withHashRe, '')
    if (notfoundRe.test(url))
      url = url.replace(urlDummy, `file:///${url.match(notfoundRe)[1]}`)
  }

  const exportedNames = exportNamesRe.test(url) &&
    url.replace(exportNamesRe, '$1').split(',')
  if (exportedNames.length) {
    return {
      format: 'module',
      shortCircuit: true,
      responseURL: encodeURI(url),
      source: exportedNames.map(name => name === 'default'
        ? `export default global.esmockCacheGet("${url}").default`
        : `export const ${name} = global.esmockCacheGet("${url}").${name}`
      ).join('\n')
    }
  }

  return nextLoad(url, context)
}

// node lt 16.12 require getSource, node gte 16.12 warn remove getSource
const getSource = isLT1612 && load

export * from './esmock.js'
export {default} from './esmock.js'
export {load, resolve, getSource}
