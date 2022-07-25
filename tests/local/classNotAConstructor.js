import {getNotifier} from './notific.js';

export default function callNotifier () {
  return getNotifier().publish();
}
