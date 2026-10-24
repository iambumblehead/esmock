const errModuleIdNotFound = (moduleId, parent) =>
  new Error(`invalid moduleId: "${moduleId}" (used by ${parent})`)

const errModuleIdNotMocked = (moduleId, parent) =>
  new Error(`un-mocked moduleId: "${moduleId}" (used by ${parent})`)

const errModuleIdNoDefs = (moduleId, parent) =>
  new Error(`no mocks provided for module: "${moduleId}" (used by ${parent})`)

export {
  errModuleIdNotFound,
  errModuleIdNotMocked,
  errModuleIdNoDefs
}
