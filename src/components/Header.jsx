import { useEffect, useRef, useState } from 'react';
import { SHOP } from '../shop.js';

const LINKS = [
  { href: '#story', label: '이야기' },
  { href: '#products', label: '상품' },
  { href: '#howto', label: '먹는 법' },
  { href: '#faq', label: '자주 묻는 질문' },
];

export function LogoMark({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#0f2440" />
      <path d="M16 5c3 1 4 4 4 9l-1 9c0 2-1 3-3 4-2-1-3-2-3-4l-1-9c0-5 1-8 4-9z" fill="#d08a5c" />
    </svg>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuTop, setMenuTop] = useState(100);
  const ref = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    const onResize = () => window.innerWidth > 860 && setOpen(false);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle('menu-open', open);
    if (open && ref.current) setMenuTop(ref.current.getBoundingClientRect().bottom);
  }, [open]);

  const close = () => setOpen(false);
  const [first, second] = SHOP.name.split(' ');

  return (
    <header ref={ref} className={`header${scrolled ? ' scrolled' : ''}`}>
      <div className="wrap nav">
        <a href="#top" className="logo" aria-label={`${SHOP.name} 홈`} onClick={close}>
          <LogoMark />
          <span>{first}<b>{second}</b></span>
        </a>
        <nav
          id="menu"
          className={`menu${open ? ' open' : ''}`}
          style={{ '--menu-top': `${menuTop}px` }}
          aria-label="주요 메뉴"
        >
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={close}>{l.label}</a>
          ))}
          <a href="#order" className="menu-cta" onClick={close}>주문하기</a>
        </nav>
        <button
          className="burger"
          aria-label={open ? '메뉴 닫기' : '메뉴 열기'}
          aria-expanded={open}
          aria-controls="menu"
          onClick={() => setOpen((o) => !o)}
        >
          <span /><span /><span />
        </button>
      </div>
    </header>
  );
}
