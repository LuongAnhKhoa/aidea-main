import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function ComingSoon() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="coming-soon-page">
      <Header />
      <section className="coming-soon-content" aria-labelledby="coming-soon-title">
        <div className="coming-soon-card">
          <span className="coming-soon-label">AIdea đang hoàn thiện</span>
          <h1 id="coming-soon-title">Tính năng đang được nâng cấp</h1>
          <p>
            Chúng tôi đang chăm chút để mang đến cho bạn trải nghiệm tốt hơn.
            Tính năng này sẽ sớm trở lại — cảm ơn bạn đã quan tâm và kiên nhẫn chờ đợi!
          </p>
          <Link to="/" className="coming-soon-home-link">Trở về trang chủ</Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}
