import React, { useEffect, useState } from 'react';

function ChannelIcon({ channel }) {
  if (channel === 'phone') {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M14 7 9 12c-2 2 1 10 8 17s15 10 17 8l5-5-9-8-5 5c-3-1-6-4-7-7l5-5z" fill="currentColor" />
        <path d="M29 8c5 1 9 5 10 10M28 15c2 1 4 3 5 5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity=".45" />
      </svg>
    );
  }

  if (channel === 'zalo') {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M13 13h22v5L21 31h14v5H12v-5l14-13H13z" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path d="M24 5C13 5 5 12 5 22c0 6 3 11 9 14l-2 7 9-5h3c11 0 19-7 19-17S35 5 24 5Z" fill="currentColor" />
      <path d="m12 28 10-11 6 6 8-6-10 12-6-6z" fill="#0785f8" />
    </svg>
  );
}

const channels = [
  {
    id: 'phone',
    label: 'Thông tin liên hệ'
  },
  {
    id: 'zalo',
    label: 'Liên hệ qua Zalo',
    href: 'https://zalo.me/0836383537'
  },
  {
    id: 'messenger',
    label: 'Liên hệ qua Facebook Messenger',
    href: 'https://www.facebook.com/share/1ckwaAmFs2/?mibextid=wwXIfr'
  }
];

export default function ContactWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);

  useEffect(() => {
    if (!showContactInfo) return undefined;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setShowContactInfo(false);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showContactInfo]);

  return (
    <>
      <aside className={`contact-widget${isOpen ? ' is-open' : ''}`} aria-label="Liên hệ với Aldea">
        {!isOpen ? (
          <button
            type="button"
            className="contact-widget-trigger"
            onClick={() => setIsOpen(true)}
            aria-expanded="false"
          >
            Liên hệ
          </button>
        ) : (
          <div className="contact-widget-options" id="contact-widget-options">
            {channels.map((channel) => {
              const icon = <ChannelIcon channel={channel.id} />;
              const className = `contact-widget-channel contact-widget-${channel.id}`;

              if (channel.id === 'phone') {
                return (
                  <button
                    key={channel.id}
                    type="button"
                    className={className}
                    onClick={() => setShowContactInfo(true)}
                    aria-label={channel.label}
                    title={channel.label}
                  >
                    {icon}
                  </button>
                );
              }

              return (
                <a
                  key={channel.id}
                  className={className}
                  href={channel.href}
                  aria-label={channel.label}
                  title={channel.label}
                  target="_blank"
                  rel="noreferrer"
                >
                  {icon}
                </a>
              );
            })}
            <button
              type="button"
              className="contact-widget-close"
              onClick={() => setIsOpen(false)}
              aria-label="Thu gọn liên hệ"
              aria-expanded="true"
              aria-controls="contact-widget-options"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m7 7 10 10M17 7 7 17" />
              </svg>
            </button>
          </div>
        )}
      </aside>

      {showContactInfo && (
        <div
          className="contact-info-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowContactInfo(false);
          }}
        >
          <section
            className="contact-info-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-info-title"
          >
            <button
              type="button"
              className="contact-info-dialog-close"
              onClick={() => setShowContactInfo(false)}
              aria-label="Đóng thông tin liên hệ"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m7 7 10 10M17 7 7 17" />
              </svg>
            </button>
            <h2 id="contact-info-title">Thông tin liên hệ</h2>
            <p className="contact-info-dialog-description">
              Đội ngũ Aldea luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy liên hệ với chúng tôi để được tư vấn chi tiết về giải pháp thiết kế phù hợp nhất.
            </p>
            <div className="contact-info-dialog-details">
              <a className="contact-info-dialog-item" href="mailto:aidea.teamvn@gmail.com">
                <span className="contact-info-dialog-icon" aria-hidden="true">
                  <svg viewBox="0 0 48 48">
                    <path d="M5 12h38v25H5zM6 14l18 14 18-14" />
                  </svg>
                </span>
                <span><strong>Email</strong><span>aidea.teamvn@gmail.com</span></span>
              </a>
              <a className="contact-info-dialog-item" href="tel:+84836383537">
                <span className="contact-info-dialog-icon" aria-hidden="true">
                  <svg viewBox="0 0 48 48">
                    <path d="M14 7 9 12c-2 2 1 10 8 17s15 10 17 8l5-5-9-8-5 5c-3-1-6-4-7-7l5-5z" />
                  </svg>
                </span>
                <span><strong>Hotline / Zalo</strong><span>0836383537</span></span>
              </a>
              <a
                className="contact-info-dialog-item"
                href="https://maps.google.com/?q=Ninh+Ki%E1%BB%81u,+C%E1%BA%A7n+Th%C6%A1"
                target="_blank"
                rel="noreferrer"
              >
                <span className="contact-info-dialog-icon" aria-hidden="true">
                  <svg viewBox="0 0 48 48">
                    <path d="M24 43S9 29 9 18a15 15 0 1 1 30 0c0 11-15 25-15 25Z" />
                    <circle cx="24" cy="18" r="5" />
                  </svg>
                </span>
                <span><strong>Địa chỉ</strong><span>Ninh Kiều, Cần Thơ</span></span>
              </a>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
