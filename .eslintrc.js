module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:mocha-cleanup/recommended'
  ],
  parser: '@typescript-eslint/parser',
  ignorePatterns: [
      'dist',
      'blueprints'
  ],
  parserOptions: {
    project: [require.resolve('./tsconfig.lint.json')],
    sourceType: 'module'
  },
  plugins: [
    '@typescript-eslint',
    'eslint-plugin-mocha-cleanup',
    'prettier'
  ],
  rules: {
    '@typescript-eslint/no-this-alias': [
      'error',
      {
        allowDestructuring: true,
        allowedNames: [
          'self'
        ]
      }
    ],
    '@typescript-eslint/no-explicit-any': [
      'warn',
      {
        ignoreRestArgs: true
      }
    ],
    'mocha-cleanup/asserts-limit': 0,
    'mocha-cleanup/complexity-it': 0,
    'mocha-cleanup/no-outside-declaration': 0
  }
}
