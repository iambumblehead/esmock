import module from 'node:module'
import threads from 'node:worker_threads'

const channel = threads.MessageChannel
  && new threads.MessageChannel()

const register = (res => () => {
  if (typeof res === 'boolean')
    return res

  //  if (!(res = global.shouldRegister === true))
  //    return res

  if ((res = Boolean(channel && module.register))) {
    module.register('./esmockLoader.js', {
      parentURL: import.meta.url,
      data: { port: channel.port2 },
      transferList: [channel.port2]
    })
  }

  return res
})()

export default msg => {
  if (register()) {
    channel.port1.postMessage(msg)
  } else if (typeof global.postMessageEsmk === 'function') {
    global.postMessageEsmk(msg)
  }
}
