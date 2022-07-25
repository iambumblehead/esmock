import { PublishCommand /*, SNSClient*/ } from '@aws-sdk/client-sns';

class NotificationsSupport {
  async publish (/* op, info, result */) {
    const command = new PublishCommand();

    return command;
  }
}

export function getNotifier (ctx) {
  new NotificationsSupport;

  return ctx;
}
