import { loaderIsVerified } from './esmockLoader.js'

export default (c => async () =>
  c || (c = await loaderIsVerified(import.meta.url)))()
