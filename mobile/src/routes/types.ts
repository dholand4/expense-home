export type AuthStackParamList = {
  LoginRegisterFlow: undefined;
  AcceptInviteScreen: { token: string };
  ForgotPasswordScreen: undefined;
  ResetPasswordScreen: { token?: string };
};

export type AppTabParamList = {
  DashboardScreen: undefined;
  SourcesScreen: undefined;
  ExpensesScreen: undefined;
  NextBillsScreen: undefined;
  DebtsScreen: undefined;
};
