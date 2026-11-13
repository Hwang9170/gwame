import { SHOP } from '../shop.js';

export default function MobileBar({ show, count }) {
  return (
    <nav className={`mbar${show ? ' show' : ''}`} aria-label="빠른 주문">
      <a href={`tel:${SHOP.phone}`} className="mbar-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />
        </svg>
        전화
      </a>
      <a href={SHOP.kakaoUrl} className="mbar-btn" target="_blank" rel="noopener noreferrer">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.9 5.3 4.7 6.7l-1 3.6c-.1.4.3.7.6.5l4.2-2.8c.5.1 1 .1 1.5.1 5.5 0 10-3.6 10-8S17.5 3 12 3z" />
        </svg>
        카톡
      </a>
      <a href="#order" className="mbar-main">
        주문하기 {count > 0 && <span className="badge">{count}</span>}
      </a>
    </nav>
  );
}
