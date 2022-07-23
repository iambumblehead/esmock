export {default, load, resolve, getSource} from '../src/esmockLoader.js';

// this file is used in tandem with two other things,
//
//   1. a "main" definition in ./package.json,
//      ```
//      {
//        "main": "tests.esmock.export.js"
//      }
//      ```
//
//   2. an "esmock" definition in child ./tests-ava/package.json
//      ```
//      {
//        "dependencies": {
//          "esmock": "file:.."
//        }
//      }
//      ```
//
// together, these allow child folder tests to,
//  * import "esmock" rather than  "../../src/esmock.js"
//  * use "--loader=esmock" rather than "../../src/esmockLoader.js"
//
// Previously, there existed only one test folder and package.json,
// and during that time the package.json only needed to define
// the esmock dependency as a local file eg "esmock": "file:.."
//
// When subdirectories were introduced, "esmock": "file:../.." did not
// work with "--loader=esmock". The loader ignored the longer path and
// threw an error message, creating need for this file.
//
//   Error [ERR_MODULE_NOT_FOUND]: Cannot find package \
//     '/root/esmock/tests/tests-ava/node_modules/esmock/' \
//     imported from /root/esmock/tests/tests-ava/
