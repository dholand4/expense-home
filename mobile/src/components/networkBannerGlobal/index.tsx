import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { BannerContainer, BannerText } from './style';

export function networkBannerGlobal() {
  const { isConnected, isInternetReachable } = useNetworkStatus();
  const offline = !isConnected || !isInternetReachable;
  const translateY = useRef(new Animated.Value(-60)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: offline ? 0 : -60,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [offline, translateY]);

  return (
    <Animated.View style={{ transform: [{ translateY }] }}>
      <BannerContainer>
        <Ionicons name="cloud-offline-outline" size={14} color="#fff" />
        <BannerText>Sem conexão com a internet</BannerText>
      </BannerContainer>
    </Animated.View>
  );
}
