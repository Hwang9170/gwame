const icon = { viewBox: '0 0 48 48', fill: 'none', stroke: 'currentColor', strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round' };

const STEPS = [
  {
    title: '원물 선별',
    text: '살이 통통하게 오른 꽁치만 골라 바닷물로 깨끗이 씻습니다.',
    icon: <svg {...icon}><path d="M4 24c8-9 20-11 30-4l8-6v20l-8-6c-10 7-22 5-30-4z" /><circle cx="13" cy="22" r="1.5" fill="currentColor" /></svg>,
  },
  {
    title: '해풍 건조',
    text: '덕장에 걸어 약 15일 동안 얼고 녹기를 반복하며 말립니다.',
    icon: <svg {...icon}><path d="M4 10h40" /><path d="M12 10v24M22 10v28M32 10v22" /></svg>,
  },
  {
    title: '수작업 손질',
    text: '껍질을 벗기고 뼈를 발라 먹기 좋게 하나하나 손질합니다.',
    icon: <svg {...icon}><path d="M8 40L34 14l6 6-26 26z" /><path d="M30 18l-6-6 6-6 6 6" /></svg>,
  },
  {
    title: '신선 포장',
    text: '아이스팩과 함께 단단히 포장해 택배로 빠르게 보냅니다.',
    icon: <svg {...icon}><path d="M6 16l18-8 18 8v18l-18 8-18-8z" /><path d="M6 16l18 8 18-8M24 24v18" /></svg>,
  },
];

export default function Process() {
  return (
    <section className="section process">
      <div className="wrap">
        <div className="head reveal">
          <p className="eyebrow light">PROCESS</p>
          <h2 className="title">덕장에서 식탁까지</h2>
          <p className="desc">하나의 과메기가 완성되기까지 약 보름, 네 번의 손길을 거칩니다.</p>
        </div>
        <ol className="steps">
          {STEPS.map((s, i) => (
            <li key={s.title} className="step reveal">
              <span className="step-no">{String(i + 1).padStart(2, '0')}</span>
              {s.icon}
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
