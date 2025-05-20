const { getDefaultConfig } = require('@expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

// Ensure proper handling of all file types
defaultConfig.resolver.sourceExts = [
  'js', 'jsx', 'json', 'ts', 'tsx', 'cjs', 'mjs'
];

// Add additional asset types if needed
defaultConfig.resolver.assetExts = [...defaultConfig.resolver.assetExts, 'pem', 'crt'];

// Increase max workers for better performance
defaultConfig.maxWorkers = 4;

module.exports = defaultConfig; 