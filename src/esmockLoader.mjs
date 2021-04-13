import path from 'path';
import url from 'url';

import esmock from './esmock.js';
export default esmock;

const urlDummy = 'file://' + path.join(
  path.dirname(url.fileURLToPath(import.meta.url)), 'esmock.js');

export async function resolve (specifier, context, defaultResolve) {
  const [ esmockKeyParam ] = (context.parentURL
    && context.parentURL.match(/esmockKey=\d*/) || []);

  if (!esmockKeyParam)
    return defaultResolve(specifier, context, defaultResolve);

  const resolved = defaultResolve(specifier, context, defaultResolve);
  const moduleKeyRe = new RegExp(
    '.*(' + resolved.url + '\\?' + esmockKeyParam + '[^#]*).*');

  const moduleURLSplitKeys = context.parentURL.split('#esmockModuleKeys=');
  // eslint-disable-next-line prefer-destructuring
  const moduleGlobals = moduleURLSplitKeys[0].split('?esmockGlobals=')[1];
  const moduleKeyChild = moduleKeyRe.test(moduleURLSplitKeys[1])
        && moduleURLSplitKeys[1].replace(moduleKeyRe, '$1');
  const moduleKeyGlobal = moduleKeyRe.test(moduleGlobals)
        && moduleGlobals.replace(moduleKeyRe, '$1');

  const moduleKey = moduleKeyChild || moduleKeyGlobal;
  if (moduleKey) {
    resolved.url = /isesm=true/.test(moduleKey)
      ? moduleKey
      : urlDummy + '#' + moduleKey;
  } else if (moduleGlobals && moduleGlobals !== 'null') {
    if (!resolved.url.startsWith('node:')) {
      resolved.url += '?esmockGlobals=' + moduleGlobals;
    }
  }

  return resolved;
}

export async function getSource (url, context, defaultGetSource) {
  if (/#esmockModuleKeys/gi.test(url)) // parent of mocked modules
    return defaultGetSource(url, context, defaultGetSource);

  [ url ] = url.split('?esmockGlobals=');
  if (url.startsWith(urlDummy)) {
    url = url.replace(/[^#]*#/, '');
  }

  const exportedNames = /exportNames=/.test(url) &&
    url.replace(/.*exportNames=(.*)/, '$1').split(',');
  if (exportedNames) {
    return {
      source : exportedNames.map(name => name === 'default'
        ? `export default global.esmockCacheGet("${url}").default`
        : `export const ${name} = global.esmockCacheGet("${url}").${name}`
      ).join('\n')
    };
  }

  return defaultGetSource(url, context, defaultGetSource);
}
