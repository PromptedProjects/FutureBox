import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../stores/auth.store';
import PairScreen from '../screens/PairScreen';
import MainTabs from './MainTabs';

export type RootStackParamList = {
  Pair: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={MainTabs} />
      ) : (
        <Stack.Screen
          name="Pair"
          component={PairScreen}
          options={{ animationTypeForReplace: 'pop' }}
        />
      )}
    </Stack.Navigator>
  );
}
