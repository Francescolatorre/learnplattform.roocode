import { defineFlatConfig } from 'eslint-define-config';
import eslintPluginReact from 'eslint-plugin-react';
import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin';
import typescriptEslintParser from '@typescript-eslint/parser';
import eslintPluginImport from 'eslint-plugin-import';

export default defineFlatConfig([
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
    rules: {
      'import/no-unresolved': 'error',
      'import/named': 'error',
      'import/default': 'error',
      'import/namespace': 'error',
    },
  },
]);
