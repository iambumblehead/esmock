const narrow = p => p
  .replace('file://', '')
  .replace(process.cwd(), '.')
  .replace(process.env.HOME, '~')

const errModuleIdNotFound = (moduleId, parent) => new Error(
  `invalid moduleId: "${narrow(moduleId)}" (used by ${narrow(parent)})`)

const errModuleIdNotMocked = (moduleId, parent) => new Error(
  `un-mocked moduleId: "${narrow(moduleId)}" (used by ${narrow(parent)})`)

export default {
  errModuleIdNotFound,
  errModuleIdNotMocked
}
