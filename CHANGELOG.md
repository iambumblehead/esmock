# changelog

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
