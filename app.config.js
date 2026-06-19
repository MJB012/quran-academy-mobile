// Expo loads .env at evaluation time (Node side), so process.env.BACKEND_URL
// is available here even though it is not an EXPO_PUBLIC_ variable. We forward
// it into `extra` so the running app can read it via expo-constants.
export default ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    backendUrl:
      process.env.BACKEND_URL ??
      process.env.EXPO_PUBLIC_API_URL ??
      config.extra?.backendUrl ??
      null,
  },
});
