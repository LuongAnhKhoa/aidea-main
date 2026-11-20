import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { RegisterFormContent } from '../components/AuthForms';

export default function Register() {
  const navigate = useNavigate();

  return (
    <div className="auth-page auth-register-page">
      <Header />
      <main className="auth-main auth-register-main">
        <div className="auth-promo">
          <p>Đưa tiếng nói khách hàng<br />vào mọi quyết định<br />bao bì.</p>
          <img className="auth-mascot" src="/Frame%2044.png" alt="Mascot Aldea" />
        </div>
        <section className="auth-card auth-register-card" aria-labelledby="register-title">
          <h1 id="register-title">Tạo tài khoản của bạn</h1>
          <p className="auth-subtitle">chỉ vài bước đơn giản để trở thành thành viên của Aldea</p>
          <RegisterFormContent onSuccess={() => navigate('/')} />
        </section>
      </main>
      <Footer />
    </div>
  );
}
