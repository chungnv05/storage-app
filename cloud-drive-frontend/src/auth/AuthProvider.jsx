import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import AuthContext from './AuthContext';
import keycloak from './keycloak';

function AuthProvider({ children }) {
  // Trạng thái khởi tạo Keycloak (đã xong hay chưa)
  const [isInitialized, setIsInitialized] = useState(false);
  // Trạng thái đăng nhập của người dùng
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Lưu Access Token
  const [token, setToken] = useState(null);
  // Lưu thông tin người dùng
  const [user, setUser] = useState(null);
  // Cờ ref đánh dấu để tránh khởi tạo Keycloak 2 lần (đặc biệt trong React StrictMode)
  const initializedRef = useRef(false);

  /**
   * Hàm trợ giúp: Đặt lại toàn bộ trạng thái xác thực về mặc định
   * (Được gọi khi logout, hết hạn token hoặc gặp lỗi)
   */
  const resetAuthState = useCallback(() => {
    setIsAuthenticated(false);
    setToken(null);
    setUser(null);
  }, []);

  /**
   * Chuyển đổi dữ liệu token (claims) từ Keycloak thành thông tin người dùng của ứng dụng.
   */
  const buildUser = useCallback(() => {
    const tokenParsed = keycloak.tokenParsed;
    if (!tokenParsed) return null;

    // Lấy danh sách role từ Realm
    const realmRoles = tokenParsed.realm_access?.roles || [];
    // Lấy danh sách role từ Client cụ thể trong môi trường
    const clientRoles =
      tokenParsed.resource_access?.[import.meta.env.VITE_KEYCLOAK_CLIENT_ID]
        ?.roles || [];

    return {
      username: tokenParsed.preferred_username || null,
      email: tokenParsed.email || null,
      firstName: tokenParsed.given_name || null,
      lastName: tokenParsed.family_name || null,
      // Hợp nhất và loại bỏ các role trùng lặp
      roles: [...new Set([...realmRoles, ...clientRoles])],
    };
  }, []);

  /**
   * Cập nhật trạng thái xác thực dựa trên trạng thái hiện tại của Keycloak.
   */
  const updateAuthState = useCallback(() => {
    const authenticated = Boolean(keycloak.authenticated);
    setIsAuthenticated(authenticated);

    if (authenticated) {
      setToken(keycloak.token || null);
      setUser(buildUser());
    } else {
      resetAuthState();
    }
  }, [buildUser, resetAuthState]);

  /**
   * Khởi tạo Keycloak SDK khi component được mount lần đầu.
   */
  useEffect(() => {
    // Nếu đã khởi tạo rồi thì bỏ qua
    if (initializedRef.current) return;
    initializedRef.current = true;

    const initializeKeycloak = async () => {
      try {
        const authenticated = await keycloak.init({
          onLoad: 'check-sso', // Tự động kiểm tra xem người dùng đã đăng nhập ở SSO chưa
          pkceMethod: 'S256',  // Phương thức bảo mật PKCE
          checkLoginIframe: false,
        });

        setIsAuthenticated(authenticated);
        if (authenticated) {
          setToken(keycloak.token || null);
          setUser(buildUser());
        }
      } catch (error) {
        console.error('Khởi tạo Keycloak thất bại:', error);
        resetAuthState();
      } finally {
        setIsInitialized(true);
      }
    };

    initializeKeycloak();
  }, [buildUser, resetAuthState]);

  /**
   * Chuyển hướng sang trang đăng nhập của Keycloak.
   */
  const login = useCallback(async () => {
    await keycloak.login();
  }, []);

  /**
   * Đăng xuất người dùng và xóa trạng thái xác thực ở Client.
   */
  const logout = useCallback(async () => {
    await keycloak.logout();
  }, []);

  /**
   * Làm mới Access Token.
   * Tự động gia hạn nếu token còn hạn ít hơn 30 giây.
   */
  const refreshToken = useCallback(async () => {
    if (!keycloak.authenticated) return null;

    try {
      const refreshed = await keycloak.updateToken(30);
      if (refreshed || keycloak.token) {
        setToken(keycloak.token || null);
        setUser(buildUser());
      }
      return keycloak.token || null;
    } catch (error) {
      console.error('Làm mới token Keycloak thất bại:', error);
      resetAuthState();
      return null;
    }
  }, [buildUser, resetAuthState]);

  /**
   * Đăng ký lắng nghe các sự kiện về Token/Auth từ Keycloak.
   */
  useEffect(() => {
    if (!isInitialized) return;

    // Khi token hết hạn -> Tiến hành làm mới
    keycloak.onTokenExpired = async () => {
      await refreshToken();
    };
    // Khi đăng nhập thành công
    keycloak.onAuthSuccess = updateAuthState;
    // Khi đăng xuất
    keycloak.onAuthLogout = resetAuthState;
    // Khi làm mới token thành công
    keycloak.onAuthRefreshSuccess = updateAuthState;
    // Khi làm mới token thất bại
    keycloak.onAuthRefreshError = resetAuthState;

    // Cleanup listener khi unmount hoặc re-render
    return () => {
      keycloak.onTokenExpired = undefined;
      keycloak.onAuthSuccess = undefined;
      keycloak.onAuthLogout = undefined;
      keycloak.onAuthRefreshSuccess = undefined;
      keycloak.onAuthRefreshError = undefined;
    };
  }, [isInitialized, refreshToken, updateAuthState, resetAuthState]);

  /**
   * Lịch trình kiểm tra định kỳ (mỗi 10 giây) để chủ động làm mới token nếu cần.
   */
  useEffect(() => {
    if (!isInitialized || !isAuthenticated) return;

    const interval = setInterval(() => {
      refreshToken();
    }, 10000);

    return () => clearInterval(interval);
  }, [isInitialized, isAuthenticated, refreshToken]);

  // Gói các giá trị và hàm cần cung cấp cho toàn bộ ứng dụng thông qua Context
  const value = useMemo(
    () => ({
      isInitialized,
      isAuthenticated,
      user,
      token,
      login,
      logout,
      refreshToken,
    }),
    [
      isInitialized,
      isAuthenticated,
      user,
      token,
      login,
      logout,
      refreshToken,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;