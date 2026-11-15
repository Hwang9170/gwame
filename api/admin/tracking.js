// 판매자: 택배사 송장 엑셀 올리기 / 배송 현황 새로고침
import { body, fail, requireAdmin, route, send } from '../../server/http.js';
import { parseTrackingExcel, refreshDelivery, setTracking } from '../../server/orders.js';
import { getStore } from '../../server/store.js';

export default route(['POST'], async (req, res) => {
  requireAdmin(req);
  const b = body(req);

  if (b.refresh) {
    const orders = await getStore().inTransit();
    return send(res, 200, await refreshDelivery(orders));
  }

  if (!b.fileBase64) throw fail(400, '엑셀 파일이 필요해요.');
  let pairs;
  try {
    pairs = await parseTrackingExcel(Buffer.from(b.fileBase64, 'base64'));
  } catch {
    throw fail(400, '엑셀(.xlsx) 파일을 읽지 못했어요.');
  }
  if (!pairs.length) throw fail(400, "엑셀에서 '주문번호'와 '운송장번호' 칸을 찾지 못했어요.");

  const results = [];
  for (const { id, no } of pairs) {
    try {
      const r = await setTracking(id, no);
      results.push({ id, no, ok: true, notified: r.notified });
    } catch (err) {
      results.push({ id, no, ok: false, error: err.message });
    }
  }
  send(res, 200, { results });
});
