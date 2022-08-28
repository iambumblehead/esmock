const isloaderRe = /--(experimental-)?loader[=\s,"']*esmock/

export default (pr = process) =>
  isloaderRe.test(pr.execArgv) ||
  isloaderRe.test(pr.env.NODE_OPTIONS)
