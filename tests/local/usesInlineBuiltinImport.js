export default {
  importFSPromisesReadDir: async () => {
    const {readdir} = (await import('node:fs/promises'))
    return await readdir('path')
  }
}
