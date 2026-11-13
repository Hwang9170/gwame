import { forwardRef } from 'react';

const STATS = [
  { value: '15', unit: '일', label: '자연 해풍 건조' },
  { value: '100', unit: '%', label: '손으로 직접 손질' },
  { value: '당일', unit: '', label: '손질 · 발송' },
];

const Hero = forwardRef(function Hero(_, ref) {
  return (
    <section className="hero" ref={ref}>
      <img className="hero-bg" src="images/hero.svg" alt="" fetchpriority="high" />
      <div className="hero-scrim" />
      <div className="wrap hero-inner">
        <span className="pill">포항 구룡포 산지 직송</span>
        <h1>
          겨울 바닷바람이<br />빚어낸 <em>쫀득한 맛</em>
        </h1>
        <p className="lead">
          찬 해풍에 얼었다 녹기를 반복하며 보름 동안 말린 과메기.<br className="pc" />
          덕장에서 바로 손질해 식탁까지 보내드립니다.
        </p>
        <div className="hero-btns">
          <a href="#products" className="btn btn-accent">상품 보러가기</a>
          <a href="#order" className="btn btn-line">바로 주문하기</a>
        </div>
        <ul className="hero-stats">
          {STATS.map((s) => (
            <li key={s.label}>
              <strong>{s.value}{s.unit && <small>{s.unit}</small>}</strong>
              <span>{s.label}</span>
            </li>
          ))}
        </ul>
      </div>
      <a href="#story" className="scroll-hint" aria-label="아래로 스크롤"><span /></a>
    </section>
  );
});

export default Hero;
