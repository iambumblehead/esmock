//import { PublishCommand /*, SNSClient*/ } from '@aws-sdk/client-sns';
import { basename } from './pathWrap.js';

class NotificationsSupport {
  async publish () {
    return basename('/published/file');
  }
}

export class getNotifier {
  async publish () {
    const note = new NotificationsSupport;

    return await note.publish();
  }
}
