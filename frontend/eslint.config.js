import {defineFlatConfig} from 'eslint-define-config';
import eslintPluginReact from 'eslint-plugin-react';
import eslintPluginReactHooks from 'eslint-plugin-react-hooks';
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
        project: './tsconfig.json', // Use tsconfig for these config files
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
        project: './tsconfig.json',
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
      'react-hooks': eslintPluginReactHooks,
    },
    settings: {
      react: {
        version: 'detect', // Automatically detect the React version
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
    },
    rules: {
      // Import rules
      'import/no-unresolved': 'error', // Ensure imports resolve correctly
      'import/named': 'error', // Ensure named imports exist in the imported module
      'import/default': 'error', // Ensure a default export exists for default imports
      'import/namespace': 'error', // Ensure imported namespaces contain valid members
      'import/order': [
        'error',
        {
          groups: [
            'builtin', // Node.js built-in modules
            'external', // Packages from node_modules
            'internal', // Aliased paths
            'parent', // Parent directories
            'sibling', // Same directory
            'index', // Current directory index
            'object', // Object imports
            'type', // Type imports
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],

      // React rules
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      'react/hook-use-state': 'error',
      'react/prop-types': 'off', // Off because we use TypeScript
      'react/display-name': 'warn',
      'react/jsx-key': 'error',
      'react/jsx-no-duplicate-props': 'error',

      // React Hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // TypeScript rules
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off', // Optional return types
      '@typescript-eslint/explicit-module-boundary-types': 'off', // Optional export types
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_'
      }],
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-empty-interface': 'warn',
      '@typescript-eslint/no-empty-function': 'warn',
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-ignore': 'allow-with-description',
          'ts-expect-error': 'allow-with-description',
        },
      ],

      // General rules
      'no-console': ['warn', {allow: ['warn', 'error', 'info']}],
      'no-debugger': 'warn',
      'no-duplicate-case': 'error',
      'no-empty': 'warn',
      'no-eval': 'error',
      'no-extra-boolean-cast': 'warn',
      'no-ex-assign': 'error',
      'no-fallthrough': 'warn',
      'no-inner-declarations': 'error',
      'no-irregular-whitespace': 'warn',
      'no-prototype-builtins': 'warn',
      'no-return-await': 'warn',
      'no-shadow': 'off', // Using TypeScript's no-shadow instead
      '@typescript-eslint/no-shadow': 'warn',
      'no-var': 'error',
      'prefer-const': 'warn',
      'prefer-rest-params': 'warn',
      'prefer-spread': 'warn',
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
      'react-hooks': eslintPluginReactHooks,
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        // For JavaScript files, we can use the same typescript resolver
        // if your paths are defined in tsconfig.json
        typescript: {},
      },
    },
    rules: {
      // Import rules
      'import/no-unresolved': 'error',
      'import/named': 'error',
      'import/default': 'error',
      'import/namespace': 'error',
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],

      // React rules
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      'react/hook-use-state': 'error',
      'react/prop-types': 'error', // Enable prop-types for JavaScript files
      'react/display-name': 'warn',
      'react/jsx-key': 'error',
      'react/jsx-no-duplicate-props': 'error',

      // React Hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // General rules
      'no-console': ['warn', {allow: ['warn', 'error', 'info']}],
      'no-debugger': 'warn',
      'no-duplicate-case': 'error',
      'no-empty': 'warn',
      'no-eval': 'error',
      'no-extra-boolean-cast': 'warn',
      'no-ex-assign': 'error',
      'no-fallthrough': 'warn',
      'no-inner-declarations': 'error',
      'no-irregular-whitespace': 'warn',
      'no-prototype-builtins': 'warn',
      'no-return-await': 'warn',
      'no-shadow': 'warn',
      'no-var': 'error',
      'prefer-const': 'warn',
      'prefer-rest-params': 'warn',
      'prefer-spread': 'warn',
    },
  },
  // Additional configuration for test files
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
    rules: {
      // Relax some rules for test files
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
    },
  },
]);
