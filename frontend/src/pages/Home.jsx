import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const showcaseImages = [
  {
    src: '/Home/TC1.1.png',
    alt: 'Trợ lý AI Aldea đồng hành cùng nhà thiết kế',
  },
  {
    src: '/Home/TC1.png',
    alt: 'Aldea hỗ trợ sáng tạo và định hướng thiết kế',
  },
];

const quoteImages = [
  {
    src: '/Home/TC3.png',
    alt: 'Chúng tôi tin rằng đằng sau mỗi brief là một câu chuyện chưa được kể. Aldea giúp Designer lắng nghe sâu hơn để khám phá những nhu cầu thực sự của khách hàng. Aldea Team',
  },
  {
    src: '/Home/TC3.1.png',
    alt: 'Biến những mong muốn khó diễn đạt thành ngôn ngữ thiết kế rõ ràng, để khách hàng được thấu hiểu và ý tưởng được truyền tải trọn vẹn. Aldea Team',
  },
  {
    src: '/Home/TC3.2.png',
    alt: 'Trước khi tạo nên một thiết kế đẹp, hãy tìm ra một hướng đi đúng. Aldea đặt sự thấu hiểu làm nền tảng cho mọi quyết định sáng tạo. Aldea Team',
  },
  {
    src: '/Home/TC3.3.png',
    alt: 'Mỗi thương hiệu đều có câu chuyện riêng. Aldea giúp Designer khám phá những giá trị cốt lõi để chuyển hóa bản sắc thành ngôn ngữ hình ảnh khác biệt. Aldea Team',
  },
  {
    src: '/Home/TC3.4.png',
    alt: 'Dành ít thời gian hơn để giải mã brief, dành nhiều không gian hơn cho sáng tạo. Aldea đồng hành cùng Designer từ bước thấu hiểu đến những định hướng thiết kế đầu tiên. Aldea Team',
  },
];

const featuredProjects = [
  { src: '/Home/TC4.jpg', alt: 'Thiết kế bao bì Crimson Grill' },
  { src: '/Home/TC4.1.jpg', alt: 'Bộ nhận diện bao bì ZơnNuts' },
  { src: '/Home/TC4.2.jpg', alt: 'Bộ thiết kế bao bì thương hiệu thực phẩm' },
  { src: '/Home/TC4.jpg', alt: 'Thiết kế bao bì Crimson Grill' },
  { src: '/Home/TC4.1.jpg', alt: 'Bộ nhận diện bao bì ZơnNuts' },
  { src: '/Home/TC4.2.jpg', alt: 'Bộ thiết kế bao bì thương hiệu thực phẩm' },
];

export default function Home() {
  const [activeShowcase, setActiveShowcase] = useState(0);
  const [activeQuote, setActiveQuote] = useState(0);
  const projectsGalleryRef = useRef(null);

  // Cuộn thư viện dự án theo chiều mũi tên điều hướng.
  const scrollProjects = (direction) => {
    const gallery = projectsGalleryRef.current;
    if (!gallery) return;

    gallery.scrollBy({
      left: direction * gallery.clientWidth * 0.8,
      behavior: 'smooth',
    });
  };

  // Tự động luân phiên hình ảnh trưng bày và dọn bộ hẹn giờ khi rời trang.
  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveShowcase((current) => (current + 1) % showcaseImages.length);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, []);

  // Tự động luân phiên hình ảnh trích dẫn mỗi 5 giây.
  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveQuote((current) => (current + 1) % quoteImages.length);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <main className="home-page" id="top">
      <Header />

      <section className="hero" aria-label="Giới thiệu Aldea">
        <img
          className="hero-artwork"
          src="/home2.png"
          alt="Mascot Aldea trên nền xanh tím, với các vòng sáng tỏa ra ở giữa"
        />
        <img
          className="hero-decoration hero-brand-card"
          src="/Group%20189.png"
          alt="Thấu hiểu nhu cầu, kiến tạo định hướng"
        />
        <img className="hero-decoration hero-chatbar-first" src="/Group%20190.png" alt="" />
        <img className="hero-decoration hero-chatbar-second" src="/Group%20190%20(1).png" alt="" />
        <img
          className="hero-decoration hero-assistant-artwork"
          src="/Group%20193.png"
          alt="Thẻ Trợ lý AI Web Aldea"
        />
        <p className="hero-copy hero-copy-left">
          <strong>Thiết kế bắt đầu<br />từ sự thấu hiểu.</strong>
          <span>Logo · Branding · Packaging · Visual</span>
        </p>
        <p className="hero-copy hero-copy-right">
          <strong>Từ ý tưởng<br />đến thiết kế.</strong>
          <span>Lắng nghe · Phân tích<br />định hướng · Kiến tạo</span>
        </p>
        <a className="explore-link" href="#gioi-thieu">
          Khám phá AIdea <span aria-hidden="true">→</span>
        </a>
      </section>

      <section className="home-marquee" aria-label="Thông điệp AIdea">
        <div className="home-marquee-track">
          <span>THẤU HIỂU KHÁCH HÀNG  - KHỞI NGUỒN THIẾT KẾ - TỪ INSIGHT ĐẾN CONCEPT</span>
          <span aria-hidden="true">THẤU HIỂU KHÁCH HÀNG  - KHỞI NGUỒN THIẾT KẾ - TỪ INSIGHT ĐẾN CONCEPT</span>
          <span aria-hidden="true">THẤU HIỂU KHÁCH HÀNG  - KHỞI NGUỒN THIẾT KẾ - TỪ INSIGHT ĐẾN CONCEPT</span>
          <span aria-hidden="true">THẤU HIỂU KHÁCH HÀNG  - KHỞI NGUỒN THIẾT KẾ - TỪ INSIGHT ĐẾN CONCEPT</span>
        </div>
      </section>
      <div className="marquee-divider" aria-hidden="true" />

      <section className="home-content" id="gioi-thieu">
        <div className="content-container">
          <div className="home-showcase" aria-label="Khám phá AIdea">
            <div className="showcase-viewport">
              <div
                className="showcase-track"
                style={{ transform: `translateX(-${activeShowcase * 100}%)` }}
              >
                {showcaseImages.map((image) => (
                  <img
                    className="showcase-slide"
                    key={image.src}
                    src={image.src}
                    alt={image.alt}
                  />
                ))}
              </div>
            </div>
          </div>

          <section className="content-section about-section" aria-labelledby="about-title">
            <div className="about-intro">
              <div className="about-intro-copy">
                <h2 className="about-intro-title" id="about-title">VỀ AIDEA</h2>
                <p>
                  Aldea là trợ lý AI dành cho designer, được phát triển với sứ mệnh giúp người làm thiết kế thấu hiểu khách hàng sâu sắc hơn trước khi bắt đầu sáng tạo. Không chỉ dừng lại ở những yêu cầu được thể hiện trong brief, Aldea hướng đến việc khai phá nhu cầu cốt lõi, kỳ vọng và những vấn đề tiềm ẩn của khách hàng, từ đó đưa ra những định hướng và Concept thiết kế phù hợp. Chúng tôi tin rằng một thiết kế có giá trị không chỉ đẹp về hình thức, mà còn phải bắt nguồn từ sự thấu hiểu con người.
                </p>
                <Link to="/ai-tools">Trải nghiệm ngay</Link>
              </div>
              <img
                className="about-intro-artwork"
                src="/Home/TC2.png"
                alt="Những mảnh ghép ý tưởng thiết kế được kết nối với nhau"
              />
            </div>
          </section>

          <section className="quote-carousel" aria-label="Trích dẫn từ đội ngũ Aldea">
            <div className="quote-viewport">
              <div
                className="quote-track"
                style={{ transform: `translateX(-${activeQuote * 100}%)` }}
              >
                {quoteImages.map((quote) => (
                  <img
                    className="quote-slide"
                    key={quote.src}
                    src={quote.src}
                    alt={quote.alt}
                  />
                ))}
              </div>
              <button
                className="quote-arrow quote-previous"
                type="button"
                aria-label="Xem trích dẫn trước"
                onClick={() => setActiveQuote((current) => (current - 1 + quoteImages.length) % quoteImages.length)}
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
                  <path d="M14.5 5.5 8 12l6.5 6.5M8.5 12h11" />
                </svg>
              </button>
              <button
                className="quote-arrow quote-next"
                type="button"
                aria-label="Xem trích dẫn tiếp theo"
                onClick={() => setActiveQuote((current) => (current + 1) % quoteImages.length)}
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
                  <path d="m9.5 5.5 6.5 6.5-6.5 6.5M15.5 12h-11" />
                </svg>
              </button>
            </div>
          </section>

          <section className="content-section projects-section" id="du-an" aria-labelledby="projects-title">
            <div className="projects-showcase">
              <div className="projects-intro">
                <h2 className="projects-showcase-title" id="projects-title">
                  <span>Dự án</span>
                  <strong>NỔI BẬT</strong>
                </h2>
                <p>
                  Aldea ứng dụng AI vào quy trình thiết kế, giúp designer thấu hiểu nhu
                  cầu khách hàng, khai thác insight và định hướng Concept phù hợp.
                </p>
              </div>
              <div className="projects-gallery-column">
                <div className="projects-gallery-shell">
                  <button
                    className="projects-gallery-arrow projects-gallery-previous"
                    type="button"
                    aria-label="Cuộn dự án về trước"
                    onClick={() => scrollProjects(-1)}
                  >
                    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
                      <path d="M14.5 5.5 8 12l6.5 6.5" />
                    </svg>
                  </button>
                  <div className="projects-gallery" ref={projectsGalleryRef} aria-label="Sáu dự án thiết kế nổi bật">
                    {featuredProjects.map((project, index) => (
                      <img
                        key={`${project.src}-${index}`}
                        src={project.src}
                        alt={project.alt}
                      />
                    ))}
                  </div>
                  <button
                    className="projects-gallery-arrow projects-gallery-next"
                    type="button"
                    aria-label="Cuộn dự án tiếp theo"
                    onClick={() => scrollProjects(1)}
                  >
                    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
                      <path d="m9.5 5.5 6.5 6.5-6.5 6.5" />
                    </svg>
                  </button>
                </div>
                <Link className="featured-projects-link" to="/projects">Xem chi tiết</Link>
              </div>
            </div>
            <div className="home-difference">
              <img
                className="home-difference-artwork"
                src="/Home/TC5.jpg"
                alt="Các thiết kế thương hiệu được trình bày trên mạng xã hội"
              />
              <div className="home-difference-copy">
                <h2>SỰ KHÁC BIỆT CỦA AIDEA</h2>
                <p>
                  AIdea được định hướng chuyên biệt cho giai đoạn thấu hiểu khách hàng trong quy trình thiết kế. Không chỉ hỗ trợ tạo ý tưởng, AIdea giúp designer đi sâu vào nhu cầu cốt lõi, nhận diện những mong muốn tiềm ẩn và chuyển hóa insight thành các Concept có định hướng. Nhờ đó, designer tiết kiệm thời gian nghiên cứu, còn khách hàng được thấu hiểu tốt hơn, góp phần thu hẹp khoảng cách giữa mong muốn ban đầu và kết quả thiết kế.
                </p>
              </div>
            </div>
          </section>
        </div>
      </section>

      <Footer />
    </main>
  );
}