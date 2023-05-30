import * as child from './usesImportObjectsChild.js'

const dateWrapper = Date
const setTimeoutWrapper = setTimeout
const fetchWrapper = fetch

const reqUsers = async url => fetch(url)

export {
  dateWrapper,
  setTimeoutWrapper,
  fetchWrapper,
  reqUsers as default,
  child
}
