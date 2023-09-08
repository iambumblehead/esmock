import { register } from 'node:module'
import { MessageChannel } from 'node:worker_threads'

const { port2, port1 } = new MessageChannel()

register('./esmockLoader.js', {
  parentURL: import.meta.url,
  data: { port: port2 },
  transferList: [port2]
})

export default msg => {
  if (typeof global.postMessageEsmk === 'function')
    global.postMessageEsmk(msg)
  if (port1)
    port1.postMessage(msg)
}
