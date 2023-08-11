import { loaderIsVerified } from './esmockLoader.js'

export default (c => () => (c = c || loaderIsVerified(import.meta.url)))()
