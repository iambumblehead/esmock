import { isBuiltin } from 'node:module'
import { pathToFileURL } from 'node:url'
import pnpapi from 'pnpapi'

export default (id, parent) => {
  if (isBuiltin(id)) {
    return id.startsWith('node:') ? id : `node:${id}`
  }

  if (id === 'import') {
    return null
  }

  const path = pnpapi.resolveRequest(id, parent)

  return path !== null ? pathToFileURL(path).href : null
}
