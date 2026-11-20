import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

function ContactIcon({ type }) {
  const sharedProps = {
    className: 'contact-icon-art',
    viewBox: '0 0 48 48',
    'aria-hidden': true
  };

  if (type === 'email') {
    return (
      <svg {...sharedProps}>
        <defs>
          <linearGradient id="contact-email-gradient" x1="5" y1="14" x2="43" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#16b7f3" />
            <stop offset="1" stopColor="#4b58df" />
          </linearGradient>
        </defs>
        <path d="M4 16 24 1l20 15-20 17z" fill="#3d58c8" />
        <rect x="4" y="14" width="40" height="28" rx="3" fill="url(#contact-email-gradient)" />
        <path d="m5 16 19 15 19-15" fill="none" stroke="#e8f7ff" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M5 40 18 27M43 40 30 27" fill="none" stroke="#e8f7ff" strokeWidth="2.5" />
        <path d="m17 12 6 6 11-11" fill="none" stroke="#e8f7ff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (type === 'phone') {
    return (
      <svg {...sharedProps} viewBox="2 2 37 40">
        <path
          d="M13.5 5.5c-1.1-1.2-2.9-1.3-4.1-.2L7 7.7c-1.5 1.5-.8 5.2 1.4 9.1 2.6 4.7 7.2 9.3 11.9 11.9 3.9 2.2 7.6 2.9 9.1 1.4l2.4-2.4c1.1-1.1 1-3-.2-4.1l-4.4-3.5c-1-.8-2.4-.7-3.3.2l-2 2c-2.7-1.5-5.6-4.4-7.1-7.1l2-2c.9-.9 1-2.3.2-3.3z"
          fill="#12aef0"
        />
      </svg>
    );
  }

  return (
    <svg {...sharedProps}>
      <path
        d="M24 44S9 30.5 9 18a15 15 0 1 1 30 0c0 12.5-15 26-15 26Z"
        fill="#12aef0"
        stroke="#fff"
        strokeWidth="1.5"
      />
      <circle cx="24" cy="18" r="5.5" fill="#e7f5ff" />
    </svg>
  );
}

export default function ContactUs() {
  return (
    <main className="contact-page">
      <Header />

      <section className="contact-content">
        <div className="contact-container">
          <div className="contact-grid">
            {/* Thông tin liên hệ */}
            <div className="contact-info-section">
              <h1 className="contact-title">Thông tin liên hệ</h1>
              <p className="contact-description">
                Đội ngũ Aldea luôn sẵn sàng lắng nghe và hỗ trợ bạn.
                Hãy liên hệ với chúng tôi để được tư vấn chi tiết về giải pháp thiết kế phù hợp nhất.
              </p>

              <div className="contact-details">
                <div className="contact-item">
                  <ContactIcon type="email" />
                  <div>
                    <strong>Email</strong>
                    <span>aidea.teamvn@gmail.com</span>
                  </div>
                </div>

                <div className="contact-item">
                  <ContactIcon type="phone" />
                  <div>
                    <strong>Hotline / Zalo</strong>
                    <span>0836383537</span>
                  </div>
                </div>

                <div className="contact-item">
                  <ContactIcon type="address" />
                  <div>
                    <strong>Địa chỉ</strong>
                    <span>Ninh Kiều, Cần Thơ</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
