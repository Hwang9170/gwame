/* ==========================================================
   가게 정보 — 이 파일만 고치면 사이트 전체에 반영됩니다.
   ========================================================== */
export const SHOP = {
  name: '바닷바람 과메기',
  owner: '홍길동',
  phone: '010-0000-0000',
  hours: '오전 8시 ~ 오후 8시',
  kakaoId: '@바닷바람과메기',
  kakaoUrl: 'https://pf.kakao.com/', // 카카오톡 채널 주소 (예: https://pf.kakao.com/_xxxxx)
  bank: '농협 000-0000-0000-00',
  address: '경북 포항시 남구 구룡포읍 (상세 주소)',
  bizNo: '000-00-00000',
  mailOrderNo: '제0000-경북포항-0000호',
};

// 가격은 예시입니다. 실제 가격으로 바꿔주세요.
export const PRODUCTS = [
  {
    id: 'single',
    name: '손질 과메기 단품',
    price: 29000,
    spec: '꽁치 20미 · 약 40쪽 · 2~3인분',
    img: 'images/plate.svg',
    alt: '접시에 둥글게 담은 손질 과메기와 초장',
    feats: ['껍질·뼈 손질 완료', '초장 1개 포함', '야채는 따로 준비하실 분께'],
  },
  {
    id: 'set',
    name: '과메기 야채 세트',
    price: 39000,
    spec: '꽁치 20미 + 야채 전부 · 2~3인분',
    img: 'images/set.svg',
    alt: '도마 위에 과메기, 배추, 미역, 김, 쪽파, 마늘, 고추, 초장을 함께 차린 야채 세트',
    feats: ['배추·미역·김·쪽파·마늘·고추', '초장 포함, 바로 드시면 됩니다', '가장 많이 찾으시는 구성'],
    best: true,
  },
  {
    id: 'gift',
    name: '과메기 선물 세트',
    price: 69000,
    spec: '꽁치 40미 + 야채 전부 · 4~6인분',
    img: 'images/gift.svg',
    alt: '금색 끈으로 묶은 붉은 과메기 선물 상자',
    feats: ['선물용 상자 포장', '넉넉한 양으로 온 가족이', '받는 분 주소로 바로 발송'],
  },
];

// 추가 옵션 — 가격은 예시입니다.
export const ADDONS = [
  { id: 'gim', name: '김 추가', unit: '1봉 (10장)', price: 3000 },
  { id: 'veg', name: '야채 추가', unit: '배추·미역·쪽파 2인분', price: 5000 },
  { id: 'garlic', name: '마늘·고추 추가', unit: '1팩', price: 2000 },
  { id: 'sauce', name: '초장 추가', unit: '1개', price: 1000 },
];

/* ==========================================================
   배송 일정 규칙
   - 손님은 "받을 날짜"를 고르고, 그 전날 발송합니다.
   - 발송 전날 CUTOFF_HOUR시에 그날 보낼 주문을 마감·종합합니다.
   ========================================================== */
export const DELIVERY = {
  shipWeekdays: [1, 2, 3, 4], // 발송 요일: 월~목 (신선식품이라 금·토 발송은 하지 않음 → 화~금 도착)
  cutoffHour: 18,             // 발송 전날 오후 6시 마감
  daysAhead: 21,              // 오늘부터 며칠 뒤까지 고를 수 있는지
  seasonEnd: '2027-02-28',    // 판매 마감일 (이후 날짜는 선택 불가)
  // 발송하지 않는 날 (공휴일, 휴무일). 'YYYY-MM-DD' 형식으로 추가하세요.
  closedDays: ['2026-12-25', '2027-01-01'],
};

const pad = (n) => String(n).padStart(2, '0');
export const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
export const fmtDate = (d) => `${d.getMonth() + 1}/${d.getDate()} (${'일월화수목금토'[d.getDay()]})`;

// 고를 수 있는 받을 날짜 목록: [{ key, receive, ship }]
export function availableDates(now = new Date()) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const out = [];
  for (let i = 2; i <= DELIVERY.daysAhead; i++) {
    const receive = addDays(today, i);
    const ship = addDays(receive, -1);
    if (ymd(receive) > DELIVERY.seasonEnd) break;
    if (!DELIVERY.shipWeekdays.includes(ship.getDay())) continue;
    if (DELIVERY.closedDays.includes(ymd(ship))) continue;
    const cutoff = addDays(ship, -1);
    cutoff.setHours(DELIVERY.cutoffHour);
    if (now >= cutoff) continue;
    out.push({ key: ymd(receive), receive, ship });
  }
  return out;
}

export const won = (n) => n.toLocaleString('ko-KR') + '원';
