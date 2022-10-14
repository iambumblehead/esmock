const errModuleIdNotFound = (moduleId, parent) =>
  new Error(`invalid moduleId: "${moduleId}" (used by ${parent})`)

const errModuleIdNotMocked = (moduleId, parent) =>
  new Error(`un-mocked moduleId: "${moduleId}" (used by ${parent})`)

export default {
  errModuleIdNotFound,
  errModuleIdNotMocked
}
