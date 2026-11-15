const icon = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round' };

const FEATURES = [
  {
    title: '자연 해풍 건조',
    text: '기계 건조 없이 겨울 바닷바람으로만 말려 쫀득하고 고소한 맛이 깊습니다.',
    icon: <svg viewBox="0 0 48 48" {...icon}><path d="M6 18h24a6 6 0 1 0-6-6" /><path d="M6 26h32a6 6 0 1 1-6 6" /><path d="M6 34h14" /></svg>,
  },
  {
    title: '받을 날짜 지정 · 발송일 손질',
    text: '원하시는 날짜에 받도록 보내드립니다. 미리 손질해 두지 않고, 보내는 날 손질해 바로 포장합니다.',
    icon: <svg viewBox="0 0 48 48" {...icon}><circle cx="24" cy="24" r="17" /><path d="M24 14v10l7 5" /></svg>,
  },
  {
    title: '야채까지 한 상 차림',
    text: '배추, 미역, 김, 쪽파, 마늘, 고추, 초장까지 담아 받자마자 바로 드실 수 있습니다.',
    icon: <svg viewBox="0 0 48 48" {...icon}><path d="M8 30c0-10 7-20 16-20s16 10 16 20" /><path d="M5 30h38l-3 8H8z" /><path d="M24 10V6" /></svg>,
  },
  {
    title: '문제 있으면 책임 교환',
    text: '배송 중 문제가 생기면 사진 한 장만 보내주세요. 재발송 또는 환불해 드립니다.',
    icon: <svg viewBox="0 0 48 48" {...icon}><path d="M24 6l15 6v11c0 10-7 16-15 19-8-3-15-9-15-19V12z" /><path d="M17 24l5 5 9-10" /></svg>,
  },
];

export default function Features() {
  return (
    <section className="section section-alt">
      <div className="wrap">
        <div className="head center reveal">
          <p className="eyebrow">WHY US</p>
          <h2 className="title">바닷바람 과메기가 다른 이유</h2>
        </div>
        <div className="features">
          {FEATURES.map((f) => (
            <article key={f.title} className="feature reveal">
              <div className="ficon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
