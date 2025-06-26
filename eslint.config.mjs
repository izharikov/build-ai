import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    // Global ignores
    ignores: ['node_modules/', '**/dist/', '**/build/'],
  },
  ...tseslint.configs.recommended, // Includes eslint:recommended and plugin:@typescript-eslint/recommended
  eslintPluginPrettierRecommended, // Includes plugin:prettier/recommended and config-prettier
  {
    // Custom rules
    rules: {
      'prettier/prettier': 'error',
    },
  },
);
