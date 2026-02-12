import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NavigatorScreenParams } from '@react-navigation/native';
import { useAuthStore } from '../stores/auth.store';
import PairScreen from '../screens/PairScreen';
import LauncherHome from '../screens/LauncherHome';
import SpaceScreen from '../screens/SpaceScreen';
import SpaceChatScreen from '../screens/SpaceChatScreen';
import CreateSpaceScreen from '../screens/CreateSpaceScreen';
import EditSpaceScreen from '../screens/EditSpaceScreen';
import MainTabs, { type MainTabsParamList } from './MainTabs';

export type AuthenticatedStackParamList = {
  Launcher: undefined;
  Space: { spaceId: string };
  SpaceChat: { spaceId: string; entryChoice: 'go' | 'browse' | 'skip' };
  CreateSpace: undefined;
  EditSpace: { spaceId: string };
  Tabs: NavigatorScreenParams<MainTabsParamList>;
};

export type RootStackParamList = {
  Pair: undefined;
  Authenticated: NavigatorScreenParams<AuthenticatedStackParamList>;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthenticatedStackParamList>();

function AuthenticatedNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Launcher" component={LauncherHome} />
      <AuthStack.Screen name="Space" component={SpaceScreen} />
      <AuthStack.Screen name="SpaceChat" component={SpaceChatScreen} />
      <AuthStack.Screen name="CreateSpace" component={CreateSpaceScreen} />
      <AuthStack.Screen name="EditSpace" component={EditSpaceScreen} />
      <AuthStack.Screen name="Tabs" component={MainTabs} />
    </AuthStack.Navigator>
  );
}

export default function RootNavigator() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <RootStack.Screen name="Authenticated" component={AuthenticatedNavigator} />
      ) : (
        <RootStack.Screen
          name="Pair"
          component={PairScreen}
          options={{ animationTypeForReplace: 'pop' }}
        />
      )}
    </RootStack.Navigator>
  );
}
