import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Calendar, User, HeartPulse } from 'lucide-react-native';
import { View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#006241', // Starbucks Green
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          // Tăng độ cao linh hoạt dựa trên insets.bottom
          height: Platform.OS === 'ios' ? 88 + insets.bottom : 75 + insets.bottom,
          paddingBottom: Platform.OS === 'ios' ? insets.bottom + 10 : insets.bottom + 15,
          paddingTop: 12,
          borderTopLeftRadius: 35,
          borderTopRightRadius: 35,
          position: 'absolute',
          borderWidth: 1,
          borderColor: '#F3F4F6',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color, size }) => <Home size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: 'Lịch hẹn',
          tabBarIcon: ({ color, size }) => <Calendar size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="health"
        options={{
          title: 'Sức khỏe',
          tabBarIcon: ({ color, size }) => <HeartPulse size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Hồ sơ',
          tabBarIcon: ({ color, size }) => <User size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
