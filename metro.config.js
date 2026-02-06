const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Configuration pour react-native-svg-transformer
// Permet d'importer les fichiers .svg comme composants React
const { transformer, resolver } = config;

config.transformer = {
  ...transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
  // Optimisations pour les performances
  minifierPath: require.resolve('metro-minify-terser'),
  minifierConfig: {
    ecma: 8,
    keep_classnames: true,
    keep_fnames: true,
    module: true,
    mangle: {
      module: true,
      keep_classnames: true,
      keep_fnames: true,
    },
  },
};

config.resolver = {
  ...resolver,
  assetExts: resolver.assetExts.filter((ext) => ext !== 'svg'),
  sourceExts: [...resolver.sourceExts, 'svg'],
};

// Optimisations pour le cache
config.cacheStores = [
  {
    get: async (key) => {
      // Cache en mémoire pour améliorer les performances
      return null;
    },
    set: async (key, value) => {
      // Pas de cache persistant pour éviter les problèmes
    },
  },
];

module.exports = config;
