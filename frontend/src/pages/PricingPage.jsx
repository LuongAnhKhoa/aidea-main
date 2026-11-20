import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function PricingPage() {
  return (
    <main className="pricing-page">
      <Header />
      <section className="pricing-content">
        <div className="pricing-container">
          <h1 className="pricing-title">Bảng giá</h1>
          <p className="pricing-subtitle">
            Gói dịch vụ phù hợp với mọi nhu cầu
          </p>
          <p className="pricing-description">
            Linh hoạt lựa chọn gói dịch vụ, tối ưu chi phí và trải nghiệm công cụ AI hiện đại.
          </p>

          <div className="pricing-cards-container">
            {/* Thẻ gói cơ bản */}
            <div className="pricing-card">
              <h3 className="card-title">Gói cơ bản</h3>
              <p className="card-description">
                Phù hợp cho cá nhân muốn trải nghiệm các tính năng cơ bản.
              </p>
              <button className="btn-primary">Bắt đầu miễn phí</button>
            </div>

            {/* Thẻ gói chuyên nghiệp */}
            <div className="pricing-card featured">
              <span className="badge">Phổ biến nhất</span>
              <h3 className="card-title">Gói chuyên nghiệp</h3>
              <p className="card-description">
                Dành cho cá nhân và freelancer cần sử dụng thường xuyên.
              </p>
              <button className="btn-primary">Nâng cấp ngay</button>
            </div>

            {/* Thẻ gói doanh nghiệp */}
            <div className="pricing-card">
              <h3 className="card-title">Gói doanh nghiệp</h3>
              <p className="card-description">
                Giải pháp dành cho doanh nghiệp và tổ chức
              </p>
              <button className="btn-primary">Liên hệ tư vấn</button>
            </div>
          </div>

          {/* Khu vực liên hệ để tư vấn giải pháp riêng */}
          <div className="custom-solution-section">
            <div className="custom-solution-text">
              <h3>Bạn cần giải pháp riêng theo nhu cầu?</h3>
              <p>Hãy liên hệ với chúng tôi để được tư vấn gói dịch vụ phù hợp nhất</p>
            </div>
            <a href="https://www.facebook.com/share/1ckwaAmFs2/?mibextid=wwXIfr" className="btn-secondary">
              Liên hệ ngay
            </a>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
