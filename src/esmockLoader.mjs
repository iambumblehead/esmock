import path from 'path';
import url from 'url';

import esmock from './esmock.js';

const urlDummy = 'file://' + path.join(
  path.dirname(url.fileURLToPath(import.meta.url)), 'esmock.js');
const tplExportNamed = 'export const :n = global.esmockCacheGet(":k").:n';
const tplExportDefault = 'export default global.esmockCacheGet(":k").default';

export default esmock;

export async function resolve (specifier, context, defaultResolve) {
  const [ esmockKeyParam ] = (context.parentURL
    && context.parentURL.match(/esmockKey=\d*/) || []);

  if (!esmockKeyParam)
    return defaultResolve(specifier, context, defaultResolve);

  const resolved = defaultResolve(specifier, context, defaultResolve);
  const moduleKeyRe = new RegExp(
    '.*(' + resolved.url + '\\?' + esmockKeyParam + '[^#]*).*');
  const moduleKeys = context.parentURL.replace(
    /.*esmockModuleKeys=(.*)/, '$1');
  const moduleKey = moduleKeyRe.test(moduleKeys)
     && moduleKeys.replace(moduleKeyRe, '$1');
  
  if (moduleKey) {
    resolved.url = /isesm=true/.test(moduleKey)
      ? moduleKey
      : urlDummy + '#' + moduleKey;
  }

  return resolved;
}

export async function getSource (url, context, defaultGetSource) {
  if (/#esmockModuleKeys/gi.test(url)) // parent of mocked modules
    return defaultGetSource(url, context, defaultGetSource);

  if (url.startsWith(urlDummy)) {
    url = url.replace(/[^#]*#/, '');
  }

  const exportedNames = /exportNames=/.test(url) &&
    url.replace(/.*exportNames=(.*)/, '$1').split(',');
  if (exportedNames) {
    return {
      source : exportedNames.map(name => name === 'default'
        ? tplExportDefault.replace(/:k/, url)
        : tplExportNamed.replace(/:k/, url).replace(/:n/g, name)
      ).join('\n')
    };
  }

  return defaultGetSource(url, context, defaultGetSource);
}
