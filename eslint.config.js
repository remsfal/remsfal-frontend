import globals from 'globals';
import js from '@eslint/js';
import ts from 'typescript-eslint';
import vue from 'eslint-plugin-vue';
import stylistic from '@stylistic/eslint-plugin';

const TS_FILES = ['**/*.{ts,tsx,cts,mts,vue}'];

export default [
  // Basis
  {
    files: ['**/*.{js,jsx,cjs,mjs,ts,tsx,cts,mts,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser },
    },
  },

  // JS (Fallback)
  js.configs.recommended,

  // TS
  ...ts.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.eslint.json'],
        tsconfigRootDir: process.cwd(),
        extraFileExtensions: ['.vue'],
      },
    },
  },
  ...ts.configs.strictTypeChecked,
  ...ts.configs.stylisticTypeChecked,
//  ...typeAware,
  {
    files: TS_FILES,
    rules: {
      '@typescript-eslint/no-explicit-any': ['warn', { ignoreRestArgs: false }],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/unbound-method': 'warn',
    },
  },

  // Vue + TS
  ...vue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vue.parser,
      parserOptions: {
        parser: ts.parser,
        project: ['./tsconfig.eslint.json'],
        tsconfigRootDir: process.cwd(),
        extraFileExtensions: ['.vue'],
      },
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/block-lang': ['error', { script: { lang: 'ts' } }],
      'vue/block-order': ['error', { order: ['script[setup]', 'template', 'style[scoped]'] }],
      'vue/component-api-style': ['error', ['script-setup']],
      'vue/define-macros-order': [
        'error',
        { order: ['defineOptions', 'defineModel', 'defineProps', 'defineEmits', 'defineSlots'], defineExposeLast: true },
      ],
      'vue/no-undef-components': 'error',
      'vue/no-undef-properties': 'error',
      'vue/no-unused-refs': 'error',
    },
  },

  // Vitest & Cypress
  {
    files: ['**/*.{test,spec}.ts', '**/*.{test,spec}.tsx', 'test/**/*.{ts,tsx}'],
    languageOptions: { globals: { ...globals.vitest, ...globals.node } },
  },
  {
    files: ['cypress/**/*.{ts,tsx,js}'],
    languageOptions: { globals: { ...globals.cypress, ...globals.node } },
  },

  // Stylistic
  stylistic.configs.recommended,
  {
    rules: {
      '@stylistic/semi': ['error', 'always'],
      '@stylistic/quotes': ['error', 'single', { avoidEscape: true }],
      '@stylistic/indent': ['error', 2],
      '@stylistic/max-statements-per-line': ['error', { max: 2 }],    },
  },

  // Ignores
  { ignores: ['**/dist/**', 'node_modules/**', 'coverage/**', 'html/**', 'cypress/**'] },
];
