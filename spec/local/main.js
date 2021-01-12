import request from 'form-urlencoded';
import './mainUtil.js';

if ( typeof request === 'undefined' ) {
    throw new Error('imported definition: undefined');
}

export default () => {
  return 'final word'
}
