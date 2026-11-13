const FAQ = [
  ['주문하면 언제 받을 수 있나요?', '오후 2시 이전 주문은 당일 발송되어 보통 다음 날 받아보실 수 있습니다. 신선도를 위해 금·토요일과 공휴일 전날에는 발송하지 않습니다.'],
  ['과메기는 언제까지 판매하나요?', '매년 11월부터 이듬해 2월까지, 해풍이 차가운 겨울에만 생산하고 판매합니다. 날씨에 따라 조금 일찍 끝날 수 있습니다.'],
  ['비린내가 나지 않나요?', '잘 마른 과메기는 비린내가 적고 고소합니다. 처음 드시는 분은 야채와 초장을 넉넉히 곁들여 보세요.'],
  ['선물로 다른 주소에 보낼 수 있나요?', '네. 주문하실 때 받는 분의 성함·주소·연락처를 알려주시면 바로 보내드립니다. 원하시면 메시지 카드도 넣어드립니다.'],
  ['배송 중 상하면 어떻게 하나요?', '받으신 날 사진과 함께 연락 주세요. 확인 후 재발송하거나 환불해 드립니다.'],
  ['여러 곳에 나눠 보낼 수 있나요?', '가능합니다. 주소별로 상품과 수량을 적어 문자나 카카오톡으로 보내주세요.'],
];

export default function Faq() {
  return (
    <section id="faq" className="section section-alt">
      <div className="wrap narrow">
        <div className="head center reveal">
          <p className="eyebrow">FAQ</p>
          <h2 className="title">자주 묻는 질문</h2>
        </div>
        <div className="faq reveal">
          {FAQ.map(([q, a]) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
