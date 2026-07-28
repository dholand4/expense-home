import { IUser } from '../@types/models';
import { http } from './httpClient';

interface ILoginResponse {
  token: string;
  user: IUser;
}

interface ILoginBody {
  email: string;
  password: string;
}

interface IRegisterBody {
  full_name: string;
  email: string;
  password: string;
}

interface IAcceptInviteBody {
  token: string;
  password: string;
}

export const authService = {
  login: (data: ILoginBody) => http.post<ILoginResponse>('/auth/login', data),
  register: (data: IRegisterBody) => http.post<ILoginResponse>('/auth/register', data),
  me: () => http.get<{ user: IUser }>('/auth/me').then((res) => res.user),
  acceptInvite: (data: IAcceptInviteBody) =>
    http.post<ILoginResponse>('/auth/accept-invite', data),
  inviteUser: (email: string) => http.post<void>('/auth/invite', { email }),
  forgotPassword: (email: string) =>
    http.post<void>('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) =>
    http.post<{ message: string }>('/auth/reset-password', { token, password }),
};
