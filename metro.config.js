const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for .ass files
config.resolver.assetExts.push('ass');

module.exports = config;