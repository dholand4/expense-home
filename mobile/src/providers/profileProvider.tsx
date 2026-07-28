import React, { createContext, useCallback, useContext, useRef } from 'react';
import { Animated, Dimensions, Easing } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface IProfileContext {
  openProfile: () => void;
  closeProfile: () => void;
  slideAnim: Animated.Value;
}

const ProfileContext = createContext<IProfileContext>({
  openProfile: () => {},
  closeProfile: () => {},
  slideAnim: new Animated.Value(SCREEN_WIDTH),
});

export function useProfile() {
  return useContext(ProfileContext);
}

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;

  const openProfile = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 320,
      easing: Easing.out(Easing.poly(4)),
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  const closeProfile = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_WIDTH,
      duration: 280,
      easing: Easing.in(Easing.poly(4)),
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  return (
    <ProfileContext.Provider value={{ openProfile, closeProfile, slideAnim }}>
      {children}
    </ProfileContext.Provider>
  );
}
