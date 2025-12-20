import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { configureGoogleSignIn } from './src/services/googleAuth';
import { GOOGLE_WEB_CLIENT_ID } from './src/config/constants';

export default function App() {
  useEffect(() => {
    // Configure Google Sign-In when app starts
    configureGoogleSignIn(GOOGLE_WEB_CLIENT_ID);
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppNavigator />
        <StatusBar style="light" />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
