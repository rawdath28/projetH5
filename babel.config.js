module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Inline environment variables from .env file at build time
      [
        'babel-plugin-inline-dotenv',
        {
          path: '.env',
        },
      ],
    ],
  };
};
