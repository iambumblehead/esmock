import {getNotifier} from './exportsNonDefaultClass.js';

export async function callNotifier () {
  return (new getNotifier()).publish();
}
