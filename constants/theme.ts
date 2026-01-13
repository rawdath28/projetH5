/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */


const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

/**
 * Polices Source Sans Pro et Source Serif Pro
 * Chargées dans app/_layout.tsx
 */
export const Fonts = {
  // Source Sans Pro - Police sans-serif principale
  sans: {
    light: 'SourceSansPro_300Light',
    regular: 'SourceSansPro_400Regular',
    semiBold: 'SourceSansPro_600SemiBold',
    bold: 'SourceSansPro_700Bold',
    regularItalic: 'SourceSansPro_400Regular_Italic',
    semiBoldItalic: 'SourceSansPro_600SemiBold_Italic',
  },
  // Source Serif Pro - Police serif pour les titres ou accents
  serif: {
    light: 'SourceSerifPro_300Light',
    regular: 'SourceSerifPro_400Regular',
    semiBold: 'SourceSerifPro_600SemiBold',
    bold: 'SourceSerifPro_700Bold',
    regularItalic: 'SourceSerifPro_400Regular_Italic',
    semiBoldItalic: 'SourceSerifPro_600SemiBold_Italic',
  },
};
