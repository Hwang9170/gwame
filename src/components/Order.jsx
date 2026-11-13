import { useState } from 'react';
import { PRODUCTS, SHOP, won } from '../shop.js';

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

export default function Order({ cart, onChangeQty, showToast }) {
  const [info, setInfo] = useState({ name: '', phone: '', address: '', memo: '' });
  const [msg, setMsg] = useState('');

  const total = PRODUCTS.reduce((s, p) => s + p.price * cart[p.id], 0);
  const hasItems = PRODUCTS.some((p) => cart[p.id] > 0);

  const message = [
    `[${SHOP.name} 주문]`,
    ...PRODUCTS.filter((p) => cart[p.id] > 0).map(
      (p) => `- ${p.name} ${cart[p.id]}개 (${won(p.price * cart[p.id])})`
    ),
    `합계: ${won(total)}`,
    '',
    `이름: ${info.name}`,
    `연락처: ${info.phone}`,
    `주소: ${info.address}`,
    ...(info.memo ? [`요청사항: ${info.memo}`] : []),
  ].join('\n');

  const smsHref = `sms:${SHOP.phone.replace(/-/g, '')}?&body=${encodeURIComponent(message)}`;

  const validate = () => {
    if (!hasItems) return '상품을 하나 이상 골라주세요.';
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
          <p className="desc">수량을 고르고 정보를 적으면 주문 문자가 자동으로 만들어집니다.</p>
        </div>

        <div className="order-wrap">
          <form className="order-form reveal" noValidate onSubmit={(e) => e.preventDefault()}>
            <h3>1. 상품 선택</h3>
            <div className="qty-list">
              {PRODUCTS.map((p) => {
                const q = cart[p.id];
                return (
                  <div key={p.id} className={`qty-row${q > 0 ? ' active' : ''}`}>
                    <div>
                      <div className="qname">{p.name}</div>
                      <div className="qprice">{won(p.price)}</div>
                    </div>
                    <div className="stepper">
                      <button type="button" disabled={q === 0} onClick={() => { onChangeQty(p.id, -1); setMsg(''); }} aria-label={`${p.name} 하나 빼기`}>−</button>
                      <output aria-live="polite">{q}</output>
                      <button type="button" onClick={() => { onChangeQty(p.id, 1); setMsg(''); }} aria-label={`${p.name} 하나 더하기`}>+</button>
                    </div>
                  </div>
                );
              })}
            </div>

            <h3>2. 받는 분 정보</h3>
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
