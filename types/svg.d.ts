/**
 * Déclaration TypeScript pour les imports de fichiers SVG
 * Permet à TypeScript de comprendre les imports comme :
 * import HeartIcon from '@/assets/icon/heart.svg';
 */
declare module '*.svg' {
  import React from 'react';
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}
