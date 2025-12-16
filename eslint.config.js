import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  { ignores: ['dist', 'mobile/**'] },
  // Spread the recommended JS config into flat array instead of extends
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // During active development, don't fail the build on unused imports/vars
      // Core no-unused-vars doesn't understand JSX without eslint-plugin-react's jsx-uses-vars,
      // so we disable it to avoid false-positives and keep iteration fast.
      'no-unused-vars': 'off',
      // Allow temporarily empty blocks (we still surface as warnings for visibility)
      'no-empty': ['warn', { allowEmptyCatch: true }],
    },
  }
];