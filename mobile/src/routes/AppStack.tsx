import { Ionicons } from '@expo/vector-icons';
import { MaterialTopTabBarProps, createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import React from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProfileProvider, useProfile } from '../providers/profileProvider';
import { theme } from '../constants/theme';
import { DashboardScreen } from '../view/dashboardScreen';
import { NextBillsScreen } from '../view/nextBillsScreen';
import { ProfileScreen } from '../view/profileScreen';
import { RunningDebtsScreen } from '../view/runningDebtsScreen';
import { SourcesScreen } from '../view/sourcesScreen';
import { AppTabParamList } from './types';

const Tab = createMaterialTopTabNavigator<AppTabParamList>();

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<keyof AppTabParamList, { focused: IoniconsName; outline: IoniconsName }> = {
  DashboardScreen: { focused: 'home', outline: 'home-outline' },
  SourcesScreen: { focused: 'card', outline: 'card-outline' },
  NextBillsScreen: { focused: 'calendar', outline: 'calendar-outline' },
  DebtsScreen: { focused: 'receipt', outline: 'receipt-outline' },
};

const TAB_LABELS: Record<keyof AppTabParamList, string> = {
  DashboardScreen: 'Início',
  SourcesScreen: 'Fontes',
  NextBillsScreen: 'Faturas',
  DebtsScreen: 'Fiados',
};

function CustomTabBar({ state, navigation }: MaterialTopTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom || 8 }]}>
      {state.routes.map((route, index) => {
        const key = route.name as keyof AppTabParamList;
        const focused = state.index === index;
        const icons = TAB_ICONS[key];
        const label = TAB_LABELS[key];
        const color = focused ? theme.colors.primary : theme.colors.textSecondary;
        const iconName = focused ? icons.focused : icons.outline;

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tabItem}
            onPress={() => navigation.navigate(route.name)}
            activeOpacity={0.7}
          >
            <Ionicons name={iconName} size={22} color={color} />
            <Text style={[styles.label, { color }]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function Tabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      tabBarPosition="bottom"
      initialRouteName="DashboardScreen"
      style={{ backgroundColor: theme.colors.background }}
      screenOptions={{ swipeEnabled: true, tabBarIndicatorStyle: { height: 0 } }}
    >
      <Tab.Screen name="DashboardScreen" component={DashboardScreen} />
      <Tab.Screen name="SourcesScreen" component={SourcesScreen} />
      <Tab.Screen name="NextBillsScreen" component={NextBillsScreen} />
      <Tab.Screen name="DebtsScreen" component={RunningDebtsScreen} />
    </Tab.Navigator>
  );
}

function AppStackInner() {
  const { slideAnim } = useProfile();

  return (
    <View style={styles.root}>
      <Tabs />
      <Animated.View
        style={[StyleSheet.absoluteFillObject, { transform: [{ translateX: slideAnim }] }]}
        pointerEvents="box-none"
      >
        <ProfileScreen />
      </Animated.View>
    </View>
  );
}

export function AppStack() {
  return (
    <ProfileProvider>
      <AppStackInner />
    </ProfileProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 2,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
  },
});
