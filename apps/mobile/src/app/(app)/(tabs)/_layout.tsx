import { Tabs } from 'expo-router'
import {
  House,
  CalendarClock,
  MessageCircle,
  User2,
} from 'lucide-react-native'

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} initialRouteName='explore'>
      <Tabs.Screen
        name='explore'
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size }) => <House color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name='bookings/index'
        options={{
          title: 'Bookings',
          tabBarIcon: ({ color, size }) => (
            <CalendarClock color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name='messages/index'
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, size }) => (
            <MessageCircle color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name='profile'
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User2 color={color} size={size} />,
        }}
      />
      {/* Hide routes that shouldn't be tabs */}
      <Tabs.Screen
        name='index'
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name='bookings/[id]'
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name='messages/[id]'
        options={{
          href: null,
        }}
      />
    </Tabs>
  )
}
