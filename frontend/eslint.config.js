import typescriptEslintParser from '@typescript-eslint/parser';
import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin';
import {defineFlatConfig} from 'eslint-define-config';
import eslintPluginImport from 'eslint-plugin-import';
import eslintPluginReact from 'eslint-plugin-react';
import eslintPluginReactHooks from 'eslint-plugin-react-hooks';
import eslintPluginJsdoc from 'eslint-plugin-jsdoc';

export default defineFlatConfig([
  {
    files: [
      'vite.config.js',
      'vite.config.ts',
      'vitest.config.js',
      'vitest.config.ts',
      'playwright.config.js',
      'playwright.config.ts',
    ],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
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
      jsdoc: eslintPluginJsdoc,
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
    rules: {
      // --- TypeScript Services Standardization Initiative ---
      // Enforce JSDoc/TSDoc for all public classes and methods in services
      // '@typescript-eslint/require-jsdoc' rule removed: not supported in current plugin version.
      // Consider using eslint-plugin-jsdoc or TSDoc for documentation enforcement.
      // Enforce explicit return types for all exported functions (public API)
      '@typescript-eslint/explicit-module-boundary-types': [
        'error',
        {
          allowArgumentsExplicitlyTypedAsAny: false,
          allowedNames: [],
        },
      ],
      // Enforce async functions for service methods (consistent API)
      '@typescript-eslint/promise-function-async': [
        'error',
        {
          allowedPromiseNames: ['Promise'],
          checkArrowFunctions: true,
          checkFunctionDeclarations: true,
          checkFunctionExpressions: true,
          checkMethodDeclarations: true,
        },
      ],
      // Enforce service file/folder naming convention (e.g., *Service.ts)
      // Requires eslint-plugin-filenames installed and configured
      // 'filenames/match-regex' rule removed: requires eslint-plugin-filenames, which is not installed.
      // Consider adding the plugin and restoring this rule if filename enforcement is required.

      // Import rules
      'import/no-unresolved': 'error',
      'import/named': 'error',
      'import/default': 'error',
      'import/namespace': 'error',
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
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
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-empty-interface': 'warn',
      '@typescript-eslint/no-empty-function': 'warn',
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      '@typescript-eslint/no-shadow': 'warn',

      // General rules
      'no-console': ['warn', {allow: ['warn', 'error', 'info']}],
      'no-debugger': 'warn',
      'no-duplicate-case': 'error',
      'no-empty': 'warn',
      'no-eval': 'error',
      'no-shadow': 'off',
      'no-var': 'error',
      'prefer-const': 'warn',
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
      'react/prop-types': 'error',
      'react/display-name': 'warn',
      'react/jsx-key': 'error',
      'react/jsx-no-duplicate-props': 'error',

      // React Hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // General rules
      'no-console': ['warn', {allow: ['warn', 'error', 'info']}],
      'no-debugger': 'warn',
      'no-shadow': 'warn',
      'no-var': 'error',
      'prefer-const': 'warn',
    },
  },
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
    },
  },
  // Enforce JSDoc for all public classes and methods in service modules
  {
    files: ['src/services/**/*.ts', 'src/services/**/*.tsx'],
    plugins: {
      jsdoc: eslintPluginJsdoc,
    },
    rules: {
      'jsdoc/require-jsdoc': [
        'warn',
        {
          require: {
            ClassDeclaration: true,
            MethodDefinition: true,
            FunctionDeclaration: true,
            ArrowFunctionExpression: false,
            FunctionExpression: false,
          },
          contexts: [
            'ClassDeclaration',
            'MethodDefinition',
            'FunctionDeclaration',
          ],
        },
      ],
      'jsdoc/require-description': 'warn',
      'jsdoc/require-param': 'warn',
      'jsdoc/require-returns': 'warn',
      'jsdoc/check-tag-names': 'warn',
      'jsdoc/check-types': 'warn',
    },
  },
]);
