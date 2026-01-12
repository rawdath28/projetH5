import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '../../components/haptic-tab';
import { IconSymbol } from '../../components/ui/icon-symbol';
import { Colors } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: false,  // Ajouté ici
      }}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="pencil.line" color={color} />,
        }}
      />
      <Tabs.Screen
        name="exercise"
        options={{
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="lightbulb.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="record"
        options={{
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="mic.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.line.uptrend.xyaxis" color={color} />,
        }}
      />
      <Tabs.Screen
        name="session"
        options={{
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="list.triangle" color={color} />,
        }}
      />
    </Tabs>
  );
}
