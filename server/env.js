// 서버 환경변수. 값은 Vercel 프로젝트 설정(또는 로컬 .env.local)에 넣습니다. 목록은 .env.example 참고.
const e = (k) => (process.env[k] || '').trim();

export const env = {
  isVercel: !!process.env.VERCEL,
  siteUrl: e('SITE_URL') || 'https://gwame.vercel.app',

  adminPassword: e('ADMIN_PASSWORD'),
  adminSecret: e('ADMIN_SECRET'),
  cronSecret: e('CRON_SECRET'),

  supabaseUrl: e('SUPABASE_URL'),
  supabaseKey: e('SUPABASE_SERVICE_ROLE_KEY'),

  solapiKey: e('SOLAPI_API_KEY'),
  solapiSecret: e('SOLAPI_API_SECRET'),
  smsFrom: e('SMS_FROM'),            // 솔라피에 등록한 발신번호
  sellerPhone: e('SELLER_PHONE'),    // 새 주문 알림 받을 번호

  resendKey: e('RESEND_API_KEY'),
  mailFrom: e('MAIL_FROM'),          // 예: 바닷바람 과메기 <order@내도메인.com>
  sellerEmail: e('SELLER_EMAIL'),
  courierEmail: e('COURIER_EMAIL'),  // 택배 대리점 이메일 (쉼표로 여러 개)

  sweetKey: e('SWEETTRACKER_KEY'),   // 스마트택배 배송조회 API 키
};
