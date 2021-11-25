import path from 'path';
import url from 'url';

const esmockPathDir = path.dirname(url.fileURLToPath(import.meta.url));

const esmockStringHasPath = str => /(\/[^:]*)/.test(str);

const esmockStringHasPathExternal = str => Boolean(
  esmockStringHasPath(str) && !str.includes(esmockPathDir));

// '    at file:///home/bumble/software/esmock/spec/esmock.spec.js:6:22'
//   -> ///home/bumble/software/esmock/spec/esmock.spec.js:6:22
// '    at funtcionName (file:///C:/Users/IEUser/esmock/src/esmockPath.js'
//

const esmockPathCallee = () => {
  const stackList = new Error().stack.split('\n').slice(1);
  const stackItem = stackList.find(esmockStringHasPathExternal);
  const stackmatch = stackItem.match(/(\/[^:]*)/);

  console.log({ stackItem, stackmatch, stackList });
  return stackmatch && stackmatch[1];
};

export {
  esmockPathDir,
  esmockPathCallee
};
