import {getNotifier} from './exportsNonDefaultClass.js';

export function callNotifier () {
  return (new getNotifier()).publish();
}
