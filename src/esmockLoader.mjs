import path from 'path';
import url from 'url';

import esmock from './esmock.js';
global.esmockloader = true;
export default esmock;

// ex, file:///path/to/esmock,
//     file:///c:/path/to/esmock
const urlDummy = 'file:///' + path
  .join(path.dirname(url.fileURLToPath(import.meta.url)), 'esmock.js')
  .replace(/^\//, '');

const resolve = async (specifier, context, defaultResolve) => {
  const [ esmockKeyParam ] = (context.parentURL
    && context.parentURL.match(/\?esmk=\d*/) || []);

  if (!esmockKeyParam)
    return defaultResolve(specifier, context, defaultResolve);

  const esmockKeyLong = global.esmockKeyGet(esmockKeyParam.split('=')[1]);
  
  const [ esmockKeyLongParam ] = (esmockKeyLong
    && esmockKeyLong.match(/esmockKey=\d*/)) || [];

  if (!esmockKeyLongParam)
    return defaultResolve(specifier, context, defaultResolve);
  
  const resolved = defaultResolve(specifier, context, defaultResolve);
  const moduleKeyRe = new RegExp(
    '.*(' + resolved.url + '\\?' + esmockKeyLongParam + '[^#]*).*');

  const moduleURLSplitKeys = esmockKeyLong.split('#esmockModuleKeys=');
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
};

const load = async (url, context, defaultGetSource) => {
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
      format : 'module',
      source : exportedNames.map(name => name === 'default'
        ? `export default global.esmockCacheGet("${url}").default`
        : `export const ${name} = global.esmockCacheGet("${url}").${name}`
      ).join('\n')
    };
  }

  return defaultGetSource(url, context, defaultGetSource);
};

// node lt 16.12 require getSource, node gte 16.12 warn remove getSource
const getSource = ' 16. 12' > process.versions.node.split('.')
  .slice(0, 2).map(s => s.padStart(3)).join('.') && load;

export {
  load,
  resolve,
  getSource
};
