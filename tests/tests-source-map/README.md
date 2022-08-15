# esmock-source-map-bug

To run with source maps, run `npm run test`. esmock would previously fail unless the provided module path was absolute

To run without source maps, run `npm run test-no-maps`. This works.

https://github.com/iambumblehead/esmock/issues/113
