import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import ChatScreen from '../screens/ChatScreen';
import TerminalScreen from '../screens/TerminalScreen';
import FilesScreen from '../screens/FilesScreen';
import ActionsScreen from '../screens/ActionsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { colors } from '../theme/tokens';
import { useConnectionStore } from '../stores/connection.store';

export type MainTabsParamList = {
  Chat: undefined;
  Terminal: undefined;
  Files: undefined;
  Actions: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<MainTabsParamList>();

export default function MainTabs() {
  const pendingCount = useConnectionStore((s) => s.pendingBadgeCount);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bgSurface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="message-square" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Terminal"
        component={TerminalScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="terminal" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Files"
        component={FilesScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="folder" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Actions"
        component={ActionsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="shield" size={size} color={color} />
          ),
          tabBarBadge: pendingCount > 0 ? pendingCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.error,
            fontSize: 11,
          },
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
