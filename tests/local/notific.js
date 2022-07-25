import { EventEmitter } from 'events';

class NotificationsSupport {
  async publish (/* op, info, result */) {
    const emitter = new EventEmitter();
    return emitter.emit('foo');
  }
}

export function getNotifier () {
  return new NotificationsSupport();
}

// without this, esmock complains:
// "Cannot add property default, object is not extensible"
export default {};
