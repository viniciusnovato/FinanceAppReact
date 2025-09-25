module.exports = {
  root: true,
  extends: [
    '@react-native-community',
    'prettier'
  ],
  parser: '@babel/eslint-parser',
  parserOptions: {
    requireConfigFile: false,
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    'react-hooks/exhaustive-deps': 'warn',
    'no-unused-vars': 'error',
    'prefer-const': 'error',
    'no-console': 'warn',
    'react-native/no-inline-styles': 'warn',
    'react/prop-types': 'off', // Desabilitado para simplificar
  },
  env: {
    'react-native/react-native': true,
  },
};