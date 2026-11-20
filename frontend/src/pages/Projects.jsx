import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Projects() {
  const [activeFilter, setActiveFilter] = useState('all');
  const projectsGridRef = useRef(null);

  // Đưa trang dự án về đầu trang khi người dùng mở trang.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Cuộn danh sách dự án theo hướng được chọn.
  const scrollProjects = (direction) => {
    if (projectsGridRef.current) {
      const scrollAmount = 400;
      if (direction === 'left') {
        projectsGridRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        projectsGridRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  const projects = [
    {
      id: 1,
      title: 'Nhà Hàng Crimson Grill',
      category: 'Mỹ phẩm',
      image: '/TC4.jpg',
      hasAudio: true,
      hasBrief: true
    },
    {
      id: 2,
      title: 'Doanh Nghiệp ZanNuts',
      category: 'F&B - Thực phẩm',
      image: '/TC4.1.jpg',
      hasAudio: true,
      hasBrief: true
    },
    {
      id: 3,
      title: 'Cửa Hàng Bánh Ngọt GoRy',
      category: 'F&B - Thực phẩm',
      image: '/TC4.2.jpg',
      hasAudio: true,
      hasBrief: true
    }
  ];

  const filters = [
    { id: 'all', label: 'Tất cả' },
    { id: 'fnb', label: 'F&B - Thực phẩm' },
    { id: 'cosmetics', label: 'Mỹ phẩm' },
    { id: 'gift', label: 'Quà tặng' },
    { id: 'pets', label: 'Sản phẩm cho thú cưng' },
    { id: 'eco', label: 'Bao bì thân thiện' }
  ];

  // Lọc dự án theo danh mục đang được chọn.
  const filteredProjects = activeFilter === 'all' 
    ? projects 
    : projects.filter(project => {
        if (activeFilter === 'fnb') return project.category === 'F&B - Thực phẩm';
        if (activeFilter === 'cosmetics') return project.category === 'Mỹ phẩm';
        if (activeFilter === 'gift') return project.category === 'Quà tặng';
        if (activeFilter === 'pets') return project.category === 'Sản phẩm cho thú cưng';
        if (activeFilter === 'eco') return project.category === 'Bao bì thân thiện';
        return true;
      });

  return (
    <main className="projects-page">
      <Header />

      {/* Khu vực giới thiệu đầu trang */}
      <section className="projects-hero">
        <div className="hero-banner">
          <img src="/B1.png" alt="Aldea - Nơi các ý tưởng hình thành" className="hero-banner-image" />
        </div>
      </section>

      {/* Khu vực trưng bày dự án */}
      <section className="projects-content">
        <div className="projects-container">
          <div className="projects-header">
            <h2 className="projects-title">DỰ ÁN ĐÃ THỰC HIỆN</h2>
            <p className="projects-description">
              Khám phá các dự án bao bì được phát triển từ phân tích AI và sáng tạo của đội ngũ Designer, mang đến những giải pháp thiết kế phù hợp với từng thương hiệu và nhu cầu khách hàng.
            </p>
          </div>

          {/* Các nút lọc dự án theo danh mục */}
          <div className="filter-buttons">
            {filters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                className={`filter-btn ${activeFilter === filter.id ? 'active' : ''}`}
                onClick={() => setActiveFilter(filter.id)}
                aria-pressed={activeFilter === filter.id}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Danh sách thẻ dự án có thể cuộn ngang */}
          <div className="projects-grid-wrapper">
            <button className="scroll-arrow scroll-arrow-left" onClick={() => scrollProjects('left')}>
              ‹
            </button>
            <div className="projects-grid" ref={projectsGridRef}>
              {filteredProjects.map((project) => (
                <div key={project.id} className="project-card">
                  <div className="project-image">
                    <img src={project.image} alt={project.title} />
                  </div>
                  <h3 className="project-title">{project.title}</h3>
                  
                  <div className="project-buttons">
                    <button className="project-action-btn raw-data-btn">
                      Dữ liệu thô
                    </button>
                    <button className="project-action-btn ai-brief-btn">
                      Kết quả AI Brief
                    </button>
                  </div>
                  
                  <a href="#" className="view-details-link">
                    Xem chi tiết 
                  </a>
                </div>
              ))}
            </div>
            <button className="scroll-arrow scroll-arrow-right" onClick={() => scrollProjects('right')}>
              ›
            </button>
          </div>

          {/* Hình ảnh bổ sung cuối trang */}
          <div className="projects-bottom-images">
            <img src="/B2.png" alt="B2" className="bottom-image" />
            <img src="/B3.jpg" alt="B3" className="bottom-image" />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
