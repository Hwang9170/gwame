import crypto from 'node:crypto';
import ExcelJS from 'exceljs';
import {
  ALL_ITEMS, COURIER, PRODUCTS, SHOP, availableDates, fmtDate, kstNow, won,
} from '../src/shop.js';
import { env } from './env.js';
import { fail } from './http.js';
import { sendMail, sendSms } from './notify.js';
import { getStore } from './store.js';

const clean = (s, max) => String(s ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max);
const toDate = (key) => { const [y, m, d] = key.split('-').map(Number); return new Date(y, m - 1, d); };
export const dateLabel = (key) => fmtDate(toDate(key));

export function itemsText(items, sep = ', ') {
  return items.map((i) => `${i.name} ${i.qty}개`).join(sep);
}

/* ===== 주문 생성 (손님) ===== */
export async function createOrder(input) {
  const qty = input.items || {};
  const items = ALL_ITEMS
    .map((p) => ({ id: p.id, name: p.name, price: p.price, qty: Math.floor(Number(qty[p.id]) || 0) }))
    .filter((i) => i.qty > 0);
  if (items.some((i) => i.qty > 99)) throw fail(400, '수량이 너무 많아요. 전화로 문의해 주세요.');
  if (!items.some((i) => PRODUCTS.find((p) => p.id === i.id))) throw fail(400, '과메기 상품을 하나 이상 골라주세요.');

  const date = availableDates().find((d) => d.key === input.receiveDate);
  if (!date) throw fail(400, '고르신 날짜는 이제 주문할 수 없어요. 다른 날짜를 골라주세요.');

  const name = clean(input.name, 40);
  const phone = clean(input.phone, 20);
  const address = clean(input.address, 200);
  const memo = clean(input.memo, 200);
  if (!name || !address) throw fail(400, '이름과 주소를 적어주세요.');
  if (!/^0\d{1,2}-?\d{3,4}-?\d{4}$/.test(phone.replace(/\s/g, ''))) throw fail(400, '연락처를 확인해 주세요. 예) 010-1234-5678');
  if (!input.agree) throw fail(400, '개인정보 수집·이용에 동의해 주세요.');

  const k = kstNow();
  const id = `GW${String(k.getFullYear()).slice(2)}${String(k.getMonth() + 1).padStart(2, '0')}${String(k.getDate()).padStart(2, '0')}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  const order = {
    id,
    created_at: new Date().toISOString(),
    status: 'pending',
    items,
    total: items.reduce((s, i) => s + i.price * i.qty, 0),
    receive_date: date.key,
    ship_date: date.shipKey,
    name, phone, address, memo,
    tracking_no: null,
    delivery_status: null,
    delivery_detail: null,
    delivery_checked_at: null,
    paid_at: null,
    shipped_at: null,
    tracking_notified_at: null,
  };
  const saved = await getStore().create(order);

  // 손님에게 입금 안내, 판매자에게 새 주문 알림 (실패해도 주문은 유지)
  const buyer = await sendSms(phone, [
    `[${SHOP.name}] 주문이 접수되었습니다.`,
    `주문번호 ${id}`,
    itemsText(items),
    `받으실 날짜: ${dateLabel(date.key)}`,
    `입금하실 금액: ${won(order.total)}`,
    `${SHOP.bank} (예금주 ${SHOP.owner})`,
    `발송 전날 오후 6시까지 입금해 주세요.`,
  ].join('\n'));
  await sendSms(env.sellerPhone, `[새 주문] ${name} ${won(order.total)} / ${dateLabel(date.key)} 도착 / ${itemsText(items)}`);

  return { order: saved, buyerNotified: buyer.sent };
}

/* ===== 발송 목록 (택배사 업로드용 엑셀) ===== */
export async function dispatchList(shipKey) {
  const rows = await getStore().byShipRange(shipKey, shipKey);
  return {
    ready: rows.filter((r) => r.status === 'paid' || r.status === 'shipped'),
    unpaid: rows.filter((r) => r.status === 'pending'),
  };
}

export function prepTotals(orders) {
  const t = {};
  orders.forEach((o) => o.items.forEach((i) => { t[i.name] = (t[i.name] || 0) + i.qty; }));
  return ALL_ITEMS.filter((p) => t[p.name]).map((p) => ({ name: p.name, qty: t[p.name] }));
}

// 택배사마다 업로드 양식이 다릅니다. 대리점 양식을 받으면 COLUMNS 순서·이름만 맞추면 됩니다.
const COLUMNS = [
  ['주문번호', (o) => o.id],
  ['받는분', (o) => o.name],
  ['받는분 전화', (o) => o.phone],
  ['받는분 주소', (o) => o.address],
  ['품목', (o) => itemsText(o.items)],
  ['박스 수', () => 1],
  ['배송메시지', (o) => o.memo || ''],
  ['받을 날짜', (o) => o.receive_date],
  ['보내는분', () => SHOP.name],
  ['보내는분 전화', () => SHOP.phone],
  ['보내는분 주소', () => SHOP.address],
  ['운송장번호', (o) => o.tracking_no || ''],
];

export async function dispatchExcel(shipKey, orders) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(`${shipKey} 발송`);
  ws.addRow(COLUMNS.map(([h]) => h));
  orders.forEach((o) => ws.addRow(COLUMNS.map(([, f]) => f(o))));
  ws.getRow(1).font = { bold: true };
  ws.columns.forEach((c, i) => { c.width = [16, 10, 15, 45, 40, 8, 25, 12, 16, 15, 35, 16][i] || 14; });
  ws.views = [{ state: 'frozen', ySplit: 1 }];

  const sum = wb.addWorksheet('준비 수량');
  sum.addRow(['품목', '수량']);
  prepTotals(orders).forEach((p) => sum.addRow([p.name, p.qty]));
  sum.getRow(1).font = { bold: true };
  sum.columns = [{ width: 20 }, { width: 8 }];

  return Buffer.from(await wb.xlsx.writeBuffer());
}

/** 발송 전날: 그날 보낼 주문을 모아 판매자·택배사에 메일 */
export async function sendDispatch(shipKey) {
  const { ready, unpaid } = await dispatchList(shipKey);
  const file = await dispatchExcel(shipKey, ready);
  const filename = `${SHOP.name}_${shipKey}_발송목록_${ready.length}건.xlsx`;
  const prep = prepTotals(ready).map((p) => `${p.name} ${p.qty}개`).join(', ') || '없음';
  const subject = `[${SHOP.name}] ${dateLabel(shipKey)} 발송 ${ready.length}건`;
  const html = `
    <p>${dateLabel(shipKey)} 발송 주문 <b>${ready.length}건</b>입니다. 첨부 엑셀을 확인해 주세요.</p>
    <p>준비 수량: ${prep}</p>
    ${unpaid.length ? `<p style="color:#c0502f">입금 대기 ${unpaid.length}건은 목록에서 빠져 있습니다.</p>` : ''}
    <p>운송장번호가 나오면 이 엑셀의 '운송장번호' 칸을 채워 회신해 주세요.</p>`;

  const toCourier = ready.length
    ? await sendMail({ to: env.courierEmail, subject, html, attachments: [{ filename, content: file }] })
    : { sent: false, reason: '발송할 주문 없음' };
  const toSeller = await sendMail({ to: env.sellerEmail, subject, html, attachments: [{ filename, content: file }] });
  await sendSms(env.sellerPhone, `[${SHOP.name}] 내일(${dateLabel(shipKey)}) 발송 ${ready.length}건${unpaid.length ? `, 입금대기 ${unpaid.length}건` : ''}\n준비: ${prep}`);

  return { count: ready.length, unpaid: unpaid.length, courier: toCourier, seller: toSeller };
}

/* ===== 송장번호 등록 → 손님에게 알림 ===== */
export async function setTracking(id, trackingNo) {
  const store = getStore();
  const o = await store.get(id);
  if (!o) throw fail(404, `주문 ${id}을(를) 찾을 수 없어요.`);
  const no = String(trackingNo || '').replace(/[^0-9A-Za-z]/g, '');
  if (!no) throw fail(400, '송장번호를 확인해 주세요.');
  if (o.status === 'cancelled') throw fail(400, '취소된 주문이에요.');

  const changed = o.tracking_no !== no;
  let updated = await store.update(id, {
    tracking_no: no,
    status: o.status === 'delivered' ? 'delivered' : 'shipped',
    shipped_at: o.shipped_at || new Date().toISOString(),
  });

  let notified = !!o.tracking_notified_at && !changed;
  if (changed || !o.tracking_notified_at) {
    const r = await sendSms(o.phone, [
      `[${SHOP.name}] 주문하신 과메기를 보내드렸습니다.`,
      `${COURIER.name} 송장번호 ${no}`,
      `받으실 날짜: ${dateLabel(o.receive_date)}`,
      `배송조회: ${COURIER.trackingUrl(no)}`,
    ].join('\n'));
    notified = r.sent;
    if (r.sent) updated = await store.update(id, { tracking_notified_at: new Date().toISOString() });
  }
  return { order: updated, notified };
}

// 택배사가 돌려준 엑셀에서 (주문번호, 송장번호) 쌍을 찾아냅니다.
export async function parseTrackingExcel(buffer) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);
  const pairs = [];
  wb.eachSheet((ws) => {
    let idCol = 0;
    let noCol = 0;
    ws.eachRow((row) => {
      const cells = row.values.map((v) => String(v?.text ?? v?.result ?? v ?? '').trim());
      if (!idCol || !noCol) {
        cells.forEach((c, i) => {
          if (/주문번호|고객주문/.test(c)) idCol = idCol || i;
          if (/운송장|송장/.test(c)) noCol = noCol || i;
        });
        return;
      }
      const id = cells[idCol];
      const no = cells[noCol].replace(/[^0-9A-Za-z]/g, '');
      if (/^GW\d{6}-[0-9A-F]{6}$/.test(id) && no) pairs.push({ id, no });
    });
  });
  return pairs;
}

/* ===== 배송 현황 자동 조회 (스마트택배 API) ===== */
const LEVELS = { 1: '배송 준비중', 2: '집하 완료', 3: '배송중', 4: '지점 도착', 5: '배송 출발', 6: '배송 완료' };

export async function refreshDelivery(orders) {
  if (!env.sweetKey) return { checked: 0, reason: '배송조회 설정(스마트택배 키) 전' };
  const store = getStore();
  let checked = 0;
  for (const o of orders) {
    if (!o.tracking_no || o.status === 'cancelled') continue;
    const url = `https://info.sweettracker.co.kr/api/v1/trackingInfo?t_key=${encodeURIComponent(env.sweetKey)}&t_code=${COURIER.sweetCode}&t_invoice=${encodeURIComponent(o.tracking_no)}`;
    try {
      const r = await fetch(url);
      const j = await r.json();
      if (j.status === false) {
        await store.update(o.id, { delivery_detail: j.msg || '조회 실패', delivery_checked_at: new Date().toISOString() });
        continue;
      }
      const last = j.lastDetail || {};
      const done = j.complete === true || Number(j.level) === 6;
      await store.update(o.id, {
        delivery_status: LEVELS[j.level] || last.kind || '확인중',
        delivery_detail: [last.timeString, last.where, last.kind].filter(Boolean).join(' · '),
        delivery_checked_at: new Date().toISOString(),
        ...(done ? { status: 'delivered' } : {}),
      });
      checked++;
    } catch (err) {
      console.error('배송조회 실패', o.id, err);
    }
  }
  return { checked };
}
