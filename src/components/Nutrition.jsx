const ITEMS = [
  ['DHA · EPA', '등푸른 생선에 많은 오메가-3 지방산'],
  ['단백질', '말리는 동안 영양이 응축된 고단백 식품'],
  ['비타민 D', '햇볕이 부족한 겨울에 챙기기 좋은 영양소'],
  ['제철 별미', '11월부터 2월까지, 겨울에만 맛볼 수 있습니다'],
];

export default function Nutrition() {
  return (
    <section className="section nutrition">
      <div className="wrap">
        <div className="head center reveal">
          <p className="eyebrow">GOOD FOR YOU</p>
          <h2 className="title">추운 겨울, 몸이 반기는 맛</h2>
          <p className="desc">등푸른 생선인 꽁치를 그대로 말린 과메기에는 좋은 영양이 가득합니다.</p>
        </div>
        <div className="nutri">
          {ITEMS.map(([title, text]) => (
            <div key={title} className="nutri-card reveal">
              <strong>{title}</strong>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
