module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', {
        // Enable the polyfill to fix the zustand import.meta issue
        unstable_transformImportMeta: true
      }]
    ],
    plugins: [
      // Add React Native specific plugins
      'react-native-reanimated/plugin',
      // Enable proper error handling
      ['@babel/plugin-transform-react-jsx-source', { development: true }],
      // Add module resolver for @ imports
      [
        'module-resolver',
        {
          root: ['.'],
          alias: {
            '@': '.',
          },
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
        }
      ]
    ]
  };
};