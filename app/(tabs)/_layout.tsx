import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';

import { HapticTab } from '../../components/haptic-tab';
import { GradientIcon } from '../../components/gradient-icon';
import { Icon } from '../../lib/icons';

// Couleurs de la tab bar selon le design Figma
const TAB_BAR_COLORS = {
  background: '#FFFFFF',
  iconDefault: '#687076',
  iconSelected: '#1B1B1B',
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: TAB_BAR_COLORS.iconSelected,
        tabBarInactiveTintColor: TAB_BAR_COLORS.iconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabBarItem,
        tabBarIconStyle: styles.tabBarIcon,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <GradientIcon name="vector-pen-fill" size={24} />
            ) : (
              <Icon name="vector-pen" size={24} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="exercise"
        options={{
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <GradientIcon name="lightbulb-fill" size={24} />
            ) : (
              <Icon name="lightbulb" size={24} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="record"
        options={{
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <GradientIcon name="mic-fill" size={24} />
            ) : (
              <Icon name="mic" size={24} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <GradientIcon name="bar-chart-fill" size={24} />
            ) : (
              <Icon name="bar-chart" size={24} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <GradientIcon name="person-fill" size={24} />
            ) : (
              <Icon name="person" size={24} color={color} />
            ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: TAB_BAR_COLORS.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: 0,
    // Hauteur totale : 56px (contenu) + 22px (safe area iOS) = 78px
    height: 80,
    paddingHorizontal: 16,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  tabBarItem: {
    // Pas de padding ici - le bouton cliquable gère tout
    flex: 1,
    padding: 0,
    margin: 0,
  },
  tabBarIcon: {
    // Reset les marges par défaut de l'icône
    marginTop: 0,
    marginBottom: 0,
  },
});
