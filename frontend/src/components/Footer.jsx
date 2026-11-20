import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer" id="lien-he">
      <div className="footer-content">
        <div className="footer-brand">
          <Link to="/#top" aria-label="Aldea - về đầu trang">
            <img src="/logo.png" alt="" />
            <span>Aldea</span>
          </Link>
          <strong>Thấu hiểu nhu cầu<br />Kiến tạo định hướng</strong>
          <p>Nền tảng tạo ra những thương hiệu thấu hiểu khách hàng và chuyển hóa thấu hiểu thành thiết kế sống động.</p>
        </div>
        <div className="footer-column">
          <h2>Về Aldea</h2>
          <Link to="/coming-soon">Về chúng tôi</Link>
          <Link to="/coming-soon">Sứ mệnh</Link>
          <Link to="/coming-soon">Giá trị cốt lõi</Link>
        </div>
        <div className="footer-column">
          <h2>Giải pháp</h2>
          <Link to="/coming-soon">Thấu hiểu thị trường</Link>
          <Link to="/coming-soon">Phân tích AI</Link>
          <Link to="/coming-soon">Insight khách hàng</Link>
          <Link to="/coming-soon">Brief thiết kế</Link>
        </div>
        <div className="footer-column">
          <h2>Hỗ trợ</h2>
          <Link to="/coming-soon">Câu hỏi thường gặp</Link>
          <Link to="/contact">Liên hệ</Link>
        </div>
        <div className="footer-column">
          <h2>Kết nối</h2>
          <a href="https://www.facebook.com/share/1ckwaAmFs2/?mibextid=wwXIfr" target="_blank" rel="noreferrer">Facebook</a>
          <Link to="/coming-soon">Instagram</Link>
          <a href="mailto:aidea.teamvn@gmail.com">Email</a>
          <a href="https://zalo.me/0836383537" target="_blank" rel="noreferrer">Zalo</a>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Aldea<br />Thấu hiểu để thiết kế đúng.</span>
          <span className="footer-legal">
            <Link to="/coming-soon">Chính sách bảo mật</Link>
            <span aria-hidden="true"> · </span>
            <Link to="/coming-soon">Điều khoản sử dụng</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}