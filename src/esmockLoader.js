import fs from 'node:fs/promises'
import module from 'node:module'
import threads from 'node:worker_threads'
import process from 'process'
import esmockErr from './esmockErr.js'

const [major, minor] = process.versions.node.split('.').map(it => +it)
const isLT1612 = major < 16 || (major === 16 && minor < 12)

// ex, file:///path/to/esmockLoader.js,
//     file:///c:/path/to/esmockLoader.js
const urlDummy = import.meta.url
const esmkgdefsAndAfterRe = /\?esmkgdefs=.*/
const esmkgdefsAndBeforeRe = /.*\?esmkgdefs=/
const esmkdefsRe = /#-#esmkdefs/
const esmkImportStartRe = /^file:\/\/\/import\?/
const esmkImportRe = /file:\/\/\/import\?([^#]*)/
const esmkImportListItemRe = /\bimport,|,import\b|\bimport\b/g
const esmkTreeIdRe = /esmkTreeId=\d*/
const esmkModuleIdRe = /esmkModuleId=([^&]*)/
const esmkIdRe = /\?esmk=\d*/
const exportNamesRe = /.*exportNames=(.*)/
const withHashRe = /.*#-#/
const isesmRe = /isesm=true/
const isnotfoundRe = /isfound=false/
const iscommonjsmoduleRe = /^(commonjs|module)$/
const isstrict3 = /strict=3/
const hashbangRe = /^(#![^\n]*\n)/
// returned regexp will match embedded moduleid w/ treeid
const moduleIdReCreate = (moduleid, treeid) => new RegExp(
  `.*(${moduleid}(\\?${treeid}(?:(?!#-#).)*)).*`)

const isMessageChannel = Boolean(module.register && threads.MessageChannel)

// node v12.0-v18.x, global
const mockKeys = global.mockKeys = (global.mockKeys || {})

// node v20.0-v20.6
const globalPreload = !isMessageChannel && (({ port }) => (
  port.addEventListener('message', ev => (
    mockKeys[ev.data.key] = ev.data.keylong)),
  port.unref(),
  'global.postMessageEsmk = d => port.postMessage(d)'
))

// node v20.6-current
const initialize = isMessageChannel && (data => {
  if (data && data.port) {
    data.port.on('message', msg => {
      mockKeys[msg.key] = msg.keylong
    })
  }
})

const parseImports = defstr => {
  const [specifier, imports] = (defstr.match(esmkImportRe) || [])

  return [ // return [specifier, importNames]
    specifier, exportNamesRe.test(imports) &&
      imports.replace(exportNamesRe, '$1').split(',')]
}

// parses local and global mock imports from long-url treeidspec
const parseImportsTree = treeidspec => {
  const defs = treeidspec.split(esmkdefsRe)[1] || ''
  const defimports = parseImports(defs)
  const gdefs = treeidspec.replace(esmkgdefsAndBeforeRe, '')
  const gdefimports = parseImports(gdefs)

  return [
    defimports[0] || gdefimports[0],
    [...new Set([defimports[1] || [], gdefimports[1] || []].flat())]
  ]
}

const treeidspecFromUrl = url => esmkIdRe.test(url)
  && mockKeys[url.match(esmkIdRe)[0].split('=')[1]]

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
    ? nextResolve(specifier, context)
    : nextResolve(specifier))

const resolve = async (specifier, context, nextResolve) => {
  const { parentURL } = context
  const treeidspec = treeidspecFromUrl(parentURL) || parentURL
  if (!esmkTreeIdRe.test(treeidspec))
    return nextResolveCall(nextResolve, specifier, context)

  const [treeid] = String(treeidspec).match(esmkTreeIdRe)
  const [url, defs] = treeidspec.split(esmkdefsRe)
  const gdefs = url && url.replace(esmkgdefsAndBeforeRe, '')
  // do not call 'nextResolve' for notfound modules
  if (treeidspec.includes(`esmkModuleId=${specifier}&isfound=false`)) {
    const moduleIdRe = moduleIdReCreate(`file:///${specifier}`, treeid)
    const moduleId = (
      gdefs.match(moduleIdRe) || defs.match(moduleIdRe) || [])[2]
    if (moduleId) {
      return {
        shortCircuit: true,
        url: urlDummy + moduleId
      }
    }
  }

  if (esmkImportStartRe.test(specifier)) {
    return {
      shortCircuit: true,
      url: specifier.replace(esmkImportStartRe, urlDummy + '?')
    }
  }

  const resolved = await nextResolveCall(nextResolve, specifier, context)
  const moduleIdRe = moduleIdReCreate(resolved.url, treeid)
  const moduleId =
    moduleIdRe.test(defs) && defs.replace(moduleIdRe, '$1') ||
    moduleIdRe.test(gdefs) && gdefs.replace(moduleIdRe, '$1')
  if (moduleId) {
    resolved.url = isesmRe.test(moduleId)
      ? moduleId
      : urlDummy + '#-#' + moduleId
  } else if (gdefs && gdefs !== '0') {
    if (!resolved.url.startsWith('node:')) {
      resolved.url += '?esmkgdefs=' + gdefs
    }
  }

  if (isstrict3.test(treeidspec) && !moduleId)
    throw esmockErr.errModuleIdNotMocked(resolved.url, treeidspec.split('?')[0])

  return resolved
}

const loaderVerifyUrl = urlDummy + '?esmock-loader=true'
const loaderIsVerified = (memo => async () => memo = memo || (
  (await import(loaderVerifyUrl)).default === true))()
const load = async (url, context, nextLoad) => {
  if (url === loaderVerifyUrl) {
    return {
      format: 'module',
      shortCircuit: true,
      responseURL: url,
      source: 'export default true'
    }
  }

  const treeidspec = treeidspecFromUrl(url) || url
  const treeid = treeidspec &&
    (treeidspec.match(esmkTreeIdRe) || [])[0]
  if (treeid) {
    const [specifier, importedNames] = parseImportsTree(treeidspec)
    if (importedNames && importedNames.length) {
      const nextLoadRes = await nextLoad(url, context)
      if (!iscommonjsmoduleRe.test(nextLoadRes.format))
        return nextLoadRes

      // nextLoadRes.source sometimes 'undefined' and other times 'null' :(
      const sourceIsNullLike = (
        nextLoadRes.source === null || nextLoadRes.source === undefined)
      const source = sourceIsNullLike
        ? String(await fs.readFile(new URL(url)))
        : String(nextLoadRes.source)
      const hbang = (source.match(hashbangRe) || [])[0] || ''
      const sourcesafe = hbang ? source.replace(hashbangRe, '') : source
      const importexpr = nextLoadRes.format === 'commonjs'
        ? `const {${importedNames}} = global.esmockCacheGet("${specifier}");`
        : `import {${importedNames}} from '${specifier}';`

      return {
        format: nextLoadRes.format,
        shortCircuit: true,
        responseURL: encodeURI(url),
        source: hbang + importexpr + sourcesafe
      }
    }
  }

  if (esmkdefsRe.test(url)) // parent of mocked modules
    return nextLoad(url, context)

  url = url.replace(esmkgdefsAndAfterRe, '')
  if (url.startsWith(urlDummy)) {
    url = url.replace(withHashRe, '')
    if (isnotfoundRe.test(url))
      url = url.replace(urlDummy, `file:///${url.match(esmkModuleIdRe)[1]}`)
  }

  const exportedNames = exportNamesRe.test(url) && url
    .replace(exportNamesRe, '$1')
    .replace(esmkImportListItemRe, '')
    .split(',')

  if (exportedNames && exportedNames[0]) {
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

export {
  load,
  resolve,
  getSource,
  // if getSource and initialize exported at the time,
  // getSource is never called :(
  initialize,
  globalPreload,
  loaderIsVerified as default
}
