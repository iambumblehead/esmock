/*
import {
  esmockCache
} from './esmockCache.js';
*/

/*
export async function getSource (url, context, defaultGetSource) {
  const stubsInfo = getStubsInfo(new URL(url))

  return stubsInfo
    ? { source: transformModuleSource(stubsInfo) }
  : defaultGetSource(url, context, defaultGetSource)
}
*/

import resolvewith from 'resolvewithplus';
import path from 'path';

import {
  esmockKeyEncode
} from './esmockKey.js';

const keyValRe = /^([^"=]*)=([\s\S]*)/,
      keyRemRe = /([^[]*)\[([^"\]]*)?\]([\s\S]*)?/,
      headQueryRe = /[^=]*\?([\s\S]*)/,
      restQueryRe = /^([^"&]*)&([\s\S]*)/,
      boolRe = /^(true|false)$/,
      hashRe = /#.*$/,
      intRe = /^\d*$/;

const global = {};

const encode = value => String(value)
   .replace(/[^ !'()~*]/gu, encodeURIComponent)
   .replace(/ /g, '+')
   .replace(/[!'()~*]/g, ch =>
     `%${ch.charCodeAt().toString(16).slice(-2).toUpperCase()}`);


// export async function resolve (specifier, context, defaultResolve) {
// }

// https://nodejs.org/api/esm.html#esm_resolve_specifier_context_defaultresolve
export async function resolve (specifier, context, defaultResolve) {
  // console.log('good', specifier, context );
  // console.log( context && context.parentUURL );
  let newspec = String( specifier );

  console.log('OOOOOOOOOOOOOOO');
  if (/loadkey=/.test(context && context.parentURL)) {
    console.log('load key returns', specifier );
    return defaultResolve(specifier, context, defaultResolve);
  }
  
  if (/key=/.test(context && context.parentURL)) {
    console.log('what ' + specifier, context.parentURL);
    // match = str.match(headQueryRe)
    // resolvewith(modulePath, calleePath)
    if (!/\//.test(specifier)) {
      // console.log('old spec ' + specifier);
      newspec = resolvewith(specifier, path.basename(context.parentURL));
      // console.log('new spec ' + specifier);
//      console.log('newspecifier' + specifier);
    }
    newspec += '?' + context.parentURL.replace(headQueryRe, '$1');

    console.log('returning', specifier, newspec, context.parentURL);
    //if ( /urlencoded/gi.test( specifier ) ) {
    const resurl = defaultResolve(specifier, context, defaultResolve);
    // resurl.url += '?' + context.parentURL.replace(headQueryRe, '$1');
    resurl.url += '?loadkey=' + esmockKeyEncode(
      ':parentId:moduleId'
        .replace(/:parentId/, context.parentURL)
        .replace(/:moduleId/, resurl.url.replace(/file:\/\//, ''))
    );

    console.log({
      resurl,
      parent: context.parentURL
    });

    
    //context.parentURL.replace(headQueryRe, '$1');
    return resurl;
    // console.log({ resurl, specifier });
    // return { url: 'form-urlencoded' };
    //}
    //return {
    //  url : specifier
    //};
      //    specifier = specifier.split('moduleformat')[0];
    /*
    throw new Error('--');
    specifier += '&module=' + global.defaultGetFormat(
      specifier, context, global.defaultGetFormat);
*/
    //console.log('match', match);
//    specifier = specifier
//    console.log('KEYFOUNd');
//    throw new Error('--');
  }

//  if (/key=\d/.test(specifier)) {
//    specifier += '&moduleformat=' + global.defaultGetFormat(
//      specifier, context, global.defaultGetFormat).format;
//  }

  if (/mainUtil\.js/gi.test(specifier)) {
    // console.log( esmockCache );
    console.log('MAINUTIL', specifier, context );
  }
//  console.log('', { specifier, context });
  const resolved = defaultResolve(specifier, context, defaultResolve);

//  console.log({
//    resolved
//  });
  
  return resolved;
};


// export async function getFormat (url, context, defaultGetFormat) {
//   return defaultGetFormat(url, context, defaultGetFormat);
// }

// export default global.esmockGetExportSubDefault(':name');
const sourceStub = `
export default global.esmockCacheMockDefinitionGet(':name');
`;

export async function getSource (url, context, defaultGetSource) {
  // console.log( 'url', url );
  console.log('FFFFFFFFFFFFFF');
  console.log({ context });
  if (/loadkey=/.test(url)) {
    console.log( 'source here', url );
    //return defaultGetSource(url, context, defaultGetSource);
    // const sorce = sourceStub.replace(/:name/, url.split('?')[0] + '?jump=1');
    const sorce = sourceStub.replace(/:name/, url);
    console.log(sorce);
    
    return {
      // source : sourceStub.replace(/:name/, url)
      source : sorce
    };
  }
  /*
  const stubsInfo = getStubsInfo(new URL(url))

  return stubsInfo
    ? { source: transformModuleSource(stubsInfo) }
  : defaultGetSource(url, context, defaultGetSource)
  */
  return defaultGetSource(url, context, defaultGetSource);
}
