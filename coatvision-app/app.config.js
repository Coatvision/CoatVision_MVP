export default ({ config }) => {
  const requiredPlugins = ["expo-font", "expo-web-browser"];
  const existingPlugins = Array.isArray(config.plugins) ? config.plugins : [];
  const plugins = Array.from(new Set([...existingPlugins, ...requiredPlugins]));

  return {
    ...config,
    plugins,
    extra: {
      ...config.extra,
      apiUrl: process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000",
      apiKey: process.env.EXPO_PUBLIC_API_KEY || "your-default-api-key",
    },
  };
};

