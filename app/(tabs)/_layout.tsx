//Navigation layout for the app's bottom tabs, defining the main sections: Home, Friends, Account, and Billing, it turns blue for what tab is active. 
// Also includes logic for redirecting users based on authentication state, ensuring only logged-in users can access the main app features.
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import Octicons from '@expo/vector-icons/Octicons';
import { Tabs } from 'expo-router';
import React from 'react';

// TabLayout Component - This file sets up the bottom navigation bar for the app.
export default function TabLayout() {

  return (
    <Tabs
      screenOptions={{
        // Uses the main theme color for the active tab
        tabBarActiveTintColor: Colors['light'].tint,
        // Hides the top header to give us more screen space
        headerShown: false,
        // Provides a small vibration feel when tapping tabs
        tabBarButton: HapticTab,
        // Sets the background color of the bottom bar
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
        }
      }}>
        
      {/* Home Tab: The main dashboard (index.tsx) */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />

      {/* Friends Tab: Managing contacts and invites (friends.tsx) */}
      <Tabs.Screen
        name="friends"
        options={{ 
          title: 'Friends',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.2.fill" color={color} />,
        }}
      />

      {/* Account Tab: User profile and settings (account.tsx) */}
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
        }}
      />

      {/* Billing Tab: Payment and history (billing.tsx) */}
      <Tabs.Screen
        name="billing" 
        options={{
          title: 'Billing',
          tabBarIcon: ({ color }) => (
            <Octicons name="credit-card" size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

