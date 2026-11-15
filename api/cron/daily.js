// 매일 저녁(vercel.json의 crons) 자동 실행:
// 1) 내일 발송할 주문을 모아 판매자·택배사에 메일  2) 배송중인 주문의 배송 현황 갱신
import { isAdmin, isCron, route, send } from '../../server/http.js';
import { refreshDelivery, sendDispatch } from '../../server/orders.js';
import { getStore } from '../../server/store.js';
import { DELIVERY, kstToday, shiftYmd } from '../../src/shop.js';

export default route(['GET'], async (req, res) => {
  if (!isCron(req) && !isAdmin(req)) return send(res, 401, { error: '권한이 없어요.' });

  const tomorrow = shiftYmd(kstToday(), 1);
  const [y, m, d] = tomorrow.split('-').map(Number);
  const weekday = new Date(y, m - 1, d).getDay();
  const isShipDay = DELIVERY.shipWeekdays.includes(weekday) && !DELIVERY.closedDays.includes(tomorrow);

  const dispatch = isShipDay ? await sendDispatch(tomorrow) : { skipped: '내일은 발송일이 아님' };
  const delivery = await refreshDelivery(await getStore().inTransit());
  send(res, 200, { tomorrow, dispatch, delivery });
});
