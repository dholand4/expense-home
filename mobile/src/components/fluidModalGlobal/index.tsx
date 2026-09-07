import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
  Dimensions,
  Easing,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from 'styled-components/native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface IFluidModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxHeight?: number | string;
  showDragHandle?: boolean;
}

export function FluidModalGlobal({
  visible,
  onClose,
  title,
  subtitle,
  children,
  maxHeight = '92%',
  showDragHandle = true,
}: IFluidModalProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [shouldRender, setShouldRender] = useState(visible);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [containerHeight, setContainerHeight] = useState(SCREEN_HEIGHT);
  const initialContainerHeight = useRef(SCREEN_HEIGHT);

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const isClosingRef = useRef(false);

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

  const onContainerLayout = (e: any) => {
    const { height } = e.nativeEvent.layout;
    if (height > 0) {
      if (keyboardHeight === 0 && height > initialContainerHeight.current * 0.7) {
        initialContainerHeight.current = height;
      }
      setContainerHeight(height);
    }
  };

  useEffect(() => {
    if (visible) {
      isClosingRef.current = false;
      setShouldRender(true);

      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          stiffness: 240,
          damping: 26,
          mass: 0.8,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (shouldRender && !isClosingRef.current) {
      handleCloseAnimation();
    }
  }, [visible]);

  useEffect(() => {
    if (!shouldRender) return;

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (keyboardHeight > 0) {
        Keyboard.dismiss();
        return true;
      }
      handleCloseAnimation();
      return true;
    });

    return () => backHandler.remove();
  }, [shouldRender, keyboardHeight]);

  const handleCloseAnimation = () => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    Keyboard.dismiss();

    Animated.parallel([
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 180,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 200,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShouldRender(false);
      setKeyboardHeight(0);
      isClosingRef.current = false;
      onClose();
    });
  };

  const handleBackdropPress = () => {
    if (keyboardHeight > 0) {
      Keyboard.dismiss();
    } else {
      handleCloseAnimation();
    }
  };

  if (!shouldRender) return null;

  // If the window already shrunk by Android's native adjustResize, do not double-pad
  const isWindowShrunk = initialContainerHeight.current - containerHeight > 80;
  const effectivePaddingBottom = isWindowShrunk ? 0 : keyboardHeight;
  const availableHeight = containerHeight - effectivePaddingBottom;
  const computedMaxHeight = Math.max(220, availableHeight - insets.top - 12);

  return (
    <Modal
      visible={shouldRender}
      transparent
      animationType="none"
      onRequestClose={handleCloseAnimation}
    >
      <View
        style={[
          styles.container,
          { paddingBottom: effectivePaddingBottom },
        ]}
        onLayout={onContainerLayout}
      >
        {/* Animated backdrop */}
        <Animated.View
          style={[
            styles.backdrop,
            { opacity: backdropAnim },
          ]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={handleBackdropPress} />
        </Animated.View>

        {/* Animated sheet */}
        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              maxHeight: computedMaxHeight,
              paddingBottom: Math.max(insets.bottom, 16),
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {showDragHandle && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => Keyboard.dismiss()}
              style={styles.dragHandleWrapper}
            >
              <View style={[styles.dragHandle, { backgroundColor: theme.colors.border }]} />
            </TouchableOpacity>
          )}

          {title ? (
            <View style={styles.header}>
              <View style={styles.titleArea}>
                <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
                {subtitle ? (
                  <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                    {subtitle}
                  </Text>
                ) : null}
              </View>

              <TouchableOpacity
                onPress={handleCloseAnimation}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                style={[styles.closeButton, { backgroundColor: theme.colors.surfaceLight }]}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={18} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
          ) : null}

          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000B3',
  },
  sheet: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 16,
  },
  dragHandleWrapper: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  dragHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  titleArea: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
