import js, {eslint as baseConfig} from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import eslintConfigPrettier from 'eslint-config-prettier';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';
import promisePlugin from 'eslint-plugin-promise';
import jsdocPlugin from 'eslint-plugin-jsdoc';
import globals from 'globals';

export default tseslint.config(
  // Base ESLint recommendations
  baseConfig.configs.recommended,
  // TypeScript recommended and strict rules
  ...tseslint.configs.recommended,
  ...tseslint.configs.strict,
  {
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaFeatures: {jsx: true}
      }
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      import: importPlugin,
      promise: promisePlugin,
      jsdoc: jsdocPlugin
    },
    settings: {
      'import/resolver': {typescript: true},
      react: {version: 'detect'}
    },
    rules: {
      // Documentation Rules Subtask
      'jsdoc/require-jsdoc': ['error', {
        publicOnly: true,
        require: {
          FunctionDeclaration: true,
          MethodDefinition: true,
          ClassDeclaration: true,
          TSInterfaceDeclaration: true,
          TSMethodSignature: true
        }
      }],
      'jsdoc/require-param-description': 'error',
      'jsdoc/require-returns-description': 'error',
      'jsdoc/require-param-type': 'error',
      'jsdoc/require-returns-type': 'error',

      // Type Safety Rules Subtask
      '@typescript-eslint/explicit-member-accessibility': ['error', {accessibility: 'explicit'}],
      '@typescript-eslint/explicit-function-return-type': ['error', {allowExpressions: false}],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/strict-boolean-expressions': 'error',

      // Service File Pattern Rules Subtask
      'filename-rules/match': ['error', {pattern: '^[a-z][a-zA-Z]+Service$'}],
      'import/prefer-default-export': 'off',
      'import/no-default-export': ['error', {exceptions: ['**/index.ts']}],
      'import/group-exports': 'error',
      'import/exports-last': 'error',

      // Error Handling Rules Subtask
      '@typescript-eslint/no-throw-literal': 'error',
      'no-throw-literal': 'off',
      'unicorn/error-message': 'error',
      'prefer-promise-reject-errors': 'error',

      // Import/export patterns
      'import/no-unresolved': 'error',
      'import/named': 'error',
      'import/default': 'error',
      'import/namespace': 'error',
      'import/order': ['error', {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
        alphabetize: {order: 'asc', caseInsensitive: true}
      }],
      'import/no-internal-modules': ['error', {allow: ['src/**']}],
      'import/extensions': ['error', 'ignorePackages', {js: 'never', ts: 'never', tsx: 'never'}],

      // Promise handling
      'promise/no-throw-in-callback': 'error',
      'promise/catch-or-return': ['error', {allowFinally: false}],
      'promise/always-return': 'error',
      '@typescript-eslint/await-thenable': 'error'
    }
  },

  // JavaScript rules
  js.configs.recommended,

  // React rules
  reactPlugin.configs.recommended,
  {
    rules: {
      'react/react-in-jsx-scope': 'off' // JSX Transform enabled
    }
  },

  // React Hooks rules
  {
    files: ['**/*.{jsx,tsx}'],
    plugins: {'react-hooks': reactHooksPlugin},
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn'
    }
  },

  // Generic import rules
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    plugins: {import: importPlugin},
    rules: {
      'import/no-unresolved': 'error',
      'import/named': 'error',
      'import/default': 'error',
      'import/namespace': 'error',
      'import/order': ['error', {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
        alphabetize: {order: 'asc', caseInsensitive: true}
      }]
    }
  },

  // Node.js globals in .cjs
  {
    files: ['**/*.cjs'],
    languageOptions: {globals: globals.node}
  },

  // Test-specific rules
  {
    files: ['**/*.test.{js,ts,jsx,tsx}', '**/*.spec.{js,ts,jsx,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off'
    }
  },

  // Prettier override
  eslintConfigPrettier
);
