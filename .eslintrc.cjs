module.exports = {
  env: {
    browser: true,
    node: true,
    es2022: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module'  // Default to module
  },
  rules: {
    'no-unused-vars': 'warn',
    'no-console': 'off',
    'eqeqeq': 'error',
    'semi': ['error', 'always'],
    'no-empty': 'warn'  // Allow empty blocks as warnings instead of errors
  },
  overrides: [
    {
      // For CommonJS files
      files: ['**/*.cjs', '.eslintrc.cjs'],
      parserOptions: {
        sourceType: 'script'
      }
    },
    {
      // For test files
      files: ['**/*.test.js', '**/*.spec.js'],
      env: {
        jest: true
      },
      globals: {
        describe: 'readonly',
        test: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly',
        vi: 'readonly'
      }
    },
    {
      // For UMD browser builds
      files: ['**/*.browser.js'],
      env: {
        browser: true,
        amd: true
      },
      globals: {
        define: 'readonly',
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly'
      }
    },
    {
      // For service worker files
      files: ['service-worker.js', '**/service-worker.js'],
      env: {
        serviceworker: true
      },
      globals: {
        self: 'readonly',
        caches: 'readonly',
        clients: 'readonly'
      }
    },
  ]
};