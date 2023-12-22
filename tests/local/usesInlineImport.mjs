async function writeJSConfigFile (config, filePath) {
  const eslint = (await import('eslint'))

  return new eslint.ESLint({
    baseConfig: config,
    fix: true,
    useEslintrc: false,
    filePath
  })
}

writeJSConfigFile.importFSPromisesReadDir = async () => {
  const {readdir} = (await import('node:fs/promises'))
  return await readdir('path')
}

export default writeJSConfigFile
