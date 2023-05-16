import { loaderIsVerified } from './esmockLoader.js'

export default (c => async () =>
  (c = c || loaderIsVerified(import.meta.url)))()
