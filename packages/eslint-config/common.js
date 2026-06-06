import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import simpleImportSortPlugin from 'eslint-plugin-simple-import-sort';
import unicornPlugin from 'eslint-plugin-unicorn';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';
import turboConfig from 'eslint-config-turbo/flat';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  // Global ignores
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/storybook-static/**',
      '**/coverage/**',
      '**/.*.js',
      '**/.*.mjs',
      '**/.*.cjs',
      'packages/eslint-config/common.js',
    ],
  },

  // Base JS configurations
  js.configs.recommended,

  // TypeScript configurations
  ...tseslint.configs.recommended,

  // Turborepo configurations
  ...turboConfig,

  // Custom base configuration
  {
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      'simple-import-sort': simpleImportSortPlugin,
      'unused-imports': unusedImportsPlugin,
      unicorn: unicornPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      ...prettierConfig.rules,
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'unused-imports/no-unused-imports': 'warn',
      'prettier/prettier': [
        'error',
        {
          endOfLine: 'lf',
        },
      ],
    },
  },

  // Project-based TypeScript linting (only for source and story files)
  {
    files: ['**/src/**/*.ts', '**/src/**/*.tsx', '**/stories/**/*.ts', '**/stories/**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: true,
      },
    },
  },

  // Syntactic TypeScript rules (applies to all TypeScript files)
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        {
          overrides: {
            accessors: 'explicit',
            constructors: 'no-public',
            properties: 'explicit',
            parameterProperties: 'explicit',
          },
        },
      ],
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
);
