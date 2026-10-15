import fs from 'node:fs'
import {errModuleIdNotMocked} from './esmockErr.js'

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
const iscommonjsmoduleRe = /^(commonjs|module)(-typescript)?$/
const isstrict3 = /strict=3/
const hashbangRe = /^(#![^\n]*\n)/

// returns embedded moduleid w/ treeid, the last one found in defs, up to
// the next '#-#' separator. a literal search: a regexp built from the url
// would need every special path char escaped, and its unanchored leading
// '.*' makes each failed lookup quadratic in the length of defs
const moduleIdFind = (moduleid, treeid, defs) => {
  const start = typeof defs === 'string'
    ? defs.lastIndexOf(`${moduleid}?${treeid}`) : -1
  if (start === -1)
    return false

  const end = defs.indexOf('#-#', start)
  return end === -1 ? defs.slice(start) : defs.slice(start, end)
}

// node v12.0-v18.x, global
const mockKeys = global.mockKeys = (global.mockKeys || {})
const mockKeysSource = global.mockKeysSource = (global.mockKeysSource || {})

// use fs when logging from hooks, console.log async unpredictable
const log = (...args) => (
  fs.writeSync(1, JSON.stringify(args, null, '  ').slice(2, -1)))

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

const resolve = (specifier, context, nextResolve) => {
  const { parentURL } = context
  const treeidspec = treeidspecFromUrl(parentURL) || parentURL
  if (!esmkTreeIdRe.test(treeidspec))
    return nextResolve(specifier, context)

  const [treeid] = String(treeidspec).match(esmkTreeIdRe)
  const [url, defs] = treeidspec.split(esmkdefsRe)
  const gdefs = url && url.replace(esmkgdefsAndBeforeRe, '')
  // do not call 'nextResolve' for notfound modules
  if (treeidspec.includes(`esmkModuleId=${specifier}&isfound=false`)) {
    const moduleUrl = `file:///${specifier}`
    const moduleIdUrl =
      moduleIdFind(moduleUrl, treeid, gdefs) ||
      moduleIdFind(moduleUrl, treeid, defs)
    const moduleId = moduleIdUrl && moduleIdUrl.slice(moduleUrl.length)
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

  const resolved = nextResolve(specifier, context)
  const moduleId =
    moduleIdFind(resolved.url, treeid, defs) ||
    moduleIdFind(resolved.url, treeid, gdefs)
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
    throw errModuleIdNotMocked(resolved.url, treeidspec.split('?')[0])

  return resolved
}

const loaderVerifyUrl = urlDummy + '?esmock-loader=true'
const loaderIsVerified = (memo => async () => memo = memo || (
  (await import(loaderVerifyUrl)).default === true))()
const load = (url, context, nextLoad) => {
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
      const nextLoadRes = nextLoad(url, context)
      if (!iscommonjsmoduleRe.test(nextLoadRes.format))
        return nextLoadRes

      // nextLoadRes.source sometimes 'undefined' and other times 'null' :(
      const sourceIsNullLike = (
        nextLoadRes.source === null || nextLoadRes.source === undefined)
      const source = sourceIsNullLike
        ? String(fs.readFileSync(new URL(url)))
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
    if (mockKeysSource[url]) {
      return {
        // ...await nextLoad(url, context),
        format: 'json',
        shortCircuit: true,
        responseURL: encodeURI(url),
        source: mockKeysSource[url]
      }
    }

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

  if (treeid && !url.includes(treeid)) {
    // long querystring reduces readability of runtime error stacktrace
    // smaller querystring `esmk=$id` does not clutter stacktrace
    url = url + '?esmk=' + treeid.split('=')[1]
  }

  return nextLoad(url, context)
}

export {
  load,
  resolve,
  loaderIsVerified as default
}
