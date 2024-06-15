import js from '@eslint/js'
import markdown from 'eslint-plugin-markdown'
import tseslint from 'typescript-eslint'

export default [
  {
    ignores: [
      "tests/**/dist",
      "tests/local/importsJSONfile.with.js",
      "tests/local/importsJSONfile.assert.legacy.js"
    ]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts", "**/*.js"],
    rules: {
      "@typescript-eslint/no-unused-expressions": 0,
      "@typescript-eslint/no-explicit-any": 0,
      "comma-dangle": "off"
    }
  },
  ...markdown.configs.recommended,
  {
    ignores: [
      "src/esmock.d.ts"
    ],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        Set: true,
        console: true,
        setTimeout: true,
        fetch: true,
        process: true,
        URL: true,
        global: true,
        describe: true,
        it: true,
        test: true,
        expect: true
      }
    },
    rules: {
      "no-trailing-spaces": [2],
      "no-unused-vars": ["error", {
        "vars": "all",
        "args": "after-used",
        "ignoreRestSiblings": false
      }],
      "global-require": 0,
      "no-sequences": 0,
      "strict": [2, "never"],
      "one-var": [2, {
        "let": "always",
        "const": "never"
      }],
      "space-in-parens": [2, "never"],
      "import/newline-after-import": 0,
      "indent": [2, 2, {
        "flatTernaryExpressions": true,
        "VariableDeclarator": {
          "let": 2,
          "const": 3
        }
      }],
      "camelcase": [2, {"properties": "never"}],
      "no-underscore-dangle": 0,
      "func-names": [2, "never"],
      "newline-per-chained-call": 0,
      "max-len": [2, 80],
      "comma-dangle": [2, "never"],
      "no-mixed-operators": 0,
      "no-plusplus": 0,
      "no-console": 0,
      "semi": [2, "never"],
      "nonblock-statement-body-position": 0,
      "arrow-parens": [2, "as-needed"],
      "space-before-function-paren": [2, "always"],
      "function-paren-newline": 0,
      "consistent-return": 0,
      "array-callback-return": 0,
      "prefer-const": 0,
      "prefer-object-spread": 0,
      "curly": 0,
      "operator-linebreak": 0,
      "no-param-reassign": 0,
      "key-spacing": [2],
      "implicit-arrow-linebreak": 0,
      "no-shadow": [0, "warn", {
        "allow": ["err"]
      }
      ],
      "prefer-arrow-callback": [2, {
        "allowNamedFunctions": true
      }],
      "no-return-assign": 0,
      "no-use-before-define": [2, "nofunc"],
      "no-nested-ternary": 0,
      "array-bracket-spacing": [2, "never"],
      "prefer-destructuring": 0,
      "class-methods-use-this": 0,
      "no-confusing-arrow": 0
    }
  }
]
