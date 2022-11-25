`esmock` relies on unit-tests to verify its behaviour. To get started, clone esmock and add a test to [one of the test runner folders here.][0] From esmock's root folder use `npm install && npm run test:install` to fetch all dependencies then, from whichever test folder is being used, `npm test` will run tests.

If `esmock` is failing for you, feel free to submit a PR that reproduces the issue with a failing unit-test. If available, I will try to resolve the issue and publish a new version of `esmock` with the solution.

Please do not submit PRs to convert esmock to typescript or add build scripts. Typescript and build scripts are fine, however, esmock's current setup is ideal for me now.


[0]: https://github.com/iambumblehead/esmock/tree/master/tests
