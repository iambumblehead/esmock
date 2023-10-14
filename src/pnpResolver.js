import { isBuiltin } from 'node:module'
import { pathToFileURL } from 'node:url'

const pnpapi = process.versions.pnp && (await import('pnpapi')).default

export default pnpapi && ((id, parent) => {
  if (isBuiltin(id)) {
    return id.startsWith('node:') ? id : `node:${id}`
  }

  if (id === 'import') {
    return null
  }

  const path = pnpapi.resolveRequest(id, parent)

  return path !== null ? pathToFileURL(path).href : null
})
