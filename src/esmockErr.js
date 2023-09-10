const errModuleIdNotFound = (moduleId, parent) =>
  new Error(`invalid moduleId: "${moduleId}" (used by ${parent})`)

const errModuleIdNotMocked = (moduleId, parent) =>
  new Error(`un-mocked moduleId: "${moduleId}" (used by ${parent})`)

const errMissingLoader = () =>
  new Error('For versions of node prior to v20.6.0, '
    + 'the loader chain process must include esmock. '
    + 'start the process using --loader=esmock.')

const errModuleIdNoDefs = (moduleId, parent) =>
  new Error(`no mocks provided for module: "${moduleId}" (used by ${parent})`)

export default {
  errModuleIdNotFound,
  errModuleIdNotMocked,
  errMissingLoader,
  errModuleIdNoDefs
}
