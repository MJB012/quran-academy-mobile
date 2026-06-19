// Learn more: https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// socket.io-client pulls in engine.io-client, whose ESM build (`import`
// condition) re-exports "./transports/polling-fetch.js" in a way Metro can't
// resolve. Force just engine.io-client to its CommonJS build by dropping the
// "import" condition for that package only — everything else is untouched.
const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'engine.io-client' || moduleName.startsWith('engine.io-client/')) {
    return context.resolveRequest(
      { ...context, unstable_conditionNames: ['require', 'react-native', 'browser'] },
      moduleName,
      platform,
    );
  }
  return (defaultResolveRequest ?? context.resolveRequest)(context, moduleName, platform);
};

module.exports = config;
