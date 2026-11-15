// 손님 주문 접수
import { body, route, send } from '../server/http.js';
import { createOrder } from '../server/orders.js';

export default route(['POST'], async (req, res) => {
  const { order, buyerNotified } = await createOrder(body(req));
  send(res, 201, {
    id: order.id,
    total: order.total,
    receiveDate: order.receive_date,
    shipDate: order.ship_date,
    buyerNotified,
  });
});
