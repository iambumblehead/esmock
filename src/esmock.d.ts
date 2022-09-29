type MockMap = { [specifier: string]: any }

type Options = {
  strict?: boolean | undefined,
  purge?: boolean | undefined,
  isModuleNotFoundError?: boolean | undefined
}

type MockFunction = {
  /**
   * Mocks imports for the module specified by {@link modulePath}.
   *
   * @param modulePath The module whose imports will be mocked.
   * @param parent A URL used to resolve relative specifiers, typically
   * `import.meta.url`. If not specified, inferred via the stack. Useful with
   * source maps.
   * @param defs A mapping of import specifiers to mock definitions.
   * @param gdefs A globally applied mapping of import specifiers to mock
   * definitions.
   * @param opts
   * @returns The mocked import-tree result of "import({@link modulePath})"
   */
  (
    modulePath: string,
    parent: string,
    defs?: MockMap,
    gdefs?: MockMap,
    opts?: Options
  ): any,
  (
    modulePath: string,
    defs?: MockMap,
    gdefs?: MockMap,
    opts?: Options
  ): any
}

/**
 * By default, mock definitions are merged with the original module definitions.
 * To avoid the default behaviour, use {@link esmock.strict}.
 */
declare const esmock: MockFunction & {
  /**
   * Uses caching to support `await import()` inside the mocked import tree.
   *
   * After using this function, consider calling {@link esmock.purge}
   * to free memory.
   */
  p: MockFunction,

  /**
   * Removes caching created by {@link esmock.p}.
   *
   * @param mockModule A module object returned from {@link esmock.p}.
   */
  purge: (mockModule: any) => void,

  /**
   * The "strict" variant replaces original module definitions
   * with mock definitions.
   */
  strict: MockFunction & {
    p: MockFunction
  }
}

/**
 * The "strict" variant replaces original module definitions
 * with mock definitions.
 */
declare const strict: typeof esmock['strict']

export {
  esmock as default,
  strict,
  type MockFunction,
  type MockMap,
  type Options
}
