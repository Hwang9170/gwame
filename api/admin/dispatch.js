// 판매자: 발송일별 엑셀 다운로드(GET) / 택배사·판매자에게 지금 메일 보내기(POST)
import { body, fail, requireAdmin, route, send } from '../../server/http.js';
import { dispatchExcel, dispatchList, sendDispatch } from '../../server/orders.js';
import { SHOP } from '../../src/shop.js';

const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s || '');

export default route(['GET', 'POST'], async (req, res) => {
  requireAdmin(req);

  if (req.method === 'GET') {
    const date = new URL(req.url, 'http://x').searchParams.get('date');
    if (!isDate(date)) throw fail(400, '날짜가 필요해요.');
    const { ready } = await dispatchList(date);
    const file = await dispatchExcel(date, ready);
    const name = encodeURIComponent(`${SHOP.name}_${date}_발송목록_${ready.length}건.xlsx`);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${name}`);
    return res.end(file);
  }

  const { date } = body(req);
  if (!isDate(date)) throw fail(400, '날짜가 필요해요.');
  send(res, 200, await sendDispatch(date));
});
