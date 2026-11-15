import { useCallback, useEffect, useMemo, useState } from 'react';
import { COURIER, ORDER_STATUS, SHOP, fmtDate, kstToday, shiftYmd, won } from '../shop.js';
import './admin.css';

const api = async (url, opts = {}) => {
  const r = await fetch(url, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(j.error || `요청 실패 (${r.status})`), { status: r.status });
  return j;
};

const toDate = (key) => { const [y, m, d] = key.split('-').map(Number); return new Date(y, m - 1, d); };
const label = (key) => fmtDate(toDate(key));
const ACTIVE = (o) => o.status !== 'cancelled';

export default function Admin() {
  const [loggedIn, setLoggedIn] = useState(null);
  useEffect(() => {
    document.title = `판매자 관리 | ${SHOP.name}`;
    api('/api/admin/login').then((j) => setLoggedIn(j.loggedIn)).catch(() => setLoggedIn(false));
  }, []);
  if (loggedIn === null) return <div className="adm-loading">불러오는 중…</div>;
  return loggedIn ? <Dashboard onLogout={() => setLoggedIn(false)} /> : <Login onDone={() => setLoggedIn(true)} />;
}

function Login({ onDone }) {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      await api('/api/admin/login', { method: 'POST', body: { password: pw } });
      onDone();
    } catch (x) {
      setErr(x.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="adm-login">
      <form onSubmit={submit}>
        <h1>{SHOP.name}<small>판매자 관리</small></h1>
        <label>
          <span>비밀번호</span>
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" autoFocus />
        </label>
        <button className="adm-btn primary" disabled={busy || !pw}>{busy ? '확인 중…' : '로그인'}</button>
        {err && <p className="adm-err">{err}</p>}
      </form>
    </div>
  );
}

function Dashboard({ onLogout }) {
  const today = kstToday();
  const [month, setMonth] = useState(today.slice(0, 7));
  const [selected, setSelected] = useState(shiftYmd(today, 1));
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null); // { type: 'ok'|'err', text }

  const say = (text, type = 'ok') => setNotice({ text, type, at: Date.now() });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const j = await api(`/api/admin/orders?month=${month}`);
      setOrders(j.orders);
    } catch (x) {
      if (x.status === 401) return onLogout();
      say(x.message, 'err');
    } finally {
      setLoading(false);
    }
  }, [month, onLogout]);

  useEffect(() => { load(); }, [load]);

  const replace = (o) => setOrders((list) => list.map((x) => (x.id === o.id ? o : x)));

  const logout = async () => {
    await api('/api/admin/login', { method: 'DELETE' }).catch(() => {});
    onLogout();
  };

  return (
    <div className="adm">
      <header className="adm-top">
        <div>
          <strong>{SHOP.name}</strong> <span>판매자 관리</span>
        </div>
        <div className="adm-top-actions">
          <a href="/" target="_blank" rel="noreferrer">사이트 보기</a>
          <button onClick={logout}>로그아웃</button>
        </div>
      </header>

      {notice && (
        <div className={`adm-notice ${notice.type}`} role="status">
          <span>{notice.text}</span>
          <button onClick={() => setNotice(null)} aria-label="닫기">×</button>
        </div>
      )}

      <main className="adm-main">
        <Calendar
          month={month}
          setMonth={setMonth}
          orders={orders}
          selected={selected}
          onSelect={(k) => {
            setSelected(k);
            if (window.innerWidth <= 900) {
              setTimeout(() => document.querySelector('.adm-day')?.scrollIntoView({ behavior: 'smooth' }), 0);
            }
          }}
          today={today}
          loading={loading}
        />
        <DayPanel
          date={selected}
          orders={orders.filter((o) => o.ship_date === selected)}
          replace={replace}
          reload={load}
          say={say}
        />
      </main>
    </div>
  );
}

/* ===== 달력: 발송일별 주문 건수 ===== */
function Calendar({ month, setMonth, orders, selected, onSelect, today, loading }) {
  const [y, m] = month.split('-').map(Number);
  const first = new Date(y, m - 1, 1);
  const days = new Date(y, m, 0).getDate();
  const cells = [...Array(first.getDay()).fill(null), ...Array.from({ length: days }, (_, i) => `${month}-${String(i + 1).padStart(2, '0')}`)];

  const byDate = useMemo(() => {
    const map = {};
    orders.filter(ACTIVE).forEach((o) => {
      const d = (map[o.ship_date] ||= { total: 0, pending: 0 });
      d.total++;
      if (o.status === 'pending') d.pending++;
    });
    return map;
  }, [orders]);

  const move = (n) => {
    const d = new Date(y, m - 1 + n, 1);
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };
  const monthTotal = Object.entries(byDate).filter(([k]) => k.startsWith(month)).reduce((s, [, v]) => s + v.total, 0);

  return (
    <section className="adm-card adm-cal">
      <div className="adm-cal-head">
        <button onClick={() => move(-1)} aria-label="이전 달">‹</button>
        <h2>{y}년 {m}월 <small>발송 {monthTotal}건{loading ? ' · 불러오는 중' : ''}</small></h2>
        <button onClick={() => move(1)} aria-label="다음 달">›</button>
      </div>
      <div className="adm-cal-grid">
        {'일월화수목금토'.split('').map((w) => <div key={w} className="wd">{w}</div>)}
        {cells.map((key, i) => {
          if (!key) return <div key={`e${i}`} />;
          const info = byDate[key];
          return (
            <button
              key={key}
              className={`day${key === selected ? ' sel' : ''}${key === today ? ' today' : ''}${info ? ' has' : ''}`}
              onClick={() => onSelect(key)}
            >
              <span className="n">{Number(key.slice(8))}</span>
              {info && <span className="cnt">{info.total}건</span>}
              {info?.pending > 0 && <span className="pend">입금대기 {info.pending}</span>}
            </button>
          );
        })}
      </div>
      <p className="adm-hint">날짜는 <b>발송일</b> 기준입니다. 손님은 다음 날 받습니다.</p>
    </section>
  );
}

/* ===== 선택한 발송일의 주문 ===== */
const FILTERS = [
  ['all', '전체'],
  ['pending', '입금대기'],
  ['paid', '발송준비'],
  ['shipped', '발송완료'],
  ['delivered', '배송완료'],
  ['cancelled', '취소'],
];

function DayPanel({ date, orders, replace, reload, say }) {
  const [filter, setFilter] = useState('all');
  const [busy, setBusy] = useState('');

  const active = orders.filter(ACTIVE);
  const count = (s) => orders.filter((o) => o.status === s).length;
  const shown = orders.filter((o) => (filter === 'all' ? ACTIVE(o) : o.status === filter));
  const prep = {};
  active.filter((o) => o.status !== 'pending').forEach((o) => o.items.forEach((i) => { prep[i.name] = (prep[i.name] || 0) + i.qty; }));

  const sendMail = async () => {
    if (!confirm(`${label(date)} 발송 목록을 택배사와 판매자 이메일로 지금 보낼까요?`)) return;
    setBusy('mail');
    try {
      const r = await api('/api/admin/dispatch', { method: 'POST', body: { date } });
      const why = (x) => (x.sent ? '보냄' : `안 보냄(${x.reason})`);
      say(`발송 ${r.count}건 · 택배사 메일 ${why(r.courier)} · 판매자 메일 ${why(r.seller)}`, r.courier.sent ? 'ok' : 'err');
    } catch (x) { say(x.message, 'err'); } finally { setBusy(''); }
  };

  const upload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy('upload');
    try {
      const b64 = await new Promise((ok, no) => {
        const fr = new FileReader();
        fr.onload = () => ok(String(fr.result).split(',')[1]);
        fr.onerror = no;
        fr.readAsDataURL(file);
      });
      const { results } = await api('/api/admin/tracking', { method: 'POST', body: { fileBase64: b64 } });
      const ok = results.filter((r) => r.ok);
      const sms = ok.filter((r) => r.notified).length;
      const bad = results.filter((r) => !r.ok);
      say(`송장 ${ok.length}건 등록, 손님 문자 ${sms}건 발송${bad.length ? ` · 실패 ${bad.length}건: ${bad.map((b) => `${b.id}(${b.error})`).join(', ')}` : ''}`, bad.length ? 'err' : 'ok');
      reload();
    } catch (x) { say(x.message, 'err'); } finally { setBusy(''); }
  };

  const refresh = async () => {
    setBusy('refresh');
    try {
      const r = await api('/api/admin/tracking', { method: 'POST', body: { refresh: true } });
      say(r.reason ? `배송현황을 조회하지 못했어요: ${r.reason}` : `배송현황 ${r.checked}건 갱신`, r.reason ? 'err' : 'ok');
      reload();
    } catch (x) { say(x.message, 'err'); } finally { setBusy(''); }
  };

  return (
    <section className="adm-card adm-day">
      <div className="adm-day-head">
        <div>
          <h2>{label(date)} 발송</h2>
          <p>손님 도착 {label(shiftYmd(date, 1))}</p>
        </div>
        <div className="adm-stats">
          <span><b>{active.length}</b>전체</span>
          <span className="warn"><b>{count('pending')}</b>입금대기</span>
          <span><b>{count('paid')}</b>발송준비</span>
          <span><b>{count('shipped') + count('delivered')}</b>발송완료</span>
        </div>
      </div>

      {Object.keys(prep).length > 0 && (
        <div className="adm-prep">
          <span>준비 수량</span>
          {Object.entries(prep).map(([n, q]) => <em key={n}>{n} <b>{q}</b></em>)}
        </div>
      )}

      <div className="adm-actions">
        <a className="adm-btn" href={`/api/admin/dispatch?date=${date}`}>엑셀 다운로드</a>
        <button className="adm-btn" onClick={sendMail} disabled={!!busy}>{busy === 'mail' ? '보내는 중…' : '택배사에 메일 보내기'}</button>
        <label className={`adm-btn${busy ? ' disabled' : ''}`}>
          {busy === 'upload' ? '올리는 중…' : '송장 엑셀 올리기'}
          <input type="file" accept=".xlsx" hidden onChange={upload} disabled={!!busy} />
        </label>
        <button className="adm-btn" onClick={refresh} disabled={!!busy}>{busy === 'refresh' ? '조회 중…' : '배송현황 새로고침'}</button>
      </div>

      <div className="adm-filters" role="tablist">
        {FILTERS.map(([k, t]) => {
          const n = k === 'all' ? active.length : count(k);
          return (
            <button key={k} role="tab" aria-selected={filter === k} className={filter === k ? 'on' : ''} onClick={() => setFilter(k)}>
              {t} {n > 0 && <span>{n}</span>}
            </button>
          );
        })}
      </div>

      {shown.length ? (
        <ul className="adm-orders">
          {shown.map((o) => <OrderCard key={o.id} o={o} replace={replace} say={say} />)}
        </ul>
      ) : (
        <p className="adm-empty">이 날짜에 해당하는 주문이 없어요.</p>
      )}
    </section>
  );
}

function OrderCard({ o, replace, say }) {
  const [no, setNo] = useState(o.tracking_no || '');
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);

  const act = async (action, extra = {}) => {
    setBusy(true);
    try {
      const r = await api('/api/admin/orders', { method: 'PATCH', body: { id: o.id, action, ...extra } });
      replace(r.order);
      if (action === 'tracking') {
        setEditing(false);
        say(r.notified ? `${o.name}님께 송장번호 문자를 보냈어요.` : `송장은 저장했지만 문자는 보내지 못했어요 (문자 설정 확인).`, r.notified ? 'ok' : 'err');
      }
    } catch (x) { say(x.message, 'err'); } finally { setBusy(false); }
  };

  const showTrackingInput = o.status === 'paid' || editing;

  return (
    <li className={`adm-order st-${o.status}`}>
      <div className="row1">
        <strong>{o.name}</strong>
        <span className={`badge st-${o.status}`}>{ORDER_STATUS[o.status]}</span>
        <span className="oid">{o.id}</span>
      </div>
      <div className="items">{o.items.map((i) => `${i.name} ${i.qty}`).join(' · ')} <b>{won(o.total)}</b></div>
      <div className="addr">
        <a href={`tel:${o.phone}`}>{o.phone}</a> · {o.address}
        {o.memo && <em> · “{o.memo}”</em>}
      </div>

      {o.tracking_no && !editing && (
        <div className="trk">
          {COURIER.name} <a href={COURIER.trackingUrl(o.tracking_no)} target="_blank" rel="noreferrer">{o.tracking_no}</a>
          {o.delivery_status && <span className="dst">{o.delivery_status}</span>}
          {o.delivery_detail && <small>{o.delivery_detail}</small>}
          {!o.tracking_notified_at && <small className="warn">손님 문자 미발송</small>}
        </div>
      )}

      <div className="acts">
        {o.status === 'pending' && (
          <>
            <button className="adm-btn primary" disabled={busy} onClick={() => act('paid')}>입금 확인</button>
            <button className="adm-btn ghost" disabled={busy} onClick={() => confirm(`${o.name}님 주문을 취소할까요?`) && act('cancel')}>주문 취소</button>
          </>
        )}
        {showTrackingInput && (
          <form className="trk-form" onSubmit={(e) => { e.preventDefault(); act('tracking', { trackingNo: no }); }}>
            <input value={no} onChange={(e) => setNo(e.target.value)} placeholder="송장번호" inputMode="numeric" />
            <button className="adm-btn primary" disabled={busy || !no.trim()}>송장 등록 · 문자</button>
            {editing && <button type="button" className="adm-btn ghost" onClick={() => setEditing(false)}>닫기</button>}
          </form>
        )}
        {o.status === 'paid' && !editing && (
          <button className="adm-btn ghost" disabled={busy} onClick={() => act('unpaid')}>입금 확인 취소</button>
        )}
        {(o.status === 'shipped' || o.status === 'delivered') && !editing && (
          <button className="adm-btn ghost" onClick={() => setEditing(true)}>송장 수정</button>
        )}
        {o.status === 'cancelled' && (
          <button className="adm-btn ghost" disabled={busy} onClick={() => act('restore')}>취소 되돌리기</button>
        )}
      </div>
    </li>
  );
}
