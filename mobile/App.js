import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, View } from 'react-native';

import AuthScreen from './screens/AuthScreen';
import DashboardScreen from './screens/DashboardScreen';
import MapScreen from './screens/MapScreen';
import GroupScreen from './screens/GroupScreen';
import SubscriptionScreen from './screens/SubscriptionScreen';
import HistoryScreen from './screens/HistoryScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Circles') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'History') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'Premium') {
            iconName = focused ? 'star' : 'star-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4c669f',
        tabBarInactiveTintColor: 'gray',
        headerShown: false
      })}
    >
      <Tab.Screen name="Circles" component={DashboardScreen} />
      <Tab.Screen name="History" component={HistoryViewWrapper} />
      <Tab.Screen name="Premium" component={SubscriptionScreen} />
    </Tab.Navigator>
  );
};

// Wrapper for History to pass params if needed, or we fetch current user history by default
const HistoryViewWrapper = ({ navigation }) => {
  // We need to pass the current user's ID to HistoryScreen
  // Since Tab screens don't easily accept params from the navigator definition,
  // we can use the AuthContext inside HistoryScreen directly, 
  // BUT HistoryScreen expects route.params.userId.
  // Let's refactor HistoryScreen slightly or wrap it here.
  const { userInfo } = useContext(AuthContext);

  // Quick fix: Remap props to match HistoryScreen expectation
  // Real fix: Update HistoryScreen to use AuthContext if no param provided.

  // Actually, let's just create a component that renders HistoryScreen with userInfo.id
  return <HistoryScreen route={{ params: { userId: userInfo ? userInfo.id : null } }} navigation={navigation} />;
};


const AppNav = () => {
  const { userToken, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {userToken === null ? (
          <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="Home" component={TabNavigator} options={{ headerShown: false }} />
            <Stack.Screen name="Map" component={MapScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Groups" component={GroupScreen} />
            {/* Subscription is also in Tabs, but can be pushed from Map too */}
            <Stack.Screen name="Subscription" component={SubscriptionScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppNav />
    </AuthProvider>
  );
}
