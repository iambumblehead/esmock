export default process.execArgv
  .some(args => args.startsWith('--loader=') && args.includes('esmock'))
  || /(?:^|\s)?--(?:experimental-)?loader=(["']*)esmock\1(?:\s|$)/
    .test(process.env.NODE_OPTIONS)
