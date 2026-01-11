/**
 * Unit-E Healthcare Mobile App
 * Professional healthcare management app with AI-powered medical consultation
 */

import React, {useEffect, useState} from 'react';
import {StatusBar, LogBox} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FlashMessage from 'react-native-flash-message';
import Icon from 'react-native-vector-icons/MaterialIcons';
import SplashScreen from 'react-native-splash-screen';

// Screens
import LoginScreen from './screens/Auth/LoginScreen';
import RegisterScreen from './screens/Auth/RegisterScreen';
import DashboardScreen from './screens/Dashboard/DashboardScreen';
import PatientsListScreen from './screens/Patients/PatientsListScreen';
import PatientDetailScreen from './screens/Patients/PatientDetailScreen';
import AddPatientScreen from './screens/Patients/AddPatientScreen';
import WardRoundsScreen from './screens/WardRounds/WardRoundsScreen';
import RoundDetailScreen from './screens/WardRounds/RoundDetailScreen';
import AIConsultationScreen from './screens/AI/AIConsultationScreen';
import LabScanScreen from './screens/AI/LabScanScreen';
import SettingsScreen from './screens/Settings/SettingsScreen';
import ProfileScreen from './screens/Profile/ProfileScreen';

// Context
import {AuthProvider, useAuth} from './context/AuthContext';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator for authenticated users
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = 'dashboard';
          } else if (route.name === 'Patients') {
            iconName = 'people';
          } else if (route.name === 'WardRounds') {
            iconName = 'assignment';
          } else if (route.name === 'AI') {
            iconName = 'psychology';
          } else if (route.name === 'Settings') {
            iconName = 'settings';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#15803d',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          paddingBottom: 5,
          height: 60,
        },
        headerStyle: {
          backgroundColor: '#15803d',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}>
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{title: 'Dashboard'}}
      />
      <Tab.Screen
        name="Patients"
        component={PatientsListScreen}
        options={{title: 'Patients'}}
      />
      <Tab.Screen
        name="WardRounds"
        component={WardRoundsScreen}
        options={{title: 'Ward Rounds'}}
      />
      <Tab.Screen
        name="AI"
        component={AIConsultationScreen}
        options={{title: 'AI Consultant'}}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{title: 'Settings'}}
      />
    </Tab.Navigator>
  );
};

// Main App Navigator
const AppNavigator = () => {
  const {isAuthenticated, loading} = useAuth();

  useEffect(() => {
    if (!loading) {
      SplashScreen.hide();
    }
  }, [loading]);

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#15803d',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}>
        {!isAuthenticated ? (
          // Auth Stack
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{title: 'Create Account'}}
            />
          </>
        ) : (
          // Main App Stack
          <>
            <Stack.Screen
              name="MainTabs"
              component={MainTabs}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="PatientDetail"
              component={PatientDetailScreen}
              options={{title: 'Patient Details'}}
            />
            <Stack.Screen
              name="AddPatient"
              component={AddPatientScreen}
              options={{title: 'Add Patient'}}
            />
            <Stack.Screen
              name="RoundDetail"
              component={RoundDetailScreen}
              options={{title: 'Round Details'}}
            />
            <Stack.Screen
              name="LabScan"
              component={LabScanScreen}
              options={{title: 'Scan Lab Report'}}
            />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{title: 'My Profile'}}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <StatusBar barStyle="light-content" backgroundColor="#15803d" />
      <AppNavigator />
      <FlashMessage position="top" />
    </AuthProvider>
  );
};

export default App;
