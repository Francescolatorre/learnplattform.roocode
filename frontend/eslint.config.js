import {defineFlatConfig} from 'eslint-define-config';
import eslintPluginReact from 'eslint-plugin-react';
import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin';
import typescriptEslintParser from '@typescript-eslint/parser';
import eslintPluginImport from 'eslint-plugin-import';
// No need to import the resolver, it's referenced by name in settings

export default defineFlatConfig([
  {
    files: [
      'vite.config.ts',
      'vitest.config.ts',
      'playwright.config.ts',
      'playwright-api.config.ts',
    ],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json', // Use tsconfig.node.json for these files
      },
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: typescriptEslintParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
      },
    },
    plugins: {
      react: eslintPluginReact,
      '@typescript-eslint': typescriptEslintPlugin,
      import: eslintPluginImport,
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
    },
    rules: {
      'import/no-unresolved': 'error', // Ensure imports resolve correctly
      'import/named': 'error', // Ensure named imports exist in the imported module
      'import/default': 'error', // Ensure a default export exists for default imports
      'import/namespace': 'error', // Ensure imported namespaces contain valid members
      // Add other custom rules here
    },
  },
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
      },
    },
    plugins: {
      react: eslintPluginReact,
      import: eslintPluginImport,
    },
    settings: {
      'import/resolver': {
        // For JavaScript files, we can use the same typescript resolver
        // if your paths are defined in tsconfig.json
        typescript: {},
        // Alternatively, for JavaScript-only projects, you can install and use:
        // eslint-import-resolver-alias or eslint-import-resolver-webpack
      },
    },
    rules: {
      'import/no-unresolved': 'error',
      'import/named': 'error',
      'import/default': 'error',
      'import/namespace': 'error',
    },
  },
]);
