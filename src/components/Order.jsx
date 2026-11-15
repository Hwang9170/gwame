import { useMemo, useState } from 'react';
import { ADDONS, DELIVERY, PRODUCTS, SHOP, availableDates, fmtDate, won } from '../shop.js';

const ITEMS = [...PRODUCTS, ...ADDONS];
const isMobile = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
}

function QtyRow({ item, sub, qty, onChange }) {
  return (
    <div className={`qty-row${qty > 0 ? ' active' : ''}`}>
      <div>
        <div className="qname">{item.name}</div>
        <div className="qprice">{sub ? `${sub} · ` : ''}{won(item.price)}</div>
      </div>
      <div className="stepper">
        <button type="button" disabled={qty === 0} onClick={() => onChange(item.id, -1)} aria-label={`${item.name} 하나 빼기`}>−</button>
        <output aria-live="polite">{qty}</output>
        <button type="button" onClick={() => onChange(item.id, 1)} aria-label={`${item.name} 하나 더하기`}>+</button>
      </div>
    </div>
  );
}

export default function Order({ cart, onChangeQty, showToast }) {
  const [info, setInfo] = useState({ name: '', phone: '', address: '', memo: '' });
  const [dateKey, setDateKey] = useState('');
  const [msg, setMsg] = useState('');

  const dates = useMemo(() => availableDates(), []);
  const picked = dates.find((d) => d.key === dateKey);

  const total = ITEMS.reduce((s, p) => s + p.price * cart[p.id], 0);
  const hasMain = PRODUCTS.some((p) => cart[p.id] > 0);
  const line = (p) => `- ${p.name} ${cart[p.id]}개 (${won(p.price * cart[p.id])})`;

  const message = [
    `[${SHOP.name} 주문]`,
    ...PRODUCTS.filter((p) => cart[p.id] > 0).map(line),
    ...(ADDONS.some((a) => cart[a.id] > 0) ? ['[추가 옵션]', ...ADDONS.filter((a) => cart[a.id] > 0).map(line)] : []),
    `합계: ${won(total)}`,
    '',
    `받을 날짜: ${picked ? `${fmtDate(picked.receive)} (발송 ${fmtDate(picked.ship)})` : ''}`,
    `이름: ${info.name}`,
    `연락처: ${info.phone}`,
    `주소: ${info.address}`,
    ...(info.memo ? [`요청사항: ${info.memo}`] : []),
  ].join('\n');

  const smsHref = `sms:${SHOP.phone.replace(/-/g, '')}?&body=${encodeURIComponent(message)}`;

  const change = (id, delta) => { onChangeQty(id, delta); setMsg(''); };

  const validate = () => {
    if (!hasMain) return '과메기 상품을 하나 이상 골라주세요. (추가 옵션만은 주문할 수 없어요)';
    if (!picked) return '받으실 날짜를 골라주세요.';
    if (!info.name.trim() || !info.phone.trim() || !info.address.trim()) return '이름, 연락처, 주소를 모두 적어주세요.';
    return '';
  };

  const update = (e) => {
    setInfo((i) => ({ ...i, [e.target.name]: e.target.value }));
    setMsg('');
  };

  const copy = async (doneMsg) => {
    await copyText(message);
    setMsg(doneMsg);
    showToast('복사했어요');
  };

  const onSms = (e) => {
    const err = validate();
    if (err) { e.preventDefault(); setMsg(err); return; }
    if (!isMobile()) {
      e.preventDefault();
      copy('PC에서는 문자 앱이 열리지 않아요. 주문 내용을 복사했으니 카카오톡이나 문자로 붙여넣어 주세요.');
    }
  };

  const onCopy = () => {
    const err = validate();
    if (err) { setMsg(err); return; }
    copy('주문 내용을 복사했어요. 카카오톡이나 문자에 붙여넣어 주세요.');
  };

  return (
    <section id="order" className="section order">
      <div className="wrap">
        <div className="head center reveal">
          <p className="eyebrow light">ORDER</p>
          <h2 className="title">간편 주문</h2>
          <p className="desc">상품과 받을 날짜를 고르고 정보를 적으면 주문 문자가 자동으로 만들어집니다.</p>
        </div>

        <div className="order-wrap">
          <form className="order-form reveal" noValidate onSubmit={(e) => e.preventDefault()}>
            <h3>1. 상품 선택</h3>
            <div className="qty-list">
              {PRODUCTS.map((p) => <QtyRow key={p.id} item={p} qty={cart[p.id]} onChange={change} />)}
            </div>

            <h3>2. 추가 옵션 <em className="opt">(선택)</em></h3>
            <div className="qty-list addons">
              {ADDONS.map((a) => <QtyRow key={a.id} item={a} sub={a.unit} qty={cart[a.id]} onChange={change} />)}
            </div>

            <h3>3. 받으실 날짜</h3>
            {dates.length ? (
              <>
                <div className="date-list" role="radiogroup" aria-label="받으실 날짜">
                  {dates.map((d) => (
                    <button
                      key={d.key}
                      type="button"
                      role="radio"
                      aria-checked={d.key === dateKey}
                      className={`date-chip${d.key === dateKey ? ' on' : ''}`}
                      onClick={() => { setDateKey(d.key); setMsg(''); }}
                    >
                      <strong>{fmtDate(d.receive)}</strong>
                      <small>{fmtDate(d.ship)} 발송</small>
                    </button>
                  ))}
                </div>
                <p className="date-note">
                  고르신 날짜 전날 발송합니다. 발송 전날 오후 {DELIVERY.cutoffHour > 12 ? DELIVERY.cutoffHour - 12 : DELIVERY.cutoffHour}시에 주문을 마감해요.
                  택배사 사정이나 제주·도서산간 지역은 하루 이상 늦어질 수 있습니다.
                </p>
              </>
            ) : (
              <p className="date-note">지금은 고를 수 있는 날짜가 없어요. 전화로 문의해 주세요.</p>
            )}

            <h3>4. 받는 분 정보</h3>
            <div className="fields">
              <label><span>이름</span><input name="name" value={info.name} onChange={update} autoComplete="name" placeholder="홍길동" /></label>
              <label><span>연락처</span><input name="phone" value={info.phone} onChange={update} type="tel" inputMode="tel" autoComplete="tel" placeholder="010-1234-5678" /></label>
              <label className="full"><span>주소</span><input name="address" value={info.address} onChange={update} autoComplete="street-address" placeholder="도로명 주소와 상세 주소" /></label>
              <label className="full"><span>요청사항 <em>(선택)</em></span><input name="memo" value={info.memo} onChange={update} placeholder="예) 문 앞에 놓아주세요" /></label>
            </div>

            <div className="total">
              <span>합계</span>
              <strong>{won(total)}</strong>
            </div>
            <div className="order-btns">
              <a className="btn btn-accent" href={smsHref} onClick={onSms}>문자로 주문 보내기</a>
              <button className="btn btn-ghost" type="button" onClick={onCopy}>주문 내용 복사</button>
            </div>
            <p className="form-msg" role="status">{msg}</p>
          </form>

          <aside className="contact reveal">
            <a className="contact-card" href={`tel:${SHOP.phone}`}>
              <span className="clabel">전화 · 문자</span>
              <strong>{SHOP.phone}</strong>
              <small>{SHOP.hours}</small>
            </a>
            <a className="contact-card kakao" href={SHOP.kakaoUrl} target="_blank" rel="noopener noreferrer">
              <span className="clabel">카카오톡 채널</span>
              <strong>{SHOP.kakaoId}</strong>
              <small>채널 추가 후 메시지 주세요</small>
            </a>
            <div className="contact-card">
              <span className="clabel">입금 계좌</span>
              <strong>{SHOP.bank}</strong>
              <small>예금주 {SHOP.owner} · 입금 확인 후 발송</small>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
