import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { AcceptInviteScreen } from '../view/acceptInviteScreen';
import { ForgotPasswordScreen } from '../view/forgotPasswordScreen';
import { ResetPasswordScreen } from '../view/resetPasswordScreen';
import { LoginScreen } from '../view/loginScreen';
import { RegisterScreen } from '../view/registerScreen';
import { theme } from '../constants/theme';
import { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthStack() {
  return (
    <Stack.Navigator
      initialRouteName="LoginScreen"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
      <Stack.Screen name="AcceptInviteScreen" component={AcceptInviteScreen} />
      <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
}
