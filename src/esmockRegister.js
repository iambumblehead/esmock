import module from 'node:module'
import threads from 'node:worker_threads'

const channel = threads.MessageChannel
  && new threads.MessageChannel()

if (channel && module.register) {
  module.register('./esmockLoader.js', {
    parentURL: import.meta.url,
    data: { port: channel.port2 },
    transferList: [channel.port2]
  })
}

export default msg => {
  if (typeof global.postMessageEsmk === 'function')
    global.postMessageEsmk(msg)
  if (channel && channel.port1)
    channel.port1.postMessage(msg)
}
