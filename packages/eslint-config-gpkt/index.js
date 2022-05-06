/*
 * @rushstack/eslint-patch is used to include plugins as dev
 * dependencies instead of imposing them as peer dependencies
 *
 * https://www.npmjs.com/package/@rushstack/eslint-patch
 */
require('@rushstack/eslint-patch/modern-module-resolution')

/**
 * @type {import('eslint').Linter.Config}
 */
module.exports = {
  extends: ['plugin:prettier/recommended'],
  plugins: ['import'],
  rules: {
    'import/no-anonymous-default-export': 'warn',
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    requireConfigFile: false,
    sourceType: 'module',
    allowImportExportEverywhere: true,
    warnOnUnsupportedTypeScriptVersion: true,
  },
  env: {
    browser: true,
    node: true,
  },
  settings: {
    'import/parsers': {
      [require.resolve('@typescript-eslint/parser')]: ['.ts', '.d.ts'],
    },
    'import/resolver': {
      [require.resolve('eslint-import-resolver-node')]: {
        extensions: ['.js', '.ts'],
      },
      [require.resolve('eslint-import-resolver-typescript')]: {
        alwaysTryTypes: true,
      },
    },
  },
}
