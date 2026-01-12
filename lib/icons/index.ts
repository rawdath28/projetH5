/**
 * Librairie d'icônes SVG
 * 
 * Usage:
 *   import { Icon } from '@/lib/icons';
 *   <Icon name="heart" size={24} color="#FF0000" />
 * 
 * Ou pour accéder directement au mapping :
 *   import { icons, IconName } from '@/lib/icons';
 */

// Export du composant principal
export { Icon } from './Icon';
export type { IconProps } from './Icon';

// Export du mapping et des types
export { icons } from './icons-map';
export type { IconName } from './types';
