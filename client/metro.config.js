const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

const defaultConfig = getDefaultConfig(__dirname);

// Ensure proper handling of all file types
defaultConfig.resolver.sourceExts = [
  'js', 'jsx', 'json', 'ts', 'tsx', 'cjs', 'mjs'
];

// Add additional asset types if needed
defaultConfig.resolver.assetExts = [...defaultConfig.resolver.assetExts, 'pem', 'crt'];

// Increase max workers for better performance
defaultConfig.maxWorkers = 4;

// Add support for module aliases (@ imports)
defaultConfig.resolver.extraNodeModules = {
  '@': path.resolve(__dirname),
};

module.exports = defaultConfig;