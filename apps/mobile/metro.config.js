const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Bổ sung các định dạng file mà Metro có thể đọc
config.resolver.sourceExts.push('mjs');

module.exports = withNativeWind(config, { input: "./app/globals.css" });
