type mocks = Record<string, any>

type opts = {
  strict?: boolean | undefined,
  purge?: boolean | undefined,
  isModuleNotFoundError?: boolean | undefined
}

/**
 * Mocks imports for the module specified by {@link modulePath}.
 *
 * By default, mock definitions are merged with the original module definitions.
 * To avoid the default behaviour, use esmock.strict.
 *
 * @param modulePath The module whose imports will be mocked.
 * @param parent A URL to resolve specifiers relative to; typically `import.meta.url`.
 *               If not specified, inferred via the stack. Useful with source maps.
 * @param defs A mapping of import specifiers to mock definitions.
 * @param gdefs A mapping of import specifiers to mock definitions, applied globally.
 * @param opt
 * @returns The result of importing {@link modulePath}, similar to `import(modulePath)`.
 */
declare function esmock(modulePath: string, parent: string, defs?: mocks, gdefs?: mocks, opt?: opts): any
declare function esmock(modulePath: string, defs?: mocks, gdefs?: mocks, opt?: opts): any

declare namespace esmock {
  /**
   * Mocks imports for the module specified by {@link modulePath}.
   *
   * The "strict" variant replaces original module definitions with mock definitions.
   *
   * @param modulePath The module whose imports will be mocked.
   * @param parent A URL to resolve specifiers relative to; typically `import.meta.url`.
   *               If not specified, inferred via the stack. Useful with source maps.
   * @param defs A mapping of import specifiers to mock definitions.
   * @param gdefs A mapping of import specifiers to mock definitions, applied globally.
   * @param opt
   * @returns The result of importing {@link modulePath}, similar to `import(modulePath)`.
   */
  function strict(modulePath: string, parent: string, defs?: mocks, gdefs?: mocks, opt?: opts): any
  function strict(modulePath: string, defs?: mocks, gdefs?: mocks, opt?: opts): any
  export namespace strict {
    function p(modulePath: string, parent: string, defs?: mocks, gdefs?: mocks, opt?: opts): any
    function p(modulePath: string, defs?: mocks, gdefs?: mocks, opt?: opts): any
  }

  /**
   * Uses caching to support `await import()` inside the mocked import tree.
   *
   * After using this function, consider calling {@link esmock.purge} to free memory.
   *
   * @param modulePath The module whose imports will be mocked.
   * @param parent A URL to resolve specifiers relative to; typically `import.meta.url`.
   *               If not specified, inferred via the stack. Useful with source maps.
   * @param defs A mapping of import specifiers to mock definitions.
   * @param gdefs A mapping of import specifiers to mock definitions, applied globally.
   * @param opt
   * @returns The result of importing {@link modulePath}, similar to `import(modulePath)`.
   */
  function p(modulePath: string, parent: string, defs?: mocks, gdefs?: mocks, opt?: opts): any
  function p(modulePath: string, defs?: mocks, gdefs?: mocks, opt?: opts): any

  /**
   * Removes caching created by {@link esmock.p}.
   *
   * @param mockModule A module object returned from {@link esmock.p}.
   */
  function purge(mockModule: any): void
}

export { esmock as default, esmock as strict }