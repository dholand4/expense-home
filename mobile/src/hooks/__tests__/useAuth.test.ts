import { act, renderHook } from '@testing-library/react-native';
import { authService } from '../../services/authService';
import { storage } from '../../utils/storage';

jest.mock('../../services/authService');
jest.mock('../../utils/storage');

const mockUser = { id: '1', full_name: 'Test User', email: 'test@test.com', role: 'user' as const };

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (storage.getToken as jest.Mock).mockResolvedValue(null);
  });

  it('starts unauthenticated when no token', async () => {
    const { useAuth } = await import('../useAuth');
    const { AuthProvider } = await import('../../providers/AuthProvider');
    const React = await import('react');

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => React.createElement(AuthProvider, null, children),
    });

    await act(async () => {});
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('sets user after login', async () => {
    (authService.login as jest.Mock).mockResolvedValue({ token: 'tok', user: mockUser });
    (storage.setToken as jest.Mock).mockResolvedValue(undefined);

    const { useAuth } = await import('../useAuth');
    const { AuthProvider } = await import('../../providers/AuthProvider');
    const React = await import('react');

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => React.createElement(AuthProvider, null, children),
    });

    await act(async () => {
      await result.current.login('test@test.com', '123456');
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('clears user after logout', async () => {
    (authService.login as jest.Mock).mockResolvedValue({ token: 'tok', user: mockUser });
    (storage.setToken as jest.Mock).mockResolvedValue(undefined);
    (storage.removeToken as jest.Mock).mockResolvedValue(undefined);

    const { useAuth } = await import('../useAuth');
    const { AuthProvider } = await import('../../providers/AuthProvider');
    const React = await import('react');

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => React.createElement(AuthProvider, null, children),
    });

    await act(async () => {
      await result.current.login('test@test.com', '123456');
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});
