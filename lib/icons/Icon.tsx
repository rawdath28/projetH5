/**
 * Composant Icon - Affiche une icône SVG personnalisable
 *
 * Usage:
 *   import { Icon } from '@/lib/icons';
 *   <Icon name="heart" size={24} color="#FF0000" />
 */

import { FC } from 'react';
import { SvgProps } from 'react-native-svg';
import { StyleProp, ViewStyle } from 'react-native';
import { IconName } from './types';
import { icons } from './icons-map';

export interface IconProps {
  /**
   * Nom de l'icône (avec autocomplétion TypeScript)
   * Ex: "heart", "arrow-right", "check"
   */
  name: IconName;

  /**
   * Taille de l'icône en pixels (appliquée à width et height)
   * @default 24
   */
  size?: number;

  /**
   * Couleur de l'icône (fill SVG)
   * Accepte toute valeur CSS valide: "#FF0000", "red", "rgb(255,0,0)"
   * @default "#1B1B1B"
   */
  color?: string;

  /**
   * Style supplémentaire appliqué au conteneur SVG
   */
  style?: StyleProp<ViewStyle>;
}

/**
 * Composant Icon
 *
 * Affiche une icône SVG avec la possibilité de personnaliser
 * la taille et la couleur.
 *
 * @example
 * // Icône basique
 * <Icon name="heart" />
 *
 * // Avec personnalisation
 * <Icon name="check" size={32} color="green" />
 *
 * // Avec style
 * <Icon name="arrow-right" size={16} style={{ marginLeft: 8 }} />
 */
export const Icon: FC<IconProps> = ({
  name,
  size = 24,
  color = '#1B1B1B',
  style,
}) => {
  const SvgIcon = icons[name];

  if (!SvgIcon) {
    console.warn(`[Icon] Icône "${name}" non trouvée`);
    return null;
  }

  return (
    <SvgIcon
      width={size}
      height={size}
      fill={color}
      style={style}
    />
  );
};
