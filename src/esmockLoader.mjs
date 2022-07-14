import process from 'process';
import path from 'path';
import url from 'url';

import esmock from './esmock.js';

global.esmockloader = global.esmockloader || (
  process.execArgv.some(
    args => (args.startsWith('--loader=') && args.includes('esmock'))
  )
) || (
  /(?:^|\s)?--(?:experimental-)?loader=(["']*)esmock\1(?:\s|$)/.test(
    process.env.NODE_OPTIONS
  )
);

export default esmock;

// ex, file:///path/to/esmock,
//     file:///c:/path/to/esmock
const urlDummy = 'file:///' + path
  .join(path.dirname(url.fileURLToPath(import.meta.url)), 'esmock.js')
  .replace(/^\//, '');

const esmockGlobalsAndAfterRe = /\?esmockGlobals=.*/;
const esmockGlobalsAndBeforeRe = /.*\?esmockGlobals=/;
const esmockModuleKeysRe = /#esmockModuleKeys/;
const exportNamesRe = /.*exportNames=(.*)/;
const esmockKeyRe = /esmockKey=\d*/;
const withHashRe = /[^#]*#/;
const isesmRe = /isesm=true/;

const resolve = async (specifier, context, defaultResolve) => {
  const { parentURL } = context;
  const [ esmockKeyParamSmall ] =
    (parentURL && parentURL.match(/\?esmk=\d*/)) || [];
  const esmockKeyLong = esmockKeyParamSmall
    ? global.esmockKeyGet(esmockKeyParamSmall.split('=')[1])
    : parentURL;
  const [ esmockKeyParam ] =
    (esmockKeyLong && esmockKeyLong.match(esmockKeyRe) || []);

  if (!esmockKeyParam)
    return defaultResolve(specifier, context, defaultResolve);

  const resolved = await defaultResolve(specifier, context, defaultResolve);
  const resolvedurl = decodeURI(resolved.url);
  const moduleKeyRe = new RegExp(
    '.*(' + resolvedurl + '\\?' + esmockKeyParam + '[^#]*).*');

  const [ keyUrl, keys ] = esmockKeyLong.split(esmockModuleKeysRe);
  const moduleGlobals = keyUrl.replace(esmockGlobalsAndBeforeRe, '');
  const moduleKeyChild = moduleKeyRe.test(keys)
        && keys.replace(moduleKeyRe, '$1');
  const moduleKeyGlobal = moduleKeyRe.test(moduleGlobals)
        && moduleGlobals.replace(moduleKeyRe, '$1');

  const moduleKey = moduleKeyChild || moduleKeyGlobal;
  if (moduleKey) {
    resolved.url = isesmRe.test(moduleKey)
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
  if (esmockModuleKeysRe.test(url)) // parent of mocked modules
    return defaultGetSource(url, context, defaultGetSource);

  url = url.replace(esmockGlobalsAndAfterRe, '');
  if (url.startsWith(urlDummy)) {
    url = url.replace(withHashRe, '');
  }

  const exportedNames = exportNamesRe.test(url) &&
    url.replace(exportNamesRe, '$1').split(',');
  if (exportedNames.length) {
    return {
      format : 'module',
      shortCircuit : true,
      responseURL : url.replace(/\s+/g,'%20'),
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
