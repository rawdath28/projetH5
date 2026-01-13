import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { Icon } from '../lib/icons';

interface GradientIconProps {
  name: string;
  size: number;
}

export function GradientIcon({ name, size }: GradientIconProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <MaskedView
        style={StyleSheet.absoluteFill}
        maskElement={
          <View style={[styles.iconContainer, { width: size, height: size }]}>
            <Icon name={name} size={size} color="#000000" />
          </View>
        }>
        <LinearGradient
          colors={['#027A54', '#027786']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </MaskedView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
