import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import AuthModal from './AuthModal';
import { getAuthErrorMessage } from '../auth/authError';
import { useAuth } from '../auth/useAuth';

export default function Header({ onLoginSuccess, onAuthModalClose }) {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, signOut } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSignOutConfirmOpen, setIsSignOutConfirmOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [authError, setAuthError] = useState('');
  const signOutAreaRef = useRef(null);
  const isPasswordRecovery = searchParams.get('flow') === 'reset-password';
  const isLoginRequested = searchParams.get('auth') === 'login';
  const shouldShowAuthModal = isAuthModalOpen || isPasswordRecovery || isLoginRequested;
  const userName = user?.user_metadata?.full_name
    || user?.user_metadata?.name
    || user?.email?.split('@')[0]
    || 'Người dùng';
  const userInitials = userName
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part[0])
    .join('')
    .toLocaleUpperCase('vi-VN');

  async function handleSignOut() {
    setAuthError('');
    setIsSigningOut(true);
    try {
      await signOut();
      setIsSignOutConfirmOpen(false);
    } catch (error) {
      setAuthError(getAuthErrorMessage(error, 'Đăng xuất không thành công. Vui lòng thử lại.'));
    } finally {
      setIsSigningOut(false);
    }
  }

  useEffect(() => {
    if (!isSignOutConfirmOpen) return undefined;

    function closeOnEscape(event) {
      if (event.key === 'Escape' && !isSigningOut) setIsSignOutConfirmOpen(false);
    }

    function closeOnOutsideClick(event) {
      if (!isSigningOut && !signOutAreaRef.current?.contains(event.target)) {
        setIsSignOutConfirmOpen(false);
      }
    }

    window.addEventListener('keydown', closeOnEscape);
    document.addEventListener('pointerdown', closeOnOutsideClick);
    return () => {
      window.removeEventListener('keydown', closeOnEscape);
      document.removeEventListener('pointerdown', closeOnOutsideClick);
    };
  }, [isSignOutConfirmOpen, isSigningOut]);

  const isActive = (path) => {
    return location.pathname === path;
  };

  function closeAuthModal() {
    setIsAuthModalOpen(false);
    onAuthModalClose?.();
    if (isPasswordRecovery || isLoginRequested) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('flow');
      nextParams.delete('auth');
      setSearchParams(nextParams, { replace: true });
    }
  }

  return (
    <header className="site-header">
      <Link to="/" className="site-logo" aria-label="Aldea - Trang chủ">
        <img src="/logo.png" alt="" />
      </Link>

      <nav className="site-nav" aria-label="Điều hướng chính">
        <Link to="/" aria-current={isActive('/') ? 'page' : undefined}>Trang chủ</Link>
        <Link to="/ai-tools" aria-current={isActive('/ai-tools') ? 'page' : undefined}>Công cụ AI</Link>
        <Link to="/projects" aria-current={isActive('/projects') ? 'page' : undefined}>Dự án</Link>
        <Link to="/pricing" aria-current={isActive('/pricing') ? 'page' : undefined}>Bảng giá</Link>
      </nav>

      {user ? (
        <div className="auth-user-area" ref={signOutAreaRef}>
          <div className="auth-user-badge" title={user.email}>
            <span className="auth-user-avatar" aria-hidden="true">{userInitials}</span>
            <span className="auth-user-name">{userName}</span>
          </div>
          <button
            type="button"
            className="login-link"
            onClick={() => setIsSignOutConfirmOpen(true)}
          >
            Đăng xuất
          </button>
          {isSignOutConfirmOpen && (
            <section
              className="signout-popover"
              role="alertdialog"
              aria-label="Xác nhận đăng xuất"
            >
              <p className="signout-popover-question">Bạn muốn đăng xuất?</p>
              {authError && <p className="signout-modal-error" role="alert">{authError}</p>}
              <div className="signout-modal-actions">
                <button
                  type="button"
                  className="signout-cancel-btn"
                  disabled={isSigningOut}
                  onClick={() => setIsSignOutConfirmOpen(false)}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="signout-confirm-btn"
                  disabled={isSigningOut}
                  onClick={handleSignOut}
                >
                  {isSigningOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
                </button>
              </div>
            </section>
          )}
        </div>
      ) : (
        <button type="button" className="login-link" onClick={() => setIsAuthModalOpen(true)}>
          Đăng nhập
        </button>
      )}
      {authError && <span className="auth-header-error" role="alert">{authError}</span>}
      {shouldShowAuthModal && (
        <AuthModal onClose={closeAuthModal} onLoginSuccess={onLoginSuccess} />
      )}
    </header>
  );
}
