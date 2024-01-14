async function writeJSConfigFile (config, filePath) {
  const eslint = (await import('eslint'))

  return new eslint.ESLint({
    baseConfig: config,
    fix: true,
    useEslintrc: false,
    filePath
  })
}

export default writeJSConfigFile
