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
    '@typescript-eslint/member-ordering': ['error', {
      default: {
        memberTypes: [
          // Index signature
          'signature',

          // Fields
          'public-static-field',
          'protected-static-field',
          'private-static-field',

          'public-decorated-field',
          'protected-decorated-field',
          'private-decorated-field',

          'public-instance-field',
          'protected-instance-field',
          'private-instance-field',

          'public-abstract-field',
          'protected-abstract-field',
          'private-abstract-field',

          'public-field',
          'protected-field',
          'private-field',

          'static-field',
          'instance-field',
          'abstract-field',

          'decorated-field',

          'field',

          // Static initialization
          'static-initialization',

          // Constructors
          'public-constructor',
          'protected-constructor',
          'private-constructor',

          'constructor',

          ['get', 'set'],

          // Methods
          'public-static-method',
          'protected-static-method',
          'private-static-method',

          'public-decorated-method',
          'protected-decorated-method',
          'private-decorated-method',

          'public-instance-method',
          'protected-instance-method',
          'private-instance-method',

          'public-abstract-method',
          'protected-abstract-method',
          'private-abstract-method',

          'public-method',
          'protected-method',
          'private-method',

          'static-method',
          'instance-method',
          'abstract-method',

          'decorated-method',

          'method'
        ],
        order: 'alphabetically-case-insensitive'
      }
    }],
    'mocha-cleanup/asserts-limit': 0,
    'mocha-cleanup/complexity-it': 0,
    'mocha-cleanup/no-outside-declaration': 0
  }
}
