//import { PublishCommand /*, SNSClient*/ } from '@aws-sdk/client-sns';
import { basename } from './pathWrap.js';

class NotificationsSupport {
  async publish (/* op, info, result */) {
    return basename('/published/file');
  }
}

export function getNotifier () {
  const note = new NotificationsSupport;

  return note.publish();
}
