import request from 'form-urlencoded';
import { createString } from './mainUtil.js';

if (typeof request === 'undefined') {
  throw new Error('imported definition: undefined');
};

export default () => {
  return 'main string, ' + createString();
};
