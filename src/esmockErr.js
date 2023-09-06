const errModuleIdNotFound = (moduleId, parent) =>
  new Error(`invalid moduleId: "${moduleId}" (used by ${parent})`)

const errModuleIdNotMocked = (moduleId, parent) =>
  new Error(`un-mocked moduleId: "${moduleId}" (used by ${parent})`)

const errModuleIdNoDefs = (moduleId, parent) =>
  new Error(`no mocks provided for module: "${moduleId}" (used by ${parent})`)

const errModuleIdUrlInvalid = (moduleId, parent) =>
  new Error(`moduleUrl invalid for module: "${moduleId}" (used by ${parent})`)

const errMissingLoader = () =>
  new Error('the loader chain process must include esmock. '
    + 'start the process using --loader=esmock.')

export default {
  errModuleIdNotFound,
  errModuleIdNotMocked,
  errModuleIdNoDefs,
  errModuleIdUrlInvalid,
  errMissingLoader
}
