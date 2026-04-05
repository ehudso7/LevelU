import React from 'react';
import { Text } from 'react-native';
import { Tabs } from 'expo-router';
import { Colors, FontSize } from '../../src/constants';

function TabIcon({ label, active }: { label: string; active: boolean }) {
  return <Text style={{ fontSize: 24, opacity: active ? 1 : 0.5 }}>{label}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.bgCard,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 85,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarActiveTintColor: Colors.brand,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: {
          fontSize: FontSize.xs,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Today',
          tabBarIcon: ({ focused }) => <TabIcon label="⚡" active={focused} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ focused }) => <TabIcon label="📊" active={focused} />,
        }}
      />
    </Tabs>
  );
}
