import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getAuthErrorMessage } from '../auth/authError';
import { normalizeVietnameseMobilePhone } from '../auth/phoneValidation';
import { useAuth } from '../auth/useAuth';
import { useToast } from '../notifications/useToast';

function AuthFeedback({ message, isError = false }) {
  if (!message) return null;
  return <p className={`auth-feedback${isError ? ' is-error' : ''}`} role={isError ? 'alert' : 'status'}>{message}</p>;
}

function PasswordField({ id, name, autoComplete, placeholder, minLength, required, onChange }) {
  const [visible, setVisible] = React.useState(false);

  return (
    <div className="auth-password-field">
      <input
        id={id}
        name={name}
        type={visible ? 'text' : 'password'}
        autoComplete={autoComplete}
        placeholder={placeholder}
        minLength={minLength}
        required={required}
        onChange={onChange}
      />
      <button
        className="auth-password-toggle"
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        aria-pressed={visible}
        title={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
      >
        {visible ? (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8" />
            <path d="M9.9 5.2A10.8 10.8 0 0112 5c5.2 0 8.8 5.2 9.5 6.3a1.3 1.3 0 010 1.4 15.7 15.7 0 01-3.1 3.5M6.2 6.3a16.6 16.6 0 00-3.7 5 1.3 1.3 0 000 1.4C3.2 13.8 6.8 19 12 19a10 10 0 004-.8" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12z" />
            <circle cx="12" cy="12" r="2.5" />
          </svg>
        )}
      </button>
    </div>
  );
}

function SocialButtons({ register = false, onNavigate }) {
  const { signInWithProvider } = useAuth();
  const [loadingProvider, setLoadingProvider] = React.useState('');
  const [errorMsg, setErrorMsg] = React.useState('');

  async function handleSocialLogin(provider) {
    try {
      setErrorMsg('');
      setLoadingProvider(provider);
      await signInWithProvider(provider);
      onNavigate?.();
    } catch (error) {
      setErrorMsg(getAuthErrorMessage(error, `Đăng nhập bằng ${provider === 'google' ? 'Google' : 'Facebook'} thất bại.`));
    } finally {
      setLoadingProvider('');
    }
  }

  return (
    <>
      <div className={`auth-social-buttons${register ? ' auth-register-social' : ''}`}>
        <button
          type="button"
          aria-label={register ? 'Đăng ký với Google' : 'Tiếp tục với Google'}
          onClick={() => handleSocialLogin('google')}
          disabled={Boolean(loadingProvider)}
        >
          {loadingProvider === 'google'
            ? 'Đang chuyển hướng...'
            : (register ? 'Đăng ký với Google' : 'Tiếp tục với Google')}{' '}
          <span className="google-mark" aria-hidden="true">G</span>
        </button>
        <button
          type="button"
          aria-label={register ? 'Đăng ký với Facebook' : 'Tiếp tục với Facebook'}
          onClick={() => handleSocialLogin('facebook')}
          disabled={Boolean(loadingProvider)}
        >
          {loadingProvider === 'facebook'
            ? 'Đang chuyển hướng...'
            : (register ? 'Đăng ký với Facebook' : 'Tiếp tục với Facebook')}{' '}
          <span className="facebook-mark" aria-hidden="true">f</span>
        </button>
      </div>
      {errorMsg && <AuthFeedback message={errorMsg} isError />}
    </>
  );
}

export function LoginFormContent({ onRegister, onSuccess, onNavigate, idPrefix = 'login' }) {
  const { isConfigured, configurationError, signIn, resetPassword, updatePassword } = useAuth();
  const { showSuccess } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [authModeState, setAuthMode] = React.useState(
    searchParams.get('flow') === 'reset-password' ? 'update-password' : 'login'
  );
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [isError, setIsError] = React.useState(false);
  const recoveryEmail = searchParams.get('flow') === 'reset-password';
  const authMode = recoveryEmail ? 'update-password' : authModeState;

  async function submitLogin(event) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    setIsError(false);
    const form = new FormData(event.currentTarget);
    try {
      await signIn({ email: form.get('email'), password: form.get('password') });
      showSuccess('Đăng nhập thành công.');
      onSuccess?.();
    } catch (error) {
      setMessage(getAuthErrorMessage(error, 'Đăng nhập không thành công. Vui lòng thử lại.'));
      setIsError(true);
    } finally {
      setBusy(false);
    }
  }

  async function submitResetEmail(event) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    setIsError(false);
    const form = new FormData(event.currentTarget);
    try {
      await resetPassword(form.get('email'));
      setMessage('Nếu email tồn tại, hướng dẫn đặt lại mật khẩu sẽ được gửi đến hộp thư của bạn.');
    } catch (error) {
      setMessage(getAuthErrorMessage(error, 'Không gửi được email đặt lại mật khẩu. Vui lòng thử lại.'));
      setIsError(true);
    } finally {
      setBusy(false);
    }
  }

  async function submitNewPassword(event) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    setIsError(false);
    const form = new FormData(event.currentTarget);
    const password = form.get('password');
    if (password !== form.get('confirmPassword')) {
      setMessage('Mật khẩu xác nhận không khớp.');
      setIsError(true);
      setBusy(false);
      return;
    }
    try {
      await updatePassword(password);
      setMessage('Đã cập nhật mật khẩu. Bạn có thể đăng nhập bằng mật khẩu mới.');
      setSearchParams({}, { replace: true });
      setAuthMode('login');
    } catch (error) {
      setMessage(getAuthErrorMessage(error, 'Không cập nhật được mật khẩu. Vui lòng thử lại.'));
      setIsError(true);
    } finally {
      setBusy(false);
    }
  }

  if (!isConfigured) {
    return (
      <>
        <AuthFeedback message={configurationError} isError />
        <p className="auth-switch">Cấu hình Supabase trước khi sử dụng đăng nhập.</p>
      </>
    );
  }

  if (authMode === 'update-password') {
    return (
      <form className="auth-form auth-login-form" onSubmit={submitNewPassword}>
        <label htmlFor={`${idPrefix}-new-password`}>Mật khẩu mới</label>
        <PasswordField id={`${idPrefix}-new-password`} name="password" autoComplete="new-password" minLength="8" required />
        <label htmlFor={`${idPrefix}-confirm-password`}>Xác nhận mật khẩu</label>
        <PasswordField id={`${idPrefix}-confirm-password`} name="confirmPassword" autoComplete="new-password" minLength="8" required />
        <AuthFeedback message={message} isError={isError} />
        <button className="auth-submit" type="submit" disabled={busy}>{busy ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}</button>
      </form>
    );
  }

  if (authMode === 'request-reset') {
    return (
      <>
        <form className="auth-form auth-login-form" onSubmit={submitResetEmail}>
          <label htmlFor={`${idPrefix}-email`}>Gmail</label>
          <input id={`${idPrefix}-email`} name="email" type="email" autoComplete="email" required />
          <AuthFeedback message={message} isError={isError} />
          <button className="auth-submit" type="submit" disabled={busy}>{busy ? 'Đang gửi...' : 'Gửi hướng dẫn đặt lại mật khẩu'}</button>
        </form>
        <p className="auth-switch">
          <button className="auth-switch-button" type="button" onClick={() => { setAuthMode('login'); setMessage(''); }}>Quay lại đăng nhập</button>
        </p>
      </>
    );
  }

  return (
    <>
      <form className="auth-form auth-login-form" onSubmit={submitLogin}>
        <label htmlFor={`${idPrefix}-email`}>Gmail</label>
        <input id={`${idPrefix}-email`} name="email" type="email" autoComplete="email" required />
        <label htmlFor={`${idPrefix}-password`}>Mật Khẩu</label>
        <PasswordField id={`${idPrefix}-password`} name="password" autoComplete="current-password" required />
        <div className="auth-form-options">
          <button type="button" className="auth-text-button" onClick={() => { setMessage(''); setAuthMode('request-reset'); }}>Quên mật khẩu?</button>
        </div>
        <AuthFeedback message={message} isError={isError} />
        <button className="auth-submit" type="submit" disabled={busy}>{busy ? 'Đang đăng nhập...' : 'Đăng Nhập'}</button>
      </form>
      <div className="auth-divider"><span>--Hoặc--</span></div>
      <SocialButtons onNavigate={onNavigate} />
      <p className="auth-switch">
        Chưa có tài khoản?{' '}
        {onRegister
          ? <button className="auth-switch-button" type="button" onClick={onRegister}>Đăng ký ngay!</button>
          : <Link to="/register">Đăng ký ngay!</Link>}
      </p>
    </>
  );
}

export function RegisterFormContent({ onLogin, onSuccess, onNavigate, idPrefix = 'register' }) {
  const { isConfigured, configurationError, signUp } = useAuth();
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [isError, setIsError] = React.useState(false);

  // Kiểm tra lại xác nhận mật khẩu khi người dùng thay đổi một trong hai ô.
  function updatePasswordConfirmation(event) {
    const form = event.currentTarget.form;
    const password = form.elements.namedItem('password').value;
    const confirmation = form.elements.namedItem('confirmPassword');
    confirmation.setCustomValidity(
      confirmation.value && password !== confirmation.value
        ? 'Mật khẩu xác nhận không khớp.'
        : '',
    );
  }

  function validatePhoneInput(event) {
    const phone = event.currentTarget;
    phone.setCustomValidity(
      !phone.value || normalizeVietnameseMobilePhone(phone.value)
        ? ''
        : 'Vui lòng nhập số điện thoại hợp lệ.',
    );
  }

  // Ngăn gửi biểu mẫu nếu mật khẩu và phần xác nhận không trùng nhau.
  async function validatePasswordConfirmation(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const password = form.elements.namedItem('password').value;
    const confirmation = form.elements.namedItem('confirmPassword');
    const phone = form.elements.namedItem('phone');
    confirmation.setCustomValidity(password === confirmation.value ? '' : 'Mật khẩu xác nhận không khớp.');
    const normalizedPhone = normalizeVietnameseMobilePhone(phone.value);
    phone.setCustomValidity(
      normalizedPhone
        ? ''
        : 'Vui lòng nhập số điện thoại hợp lệ.',
    );
    if (!form.reportValidity()) return;

    setBusy(true);
    setMessage('');
    setIsError(false);
    try {
      const { session, user } = await signUp({
        email: form.elements.namedItem('email').value.trim().toLowerCase(),
        password,
        fullName: form.elements.namedItem('name').value,
        phone: normalizedPhone
      });
      if (!session && user?.identities?.length === 0) {
        setMessage('Email này đã được đăng ký. Vui lòng đăng nhập hoặc dùng email khác.');
        setIsError(true);
      } else if (session) {
        setMessage('Đăng ký thành công.');
        onSuccess?.();
      } else {
        setMessage('Tài khoản đã được tạo. Hãy kiểm tra email để xác nhận trước khi đăng nhập.');
      }
    } catch (error) {
      setMessage(getAuthErrorMessage(error, 'Đăng ký không thành công. Vui lòng thử lại.'));
      setIsError(true);
    } finally {
      setBusy(false);
    }
  }

  if (!isConfigured) {
    return (
      <>
        <AuthFeedback message={configurationError} isError />
        <p className="auth-switch">Cấu hình Supabase trước khi sử dụng đăng ký.</p>
      </>
    );
  }

  return (
    <>
      <form className="auth-form auth-register-form" onSubmit={validatePasswordConfirmation}>
        <div className="auth-field-row">
          <div className="auth-field">
            <label htmlFor={`${idPrefix}-name`}>Họ và tên</label>
            <input id={`${idPrefix}-name`} name="name" type="text" placeholder="Nhập họ và tên của bạn" autoComplete="name" required />
          </div>
          <div className="auth-field">
            <label htmlFor={`${idPrefix}-phone`}>Số điện thoại</label>
            <input id={`${idPrefix}-phone`} name="phone" type="tel" placeholder="Nhập số điện thoại của bạn" autoComplete="tel" onChange={validatePhoneInput} required />
          </div>
        </div>
        <div className="auth-field">
          <label htmlFor={`${idPrefix}-email`}>Gmail</label>
          <input id={`${idPrefix}-email`} name="email" type="email" placeholder="Nhập gmail của bạn" autoComplete="email" required />
        </div>
        <div className="auth-field-row">
          <div className="auth-field">
            <label htmlFor={`${idPrefix}-password`}>Mật khẩu</label>
            <PasswordField id={`${idPrefix}-password`} name="password" placeholder="Tạo mật khẩu (tối thiểu 8 ký tự)" autoComplete="new-password" minLength="8" onChange={updatePasswordConfirmation} required />
          </div>
          <div className="auth-field">
            <label htmlFor={`${idPrefix}-confirm-password`}>Xác nhận mật khẩu</label>
            <PasswordField id={`${idPrefix}-confirm-password`} name="confirmPassword" placeholder="Nhập lại mật khẩu" autoComplete="new-password" minLength="8" onChange={updatePasswordConfirmation} required />
          </div>
        </div>
        <label className="auth-checkbox auth-terms">
          <input type="checkbox" name="terms" required />
          <span>Tôi đồng ý với điều khoản sử dụng và chính sách bảo mật</span>
        </label>
        <AuthFeedback message={message} isError={isError} />
        <button className="auth-submit" type="submit" disabled={busy}>{busy ? 'Đang tạo tài khoản...' : 'Đăng ký'}</button>
      </form>
      <div className="auth-divider auth-register-divider"><span>hoặc đăng ký bằng</span></div>
      <SocialButtons register onNavigate={onNavigate} />
      <p className="auth-switch">
        đã có tài khoản?{' '}
        {onLogin
          ? <button className="auth-switch-button" type="button" onClick={onLogin}>đăng nhập</button>
          : <Link to="/?auth=login">đăng nhập</Link>}
      </p>
    </>
  );
}
