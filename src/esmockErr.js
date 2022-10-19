const errModuleIdNotFound = (moduleId, parent) =>
  new Error(`invalid moduleId: "${moduleId}" (used by ${parent})`)

const errModuleIdNotMocked = (moduleId, parent) =>
  new Error(`un-mocked moduleId: "${moduleId}" (used by ${parent})`)

const errMissingLoader = () =>
  new Error('the loader chain process must include esmock. '
    + 'start the process using --loader=esmock.')

export default {
  errModuleIdNotFound,
  errModuleIdNotMocked,
  errMissingLoader
}
