export type AuthStackParamList = {
  LoginScreen: undefined;
  RegisterScreen: undefined;
  AcceptInviteScreen: { token: string };
  ForgotPasswordScreen: undefined;
  ResetPasswordScreen: { token?: string };
};

export type AppTabParamList = {
  DashboardScreen: undefined;
  SourcesScreen: undefined;
  NextBillsScreen: undefined;
  DebtsScreen: undefined;
};
