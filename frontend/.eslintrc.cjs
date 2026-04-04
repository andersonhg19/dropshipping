// .eslintrc.cjs (CommonJS aunque tengas "type":"module")
module.exports = {
  root: true,
  extends: [
    'next/core-web-vitals',           // preset de Next
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  ignorePatterns: ['.next/', 'node_modules/', 'dist/'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
  },
};
