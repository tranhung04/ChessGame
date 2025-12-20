import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import { COLORS } from '../config/constants';

// Auth Screens
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';

// Main Screens
import HomeScreen from '../screens/Home/HomeScreen';
import GameScreen from '../screens/Game/GameScreen';
import ShopScreen from '../screens/Shop/ShopScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import LeaderboardScreen from '../screens/Leaderboard/LeaderboardScreen';
import HistoryScreen from '../screens/History/HistoryScreen';
import TransactionsScreen from '../screens/Transactions/TransactionsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Stack
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

// Main Tab Navigator
const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
        else if (route.name === 'Game') iconName = focused ? 'game-controller' : 'game-controller-outline';
        else if (route.name === 'Shop') iconName = focused ? 'cart' : 'cart-outline';
        else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.textLight,
      headerStyle: { backgroundColor: COLORS.primary },
      headerTintColor: COLORS.white,
      tabBarStyle: { backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.primary }
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Trang Chủ' }} />
    <Tab.Screen name="Game" component={GameScreen} options={{ title: 'Chơi Game' }} />
    <Tab.Screen name="Shop" component={ShopScreen} options={{ title: 'Cửa Hàng' }} />
    <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Cá Nhân' }} />
  </Tab.Navigator>
);

// App Navigator
export default function AppNavigator() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null; // Or loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen 
              name="Leaderboard" 
              component={LeaderboardScreen}
              options={{
                headerShown: true,
                title: 'Bảng Xếp Hạng',
                headerStyle: { backgroundColor: COLORS.primary },
                headerTintColor: COLORS.white,
                headerTitleStyle: { fontWeight: 'bold' }
              }}
            />
            <Stack.Screen 
              name="History" 
              component={HistoryScreen}
              options={{
                headerShown: true,
                title: 'Lịch Sử Game',
                headerStyle: { backgroundColor: COLORS.primary },
                headerTintColor: COLORS.white,
                headerTitleStyle: { fontWeight: 'bold' }
              }}
            />
            <Stack.Screen 
              name="Transactions" 
              component={TransactionsScreen}
              options={{
                headerShown: true,
                title: 'Lịch Sử Giao Dịch',
                headerStyle: { backgroundColor: COLORS.primary },
                headerTintColor: COLORS.white,
                headerTitleStyle: { fontWeight: 'bold' }
              }}
            />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

