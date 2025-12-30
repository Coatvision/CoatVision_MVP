// coatvision-app/babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module-resolver', { root: ['./'], alias: { '@': './' } }],
      'react-native-reanimated/plugin',
      // ← ikke ha 'expo-router/babel' her
    ],
  };
};
