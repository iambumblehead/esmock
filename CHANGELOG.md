# changelog

 * 2.5.1 _Sep.12.2023_
   * [resolve existing ".ts" files,](https://github.com/iambumblehead/esmock/pull/243) rather than ".js" files, when typescript detected
 * 2.5.0 _Sep.09.2023_
   * [remove duplicate nextLoad call](https://github.com/iambumblehead/esmock/pull/239)
   * [add support for initialize hook](https://github.com/iambumblehead/esmock/pull/240)
 * 2.4.1 _Sep.07.2023_
   * [detect null AND undefined](https://github.com/iambumblehead/esmock/pull/238) loader-resolved source defintions
   * restore commented-out test affected by un-caught `undefined` source definitions
 * 2.4.0 _Sep.07.2023_
   * [remove esmockDummy](https://github.com/iambumblehead/esmock/pull/233)
   * [resolve issues](https://github.com/iambumblehead/esmock/issues/234) affecting node-v20.6
   * [remove usage of import.meta.resolve,](https://github.com/iambumblehead/esmock/pull/237) node-v20.6 meta.resolve is not useful
   * [only process 'module' and 'commonjs'](https://github.com/iambumblehead/esmock/pull/237) at the loader
 * 2.3.8 _Aug.15.2023_
   * [reuse moduleid regexp](https://github.com/iambumblehead/esmock/pull/231) replacing separately created regexps
   * [remove esmockIsLoader.js](https://github.com/iambumblehead/esmock/pull/231) export from esmockLoader.js instead
   * [simplify esmockIsLoader,](https://github.com/iambumblehead/esmock/pull/232) per review @koshic
 * 2.3.7 _Aug.15.2023_
   * [normalize package.json url](https://github.com/iambumblehead/esmock/pull/225) and [reduce loc for loader verification](https://github.com/iambumblehead/esmock/pull/226)
   * [small adjustments](https://github.com/iambumblehead/esmock/pull/228) reducing lines of code
   * [clerical changes to some](https://github.com/iambumblehead/esmock/pull/229) test folders
 * 2.3.6 _Aug.07.2023_
   * [resolve global mocking issues](https://github.com/iambumblehead/esmock/pull/224) when using mixed esm cjs import trees
 * 2.3.4 _Jul.30.2023_
   * [do not error when mocking commonjs](https://github.com/iambumblehead/esmock/pull/220) global values, found by @tommy-mitchell
 * 2.3.3 _Jul.28.2023_
   * [do not error when processing node hashbang](https://github.com/iambumblehead/esmock/pull/217) scripts from @tommy-mitchell
   * [add note explaining](https://github.com/iambumblehead/esmock/pull/211) why tsx [does not work](https://github.com/esbuild-kit/tsx/issues/264)
   * [pin node 18.16.x](https://github.com/iambumblehead/esmock/pull/217) to ci test matrix, re node [!48948](https://github.com/nodejs/node/issues/48948)
 * 2.3.2 _Jul.22.2023_
   * [restore ava unit-test](https://github.com/iambumblehead/esmock/pull/213) process at node20 test pipeline
   * [investigate problems](https://github.com/iambumblehead/esmock/issues/209) using tsx from @tommy-mitchell
   * [reported the issue at the tsx project,](https://github.com/esbuild-kit/tsx/issues/264) where tsx fails import moduleIds with query params
 * 2.3.1 _Jun.01.2023_
   * [improve README example](https://github.com/iambumblehead/esmock/pull/207) for mocking global values
   * use the word 'global' in the global values mocking example only, to improve clarity (hopefully)
 * 2.3.0 _May.31.2023_
   * [add initial support](https://github.com/iambumblehead/esmock/pull/205) for the solution to "globalThis" mocks,
   * support injecting definitions into the mock import tree,
   * demonstrate mock setTimeout, fetch and Date scenarious at unit-tests
   * [remove node 19](https://github.com/iambumblehead/esmock/pull/206) test job, update remaining jobs to use node 20
 * 2.2.3 _May.16.2023_
   * [add node v21 nightly](https://github.com/iambumblehead/esmock/pull/199) to test ci pipeline
   * send wide uri definitions to loader using loader worker
   * [encountered upstream error](https://github.com/nodejs/node/issues/47614) when attempting to add node v20 tests
 * 2.2.2 _May.06.2023_
   * [detect async import.meta.resolve](https://github.com/iambumblehead/esmock/pull/201) and handle in a separate way
   * remove un-necessary usage of await keyword in README example
   * require node version less than 20.x
 * 2.2.1 _Apr.03.2023_
   * [use Object.defineProperty](https://github.com/iambumblehead/esmock/pull/197) to write mock definitions protected on inherited prototype chain
 * 2.2.0 _Mar.23.2023_
   * [throw error when](https://github.com/iambumblehead/esmock/pull/193) esmock.strictest is called with empty mock definition, @koshic @Swivelgames 
   * [update jest and jest-light-runner packages](https://github.com/iambumblehead/esmock/pull/194) at unit-tests, @koshic
 * 2.1.0 _Nov.29.2022_
   * [add node v19](https://github.com/iambumblehead/esmock/pull/189) to ci-test pipeline
   * [use live default export](https://github.com/iambumblehead/esmock/pull/189) to populate enumerable properties of mock definition
 * 2.0.9 _Nov.26.2022_
   * [resolve windows modules with correct drive letter](https://github.com/iambumblehead/esmock/pull/189) using [resolvewithplus patch](https://github.com/iambumblehead/resolvewithplus/pull/42) from @mshima
 * 2.0.8 _Nov.25.2022_
   * [use live default export](https://github.com/iambumblehead/esmock/pull/188) in prototype of returned mock definition to resolve class instance mocking
   * [added CONTRIBUTING.md](https://github.com/iambumblehead/esmock/pull/188)
   * [added mocha tests](https://github.com/iambumblehead/esmock/pull/188)
 * 2.0.7 _Oct.26.2022_
   * [use export esmock.js,](https://github.com/iambumblehead/esmock/pull/182) rather than esmockLoader.js, as main package export
   * [embed resolvewithplus inside esmock,](https://github.com/iambumblehead/esmock/pull/181) to support yarn PnP, per @koshic
   * [use loader mechanism to detect](https://github.com/iambumblehead/esmock/pull/180) presence of esmock loader
   * [detect and use import.meta.resolve,](https://github.com/iambumblehead/esmock/pull/179) when defined by host environment
 * 2.0.6 _Oct.14.2022_
   * [show full path at error message,](https://github.com/iambumblehead/esmock/pull/170) making it easier to identify an invalid path
 * 2.0.5 _Oct.05.2022_
   * [add support for esmock.strictest,](https://github.com/iambumblehead/esmock/pull/172) a more-strict variant of esmock, per @gmahomarf
   * [use more-descriptive internal-variable "treeId",](https://github.com/iambumblehead/esmock/pull/170) rather than "esmockKey"
   * [include .mjs files in eslint filter](https://github.com/iambumblehead/esmock/pull/173) and lint-fix existing .mjs files
 * 2.0.4 _Sep.28.2022_
   * [huge simplifications to typescript types file,](https://github.com/iambumblehead/esmock/pull/164) much smaller, credit @jsejcksn
   * [added ts linting](https://github.com/iambumblehead/esmock/pull/166)
 * 2.0.3 _Sep.24.2022_
   * [simplify esmock.d.ts file,](https://github.com/iambumblehead/esmock/pull/163) reducing documentation and using shorter param names
   * [simplify args normalization](https://github.com/iambumblehead/esmock/pull/162) and drop support for opts.parent
   * [simplify](https://github.com/iambumblehead/esmock/pull/159/files) [path-extraction](https://github.com/iambumblehead/esmock/pull/161) to use one regexp rather than four
   * [use newer resolvewithplus](https://github.com/iambumblehead/resolvewithplus/releases/tag/v1.0.2) with better fileurl support
   * [simplify main esmock.js file,](https://github.com/iambumblehead/esmock/pull/158) slightly reducing install size
 * 2.0.2 _Sep.21.2022_
   * [simplifications,](https://github.com/iambumblehead/esmock/pull/153) slightly reducing install size
   * [update jest and jest-light-runner versions](https://github.com/iambumblehead/esmock/pull/156/files) used in unit-tests
   * [add jest+ts-node test example,](https://github.com/iambumblehead/esmock/pull/155) credit @liuxingbaoyu @cspotcode
 * 2.0.1 _Sep.15.2022_
   * [use newer, smaller resolvewithplus](https://github.com/iambumblehead/resolvewithplus/releases/tag/v1.0.1)
   * [use shared moduleId not found error message](https://github.com/iambumblehead/esmock/pull/146)
   * [remove lines not covered by tests](https://github.com/iambumblehead/esmock/pull/145)
   * [small fixes:](https://github.com/iambumblehead/esmock/pull/144) fix README json syntax error and test descriptions, rename modulePath to moduleId
   * [remove a few chars](https://github.com/iambumblehead/esmock/pull/148) from README
 * 2.0.0 _Sep.06.2022_
   * [export a 'strict'](https://github.com/iambumblehead/esmock/pull/140) variant of esmock
   * [use 'partial' mock behaviour with default export](https://github.com/iambumblehead/esmock/pull/141)
   * updated readme,
   * resolve error when partial mocking modules not found on filesystem
   * rename option `isPackageNotFoundError` to `isModuleNotFoundError`
   * [see the release announcement](https://github.com/iambumblehead/esmock/releases/tag/v2.0.0) for details and migration guide
 * 1.9.8 _Aug.28.2022_
   * [use latest node v18](https://github.com/iambumblehead/esmock/pull/130) for ci-tests, a bug in the ava package prevented this
   * [use latest resolvewithplus](https://github.com/iambumblehead/esmock/pull/130) and remove many lines of code needed for the older variant
   * [use one regexp to detect --loader esmock](https://github.com/iambumblehead/esmock/pull/131) and make unit-testing around this easier
   * [update the first example in the README](https://github.com/iambumblehead/esmock/pull/132) to be smaller and more interesting
   * [support multiple --loader calls,](https://github.com/iambumblehead/esmock/pull/134)  --loader esmock and --loader=esmock. added unit-tests
   * [update typescript types file](https://github.com/iambumblehead/esmock/pull/135) to include `parent` and `isPackageNotFoundError` options
   * give credit to @cawa-93 for showing me [how to mock specifier](https://github.com/iambumblehead/esmock/issues/126) that aren't found in the filesystem
 * 1.9.7 _Aug.25.2022_
   * support mocking specifiers that [aren't found in filesystem,](https://github.com/iambumblehead/esmock/issues/126) credit @cawa-93
 * 1.9.6 _Aug.24.2022_
   * support parent url to facilitate sourcemap usage, [113](https://github.com/iambumblehead/esmock/issues/113)
   * support import subpaths, eg `import: { '#sub': './path.js' }`
   * drop support for node 12 and remove node 12 ci pipeline
 * 1.9.5 _Aug.19.2022_
   * support cjs packges that define [main relative directory only](https://github.com/iambumblehead/esmock/issues/119)
 * 1.9.4 _Aug.15.2022_
   * support core modules [w/ node: prefix](https://github.com/iambumblehead/resolvewithplus/pull/27), credit @gmahomarf
 * 1.9.3 _Aug.13.2022_
   * [corrected esmock.d.ts](https://github.com/iambumblehead/esmock/pull/111) errors credit @jakebailey
 * 1.9.2 _Aug.02.2022_
   * restore [exports main,](https://github.com/iambumblehead/esmock/pull/107) credit @tripodsan
 * 1.9.1 _Jul.31.2022_
   * use package.json exports definition, compatible with newest typescript
   * add note to README about problems handling some export expressions
   * use shields.io npm badge, add "%" to coverage badge, eg "98.8%"
 * 1.9.0 _Jul.30.2022_
   * support for modules using stringy exports.import rules
   * add live coverage badge to show, for example, 98% coverage
   * add linting for README examples
   * improve unit-test for mocking non-extansible objects
   * improve node-version definition of `isLT1612` per review @aladdin-add
   * use smaller and specific condition for calling nextResolve at loader
 * 1.8.9 _Jul.25.2022_
   * resolve error, do not define default on extensible objects, credit @tripodsan
 * 1.8.8 _Jul.24.2022_
   * add node v14 test pipeline, credit @aladdin-add
   * resolve node v14 loader-originating runtime error
 * 1.8.7 _Jul.24.2022_
   * remove c8 from dependencies, move to devDependencies
 * 1.8.6 _Jul.24.2022_
   * adds jest-light-runner example and unit-tests
 * 1.8.5 _Jul.23.2022_
   * adds typescript and node-native runner tests [for windows CI](https://github.com/iambumblehead/esmock/pull/80)
   * renames esmockLoader.mjs to esmockLoader.js
   * adds runner-specific test folders for tests
   * removes dependency on old version of form-urlencoded
   * adds tsm unit-test [and example](https://github.com/iambumblehead/esmock/pull/81)
 * 1.8.4 _Jul.21.2022_
   * minify sources and dependency, ~13kB smaller
   * require newest resolvewithplus package, resolving minification error
   * move tests to subdirectory and begin organizing them better
 * 1.8.2 _Jul.19.2022_
   * improved support for symlinked paths, credit @swivelgames
 * 1.8.1 _Jul.19.2022_
   * resolve recursive load hook crash when using esmock with other loader
   * add basic typescript support, using ts-node/esm
   * add examples and tests showing how to use with ts loader
 * 1.8.0 _Jul.18.2022_
   * use strict-mocking behaviour by default, "partial mock" is optional
 * 1.7.8 _Jul.16.2022_
   * add tests using the node native test-runner
   * update README to use node native test-runner
 * 1.7.7 _Jul.14.2022_
   * support node v18.6.0 loader changes, credit @swivelgames
 * 1.7.6 _Jul.13.2022_
   * use npx script commands, credit @swivelgames
   * add NODE_OPTIONS support, credit @swivelgames
 * 1.7.5 _Mar.27.2022_
   * use async default resolver, returned by node v17.8.0+
 * 1.7.4 _Feb.15.2022_
   * increment resolvewithplus to handle stringy esm export, used by 'got'
 * 1.7.3 _Feb.02.2022_
   * increment resolvewithplus to handle array esm export, used by 'yargs'
 * 1.7.2 _Dec.15.2021_
   * remove README at npm package
 * 1.7.1 _Dec.15.2021_
   * increment resolvewithplus, better tests
 * 1.7.0 _Dec.13.2021_
   * re-use predefined regexps (faster)
   * resolve encoded whitespace bug at module loader
 * 1.6.5 _Dec.06.2021_
   * add size and downloads badges to README
   * edits to README
 * 1.6.3 _Dec.04.2021_
   * adds more examples to README
 * 1.6.2 _Dec.04.2021_
   * adds uvu tests and example command to README
 * 1.6.1 _Dec.03.2021_
   * adds test verifying deep stacktrace has small path file:///
   * resolve bug: '--loader=esmock' not-found error not thrown
   * small README edits, update link to wiki (use Home as default)
 * 1.6.0 _Dec.02.2021_
   * reduce file url length (improve readability of stacktrace)
 * 1.5.0 _Dec.01.2021_
   * resolve bug around error '--loader=esmock' detection
 * 1.4.0 _Nov.30.2021_
   * throw error if esmock is called without --loader=esmock
 * 1.3.3 _Nov.28.2021_
   * update quick-start README to include phrase 'unit test'
 * 1.3.2 _Nov.27.2021_
   * use quick-start README with link to more descriptive README
 * 1.3.1 _Nov.26.2021_
   * add npm keywords, remove lines of code
 * 1.3.0 _Nov.26.2021_
   * add support for await import, update README
 * 1.1.0 _Nov.25.2021_
   * add windows-latest to testing pipeline and begin windows support
   * removed files and functions no longer needed
   * increment resolvewithplus package and other dependencies
 * 1.0.1 _Nov.02.2021_
   * add node v17.x to testing pipeline
   * add, make warning message go away for node 16.12.0+
 * 1.0.0 _Oct.27.2021_
   * release version 1.0
 * 0.4.2 _Oct.27.2021_
   * export 'load' hook from moduleLoader, required by node v16.12.0+
 * 0.4.1 _Oct.10.2021_
   * version bump, increment devDependencies,
   * major improvement to README, thanks @swivelgames
 * 0.4.0 _Sep.07.2021_
   * do not runtime error when returning type '[object Module]' default
 * 0.3.9 _May.05.2021_
   * small change to README
   * added a test, update gitlab action to use node 16.x
 * 0.3.8 _Apr.21.2021_
   * small change to README
 * 0.3.7 _Apr.20.2021_
   * add test, throw error if mocked module path is not found
 * 0.3.6 _Apr.19.2021_
   * throw error if mocked module path is not found
 * 0.3.5 _Apr.18.2021_
   * added gitlab actions npm test: node 12.x, 14.x and 15.x
 * 0.3.3 _Apr.13.2021_
   * added keywords to package.json, use github action to npm publish
 * 0.3.1 _Apr.12.2021_
   * simplify README
 * 0.3.0 _Apr.10.2021_
   * adds support for mocking modules 'globally' for the instance
 * 0.2.0 _Apr.10.2021_
   * adds support for mocking core modules such as fs and path
 * 0.1.0 _Apr.10.2021_
   * adds support for native esm modules
