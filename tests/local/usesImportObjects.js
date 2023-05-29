import * as child from './usesImportObjectsChild.js'

// console.log('from inside file', Date, fetch)

const dateWrapper = Date
const setTimeoutWrapper = setTimeout
const fetchWrapper = fetch

// export { dateWrapper, setTimeoutWrapper, fetchWrapper }
export { dateWrapper, setTimeoutWrapper, fetchWrapper, child }
