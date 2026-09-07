import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Keyboard, Platform, View, ViewStyle } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface IKeyboardSafeScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function KeyboardSafeScreen({ children, style }: IKeyboardSafeScreenProps) {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [containerHeight, setContainerHeight] = useState(SCREEN_HEIGHT);
  const initialHeight = useRef(SCREEN_HEIGHT);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const onLayout = (e: any) => {
    const { height } = e.nativeEvent.layout;
    if (height > 0) {
      if (keyboardHeight === 0 && height > initialHeight.current * 0.7) {
        initialHeight.current = height;
      }
      setContainerHeight(height);
    }
  };

  // Se o Android já encolheu a janela (adjustResize), NÃO duplica o espaçamento!
  const isWindowShrunk = initialHeight.current - containerHeight > 80;
  const effectivePadding = isWindowShrunk ? 0 : keyboardHeight;

  return (
    <View
      style={[{ flex: 1, paddingBottom: effectivePadding }, style]}
      onLayout={onLayout}
    >
      {children}
    </View>
  );
}
