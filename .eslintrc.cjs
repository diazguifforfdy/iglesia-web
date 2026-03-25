module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended'
  ],
  settings: {
    react: {
      version: 'detect'
    }
  },
  env: {
    browser: true,
    es2021: true
  },
  rules: {
    // React 17+ with the new JSX transform doesn't require React to be in scope
    'react/react-in-jsx-scope': 'off',
    // Disable prop-types since we use TypeScript for type checking
    'react/prop-types': 'off'
  }
}
