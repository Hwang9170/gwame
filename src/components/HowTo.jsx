const STEPS = [
  ['차갑게 보관', '받으시면 바로 냉장고에 넣고, 드시기 직전에 꺼내세요.'],
  ['먹기 좋게 자르기', '한 쪽을 두세 토막으로 잘라 접시에 담습니다.'],
  ['쌈 쌓기', '김 → 배추 → 미역 → 과메기 순서로 올립니다.'],
  ['마무리', '쪽파·마늘·고추를 얹고 초장을 듬뿍 찍어 한입에!'],
];

export default function HowTo() {
  return (
    <section id="howto" className="section section-alt">
      <div className="wrap howto">
        <div className="howto-img reveal">
          <img
            src="images/ssam.svg"
            alt="김, 배추, 미역, 과메기, 쪽파·마늘·고추, 초장 순서로 쌓은 과메기 쌈"
            loading="lazy"
          />
        </div>
        <div className="reveal">
          <p className="eyebrow">HOW TO EAT</p>
          <h2 className="title">한 쌈에 모두 올려<br />크게 드세요</h2>
          <ol className="howto-list">
            {STEPS.map(([title, text], i) => (
              <li key={title}>
                <b>{i + 1}</b>
                <div><h4>{title}</h4><p>{text}</p></div>
              </li>
            ))}
          </ol>
          <div className="tip">
            <b>보관 팁</b> 냉장 약 7일, 냉동 약 1개월. 냉동했다면 냉장실에서 천천히 녹여 드세요.
          </div>
        </div>
      </div>
    </section>
  );
}
