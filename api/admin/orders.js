// 판매자: 주문 조회·상태 변경
import { body, fail, requireAdmin, route, send } from '../../server/http.js';
import { setTracking } from '../../server/orders.js';
import { getStore } from '../../server/store.js';
import { shiftYmd } from '../../src/shop.js';

export default route(['GET', 'PATCH'], async (req, res) => {
  requireAdmin(req);
  const store = getStore();

  if (req.method === 'GET') {
    // ?month=2026-11 → 그 달(앞뒤 1주 포함) 발송일의 주문 전부
    const url = new URL(req.url, 'http://x');
    const month = url.searchParams.get('month') || '';
    if (!/^\d{4}-\d{2}$/.test(month)) throw fail(400, 'month 값이 필요해요. 예) 2026-11');
    const from = shiftYmd(`${month}-01`, -7);
    const to = shiftYmd(`${month}-28`, 14);
    const orders = await store.byShipRange(from, to);
    return send(res, 200, { orders });
  }

  const { id, action, trackingNo } = body(req);
  const o = await store.get(id);
  if (!o) throw fail(404, '주문을 찾을 수 없어요.');
  const now = new Date().toISOString();

  if (action === 'tracking') {
    const r = await setTracking(id, trackingNo);
    return send(res, 200, r);
  }
  const patches = {
    paid: { status: 'paid', paid_at: now },
    unpaid: { status: 'pending', paid_at: null },
    cancel: { status: 'cancelled' },
    restore: { status: o.paid_at ? 'paid' : 'pending' },
  };
  if (!patches[action]) throw fail(400, '알 수 없는 작업이에요.');
  if (action === 'paid' && o.status !== 'pending') throw fail(400, '입금 대기 상태가 아니에요.');
  const order = await store.update(id, patches[action]);
  send(res, 200, { order });
});
