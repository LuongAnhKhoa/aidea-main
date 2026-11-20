import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import { LoginFormContent, RegisterFormContent } from './AuthForms';

export default function AuthModal({ onClose, onLoginSuccess }) {
  const [mode, setMode] = useState('login');
  const [searchParams] = useSearchParams();
  const isRegister = mode === 'register';
  const isPasswordRecovery = searchParams.get('flow') === 'reset-password';

  function handleLoginSuccess() {
    onLoginSuccess?.();
    onClose();
  }

  useEffect(() => {
    // Cho phép đóng hộp thoại bằng phím thoát và khóa cuộn trang phía sau.
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose();
    }

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return createPortal(
    <div className="auth-modal-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section
        className={`auth-card auth-modal-card${isRegister ? ' auth-register-card' : ' auth-login-card'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        <button className="auth-modal-close" type="button" aria-label="Đóng" onClick={onClose}>×</button>
        <h1 id="auth-modal-title">
          {isRegister
            ? 'Tạo tài khoản của bạn'
            : isPasswordRecovery
              ? 'Đặt lại mật khẩu'
              : 'Chào mừng quay trở lại!'}
        </h1>
        <p className="auth-subtitle">
          {isRegister
            ? 'chỉ vài bước đơn giản để trở thành thành viên của Aldea'
            : isPasswordRecovery
              ? 'Nhập mật khẩu mới cho tài khoản của bạn'
              : 'Đăng nhập hoặc tạo workspace mới'}
        </p>
        {isRegister
          ? <RegisterFormContent idPrefix="modal-register" onLogin={() => setMode('login')} onSuccess={onClose} onNavigate={onClose} />
          : <LoginFormContent idPrefix="modal-login" onRegister={() => setMode('register')} onSuccess={handleLoginSuccess} onNavigate={onClose} />}
      </section>
    </div>,
    document.body,
  );
}
