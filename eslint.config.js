import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'no-dupe-keys': 'error',
      'no-unused-vars': 'off',
      'no-undef': 'off',
    },
  },
  {
    ignores: ['**/dist/**', '**/node_modules/**'],
  },
];
