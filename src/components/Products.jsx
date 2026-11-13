import { useEffect, useRef, useState } from 'react';
import { PRODUCTS, won } from '../shop.js';

export default function Products({ onAdd }) {
  const listRef = useRef(null);
  const [active, setActive] = useState(0);

  // 모바일: BEST 상품이 가운데 오도록 시작
  useEffect(() => {
    const list = listRef.current;
    if (!list || !window.matchMedia('(max-width: 860px)').matches) return;
    const best = list.querySelector('.product.best');
    if (best) list.scrollLeft = best.offsetLeft - (list.clientWidth - best.offsetWidth) / 2;
  }, []);

  const onScroll = () => {
    const list = listRef.current;
    const center = list.scrollLeft + list.clientWidth / 2;
    let idx = 0;
    let min = Infinity;
    [...list.children].forEach((c, i) => {
      const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - center);
      if (d < min) { min = d; idx = i; }
    });
    setActive(idx);
  };

  return (
    <section id="products" className="section">
      <div className="wrap">
        <div className="head center reveal">
          <p className="eyebrow">PRODUCTS</p>
          <h2 className="title">이번 겨울 상품</h2>
          <p className="desc">모든 가격은 택배비 포함입니다. 제주·도서산간은 추가 요금이 있을 수 있습니다.</p>
        </div>
        <div className="products" ref={listRef} onScroll={onScroll}>
          {PRODUCTS.map((p) => (
            <article key={p.id} className={`product reveal${p.best ? ' best' : ''}`}>
              {p.best && <span className="ribbon">BEST</span>}
              <div className="pimg"><img src={p.img} alt={p.alt} loading="lazy" /></div>
              <div className="pbody">
                <h3>{p.name}</h3>
                <p className="pspec">{p.spec}</p>
                <ul className="pfeat">
                  {p.feats.map((f) => <li key={f}>{f}</li>)}
                </ul>
                <div className="pfoot">
                  <div className="pprice"><strong>{won(p.price)}</strong><small>택배비 포함</small></div>
                  <button
                    type="button"
                    className={`btn ${p.best ? 'btn-accent' : 'btn-dark'}`}
                    onClick={() => onAdd(p)}
                  >
                    담기
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="dots" aria-hidden="true">
          {PRODUCTS.map((p, i) => <span key={p.id} className={i === active ? 'on' : ''} />)}
        </div>
      </div>
    </section>
  );
}
