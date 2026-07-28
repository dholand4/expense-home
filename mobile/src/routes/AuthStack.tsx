import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';
import { AcceptInviteScreen } from '../view/acceptInviteScreen';
import { ForgotPasswordScreen } from '../view/forgotPasswordScreen';
import { ResetPasswordScreen } from '../view/resetPasswordScreen';
import { LoginScreen } from '../view/loginScreen';
import { RegisterScreen } from '../view/registerScreen';
import { theme } from '../constants/theme';
import { AuthStackParamList } from './types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const Stack = createNativeStackNavigator<AuthStackParamList>();

type LoginRegisterProps = NativeStackScreenProps<AuthStackParamList, 'LoginRegisterFlow'>;

function LoginRegisterFlow({ navigation }: LoginRegisterProps) {
  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;

  const goToRegister = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 320,
      easing: Easing.out(Easing.poly(4)),
      useNativeDriver: true,
    }).start();
  };

  const goToLogin = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_WIDTH,
      duration: 280,
      easing: Easing.in(Easing.poly(4)),
      useNativeDriver: true,
    }).start();
  };

  const goToForgotPassword = () => navigation.navigate('ForgotPasswordScreen');

  return (
    <View style={styles.root}>
      <LoginScreen onGoToRegister={goToRegister} onGoToForgotPassword={goToForgotPassword} />
      <Animated.View
        style={[StyleSheet.absoluteFillObject, { transform: [{ translateX: slideAnim }] }]}
      >
        <RegisterScreen onGoToLogin={goToLogin} />
      </Animated.View>
    </View>
  );
}

export function AuthStack() {
  return (
    <Stack.Navigator
      initialRouteName="LoginRegisterFlow"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="LoginRegisterFlow" component={LoginRegisterFlow} />
      <Stack.Screen name="AcceptInviteScreen" component={AcceptInviteScreen} />
      <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background },
});
