import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import CardsScreen from './src/screens/CardsScreen';
import CreateRequestScreen from './src/screens/CreateRequestScreen';

const Stack = createStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      setIsAuthenticated(!!token);
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return null; // Could add a splash screen here
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isAuthenticated ? 'Home' : 'Login'}
        screenOptions={{
          headerStyle: {
            backgroundColor: '#4F46E5',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {!isAuthenticated ? (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ 
                title: 'ثبت نام',
                headerShown: false
              }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ 
                title: 'تیکی ایران',
                headerLeft: null
              }}
            />
            <Stack.Screen
              name="Cards"
              component={CardsScreen}
              options={{ title: 'کارت‌های من' }}
            />
            <Stack.Screen
              name="CreateRequest"
              component={CreateRequestScreen}
              options={{ title: 'درخواست پرداخت جدید' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

