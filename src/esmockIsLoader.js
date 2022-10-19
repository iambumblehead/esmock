import { loaderIsVerified } from './esmockLoader.js'

export default (cache => async () => typeof cache === 'boolean' ? cache
  : cache = await loaderIsVerified(import.meta.url))()
