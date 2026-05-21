import {
  userReducer,
  loginUser,
  registerUser,
  getUser,
  logoutUser,
  updateUser,
  authChecked
} from './userSlice';
import { TUser } from '../../utils/types';
import * as cookie from '../../utils/cookie';

jest.mock('../../utils/cookie');

const initialState = {
  isAuthChecked: false,
  isAuthenticated: false,
  data: null,
  loginUserError: null,
  loginUserRequest: false,
  registerUserError: null,
  registerUserRequest: false,
  logoutUserError: null,
  logoutUserRequest: false,
  updateUserError: null,
  updateUserRequest: false
};

const mockUser: TUser = {
  email: 'test@test.com',
  name: 'Тестовый пользователь Аркадий Семёнович Укупник'
};

const mockLoginData = { email: mockUser.email, password: '123456' };

const mockRegisterData = {
  email: mockUser.email,
  name: mockUser.name,
  password: '123456'
};

const mockAuthResponse = {
  success: true,
  user: mockUser,
  accessToken: 'access-token',
  refreshToken: 'refresh-token'
};

const mockUserResponse = {
  success: true,
  user: mockUser
};

describe('Проверка слайса userSlice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('loginUser', () => {
    test('Проверка pending: loginUserRequest = true', () => {
      const result = userReducer(
        initialState,
        loginUser.pending('requestId', mockLoginData)
      );

      expect(result.loginUserRequest).toBe(true);
      expect(result.loginUserError).toBeNull();
    });

    test('Проверка fulfilled: пользователь в сторе, токены сохранены', () => {
      const loadingState = { ...initialState, loginUserRequest: true };

      const result = userReducer(
        loadingState,
        loginUser.fulfilled(mockAuthResponse, 'requestId', mockLoginData)
      );

      expect(result.loginUserRequest).toBe(false);
      expect(result.isAuthenticated).toBe(true);
      expect(result.isAuthChecked).toBe(true);
      expect(result.data).toEqual(mockUser);
      expect(cookie.setCookie).toHaveBeenCalledWith(
        'accessToken',
        mockAuthResponse.accessToken
      );
      expect(localStorage.getItem('refreshToken')).toBe(
        mockAuthResponse.refreshToken
      );
    });

    test('Проверка rejected: ошибка в сторе', () => {
      const loadingState = { ...initialState, loginUserRequest: true };
      const errorMessage = 'KERNEL_USER_ARKADY_UKUPNIK_ERROR';

      const result = userReducer(
        loadingState,
        loginUser.rejected(new Error(errorMessage), 'requestId', mockLoginData)
      );

      expect(result.loginUserRequest).toBe(false);
      expect(result.loginUserError).toBe(errorMessage);
      expect(result.isAuthChecked).toBe(true);
      expect(result.isAuthenticated).toBe(false);
    });
  });

  describe('registerUser', () => {
    test('Проверка pending: registerUserRequest = true', () => {
      const result = userReducer(
        initialState,
        registerUser.pending('requestId', mockRegisterData)
      );

      expect(result.registerUserRequest).toBe(true);
      expect(result.registerUserError).toBeNull();
    });

    test('Проверка fulfilled: пользователь зарегистрирован', () => {
      const loadingState = { ...initialState, registerUserRequest: true };

      const result = userReducer(
        loadingState,
        registerUser.fulfilled(mockAuthResponse, 'requestId', mockRegisterData)
      );

      expect(result.registerUserRequest).toBe(false);
      expect(result.isAuthenticated).toBe(true);
      expect(result.isAuthChecked).toBe(true);
      expect(result.data).toEqual(mockUser);
    });

    test('Проверка rejected: ошибка регистрации', () => {
      const loadingState = { ...initialState, registerUserRequest: true };
      const errorMessage = 'KERNEL_USER_REGISTRATION_ERROR';

      const result = userReducer(
        loadingState,
        registerUser.rejected(
          new Error(errorMessage),
          'requestId',
          mockRegisterData
        )
      );

      expect(result.registerUserRequest).toBe(false);
      expect(result.registerUserError).toBe(errorMessage);
      expect(result.isAuthChecked).toBe(true);
    });
  });

  describe('getUser', () => {
    test('Проверка fulfilled: данные пользователя в сторе', () => {
      const result = userReducer(
        initialState,
        getUser.fulfilled(mockUserResponse, 'requestId')
      );

      expect(result.data).toEqual(mockUser);
      expect(result.isAuthenticated).toBe(true);
      expect(result.isAuthChecked).toBe(true);
    });

    test('Проверка rejected: пользователь не авторизован', () => {
      const result = userReducer(
        { ...initialState, isAuthenticated: true },
        getUser.rejected(new Error('Unauthorized'), 'requestId')
      );

      expect(result.isAuthenticated).toBe(false);
      expect(result.isAuthChecked).toBe(true);
    });
  });

  describe('logoutUser', () => {
    test('Проверка pending: logoutUserRequest = true', () => {
      const result = userReducer(
        initialState,
        logoutUser.pending('requestId')
      );

      expect(result.logoutUserRequest).toBe(true);
      expect(result.logoutUserError).toBeNull();
    });

    test('Проверка fulfilled: сессия сброшена', () => {
      const loggedInState = {
        ...initialState,
        isAuthenticated: true,
        data: mockUser,
        logoutUserRequest: true
      };
      localStorage.setItem('refreshToken', 'refresh-token');

      const result = userReducer(
        loggedInState,
        logoutUser.fulfilled({ success: true }, 'requestId')
      );

      expect(result.logoutUserRequest).toBe(false);
      expect(result.isAuthenticated).toBe(false);
      expect(result.data).toBeNull();
      expect(cookie.deleteCookie).toHaveBeenCalledWith('accessToken');
      expect(localStorage.getItem('refreshToken')).toBeNull();
    });

    test('Проверка rejected: ошибка выхода', () => {
      const loadingState = { ...initialState, logoutUserRequest: true };
      const errorMessage = 'KERNEL_LOGOUT_ERROR!!!!!!';

      const result = userReducer(
        loadingState,
        logoutUser.rejected(new Error(errorMessage), 'requestId')
      );

      expect(result.logoutUserRequest).toBe(false);
      expect(result.logoutUserError).toBe(errorMessage);
    });
  });

  describe('updateUser', () => {
    const updateData = { name: 'Новое имя' };

    test('Проверка pending: updateUserRequest = true', () => {
      const result = userReducer(
        initialState,
        updateUser.pending('requestId', updateData)
      );

      expect(result.updateUserRequest).toBe(true);
      expect(result.updateUserError).toBeNull();
    });

    test('Проверка fulfilled: данные профиля обновлены', () => {
      const updatedUser = { ...mockUser, name: 'Новое имя' };
      const loadingState = { ...initialState, updateUserRequest: true };

      const result = userReducer(
        loadingState,
        updateUser.fulfilled(
          { success: true, user: updatedUser },
          'requestId',
          updateData
        )
      );

      expect(result.updateUserRequest).toBe(false);
      expect(result.updateUserError).toBeNull();
      expect(result.data).toEqual(updatedUser);
    });

    test('Проверка rejected: ошибка обновления', () => {
      const loadingState = { ...initialState, updateUserRequest: true };
      const errorMessage = 'KERNEL_PROFILE_UPDATE_ERROR~';

      const result = userReducer(
        loadingState,
        updateUser.rejected(new Error(errorMessage), 'requestId', updateData)
      );

      expect(result.updateUserRequest).toBe(false);
      expect(result.updateUserError).toBe(errorMessage);
    });
  });

  test('Проверка authChecked: isAuthChecked = true', () => {
    const result = userReducer(initialState, authChecked());

    expect(result.isAuthChecked).toBe(true);
  });
});
