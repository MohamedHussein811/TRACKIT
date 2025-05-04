module.exports = function(api) {
    api.cache(true);
    return {
      presets: [
        ['babel-preset-expo', {
          // Enable the polyfill to fix the zustand import.meta issue
          unstable_transformImportMeta: true
        }]
      ],
    };
  };