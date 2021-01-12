import path from 'path';
import url from 'url';

const esmockPathDir = path.dirname(url.fileURLToPath(import.meta.url));

const esmockPathCallee = () => {
  const stackList = new Error().stack.split('\n').slice(1);
  const stackItem = stackList.find( stack => !stack.includes( esmockPathDir ) );
  const stackmatch = stackItem.match(/(\/[^:]*)/);

  return stackmatch && stackmatch[1];
}

const esmockPathCalleeDir = () => {
  const pathCallee = esmockPathCallee();

  return path.dirname( pathCallee );
}

const esmockPathCalleeDirJoin = relpath => path.join(
  esmockPathCalleeDir(), relpath );

export {
  esmockPathDir,
  esmockPathCalleeDir,
  esmockPathCalleeDirJoin
}
