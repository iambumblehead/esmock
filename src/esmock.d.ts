/**
 * Mocks imports for the module specified by {@link modulePath}.
 *
 * By default, mock definitions are merged with the original module definitions.
 * To disable the default behaviour, Use esmock.strict.
 *
 * @param modulePath The module whose imports will be mocked.
 * @param parent A URL to resolve specifiers relative to; typically `import.meta.url`.
 *               If not specified, it will be inferred via the stack, which may not work
 *               if source maps are in use.
 * @param mockDefs A mapping of import specifiers to mocked module objects; these mocks will
 *                 only be used for imports resolved in the module specified by {@link modulePath}.
 * @param globalDefs A mapping of import specifiers to mocked module objects; these mocks will
 *                   apply to imports within the module specified by {@link modulePath}, as well
 *                   as any transitively imported modules.
 * @param opt
 * @returns The result of importing {@link modulePath}, similar to `import(modulePath)`.
 */
declare function esmock(modulePath: string, parent: string, mockDefs?: Record<string, any>, globalDefs?: Record<string, any>, opt?: esmock.Options): any;
declare function esmock(modulePath: string, mockDefs?: Record<string, any>, globalDefs?: Record<string, any>, opt?: esmock.Options): any;

declare namespace esmock {
  interface Options {
    strict?: boolean | undefined;
    purge?: boolean | undefined;
    isPackageNotFoundError?: boolean | undefined;
    parent?: string | undefined;
  }

  /**
   * Mocks imports for the module specified by {@link modulePath}.
   *
   * This "strict" variant gives un-modified mock definitions that are not
   * merged with original module definitions.
   *
   * @param modulePath The module whose imports will be mocked.
   * @param parent A URL to resolve specifiers relative to; typically `import.meta.url`.
   *               If not specified, it will be inferred via the stack, which may not work
   *               if source maps are in use.
   * @param mockDefs A mapping of import specifiers to mocked module objects; these mocks will
   *                 only be used for imports resolved in the module specified by {@link modulePath}.
   * @param globalDefs A mapping of import specifiers to mocked module objects; these mocks will
   *                   apply to imports within the module specified by {@link modulePath}, as well
   *                   as any transitively imported modules.
   * @param opt
   * @returns The result of importing {@link modulePath}, similar to `import(modulePath)`.
   */
  function strict(modulePath: string, parent: string, mockDefs?: Record<string, any>, globalDefs?: Record<string, any>, opt?: esmock.Options): any;
  function strict(modulePath: string, mockDefs?: Record<string, any>, globalDefs?: Record<string, any>, opt?: esmock.Options): any;
  export namespace strict {
    function p(modulePath: string, parent: string, mockDefs?: Record<string, any>, globalDefs?: Record<string, any>, opt?: esmock.Options): any;
    function p(modulePath: string, mockDefs?: Record<string, any>, globalDefs?: Record<string, any>, opt?: esmock.Options): any;
  }
  /**
   * Mocks dynamic imports for the module specified by {@link modulePath}.
   *
   * After using this function, consider calling {@link esmock.purge} to free memory.
   *
   * @param modulePath The module whose imports will be mocked.
   * @param parent A URL to resolve specifiers relative to; typically `import.meta.url`.
   *               If not specified, it will be inferred via the stack, which may not work
   *               if source maps are in use.
   * @param mockDefs A mapping of import specifiers to mocked module objects; these mocks will
   *                 only be used for imports resolved in the module specified by {@link modulePath}.
   * @param globalDefs A mapping of import specifiers to mocked module objects; these mocks will
   *                   apply to imports within the module specified by {@link modulePath}, as well
   *                   as any transitively imported modules.
   * @param opt
   * @returns The result of importing {@link modulePath}, similar to `import(modulePath)`.
   */
  function p(modulePath: string, parent: string, mockDefs?: Record<string, any>, globalDefs?: Record<string, any>, opt?: esmock.Options): any;
  function p(modulePath: string, mockDefs?: Record<string, any>, globalDefs?: Record<string, any>, opt?: esmock.Options): any;    

  /**
   * Unregisters a dynamic mock created by {@link esmock.p}.
   *
   * @param mockModule A module object that was previously returned by {@link esmock.p}.
   */
  function purge(mockModule: any): void;
}

export default esmock;
export { esmock as strict };
