import crypto from 'node:crypto';
import { env } from './env.js';

export function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

// 핸들러를 감싸 에러를 JSON으로 돌려주고, 허용 메서드를 검사합니다.
export function route(methods, fn) {
  return async (req, res) => {
    if (!methods.includes(req.method)) return send(res, 405, { error: '허용되지 않은 요청이에요.' });
    try {
      await fn(req, res);
    } catch (err) {
      console.error(err);
      if (!res.headersSent) send(res, err.status || 500, { error: err.message || '서버 오류가 났어요.' });
    }
  };
}

export const fail = (status, message) => Object.assign(new Error(message), { status });
export const body = (req) => (typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {});

/* ----- 판매자 로그인 (서명된 쿠키) ----- */
const COOKIE = 'gw_admin';
const secret = () => env.adminSecret || crypto.createHash('sha256').update('gw:' + env.adminPassword).digest('hex');
const sign = (v) => crypto.createHmac('sha256', secret()).update(v).digest('hex');

function safeEqual(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

export function checkPassword(pw) {
  if (!env.adminPassword) throw fail(500, '판매자 비밀번호(ADMIN_PASSWORD)가 설정되지 않았어요.');
  return safeEqual(pw || '', env.adminPassword);
}

export function setLoginCookie(res) {
  const exp = Date.now() + 7 * 24 * 3600 * 1000;
  const v = `${exp}.${sign(String(exp))}`;
  const secure = env.isVercel ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${COOKIE}=${v}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${7 * 24 * 3600}${secure}`);
}

export function clearLoginCookie(res) {
  res.setHeader('Set-Cookie', `${COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`);
}

export function isAdmin(req) {
  if (!env.adminPassword) return false;
  const raw = (req.headers.cookie || '').split(';').map((s) => s.trim()).find((s) => s.startsWith(COOKIE + '='));
  if (!raw) return false;
  const [exp, sig] = raw.slice(COOKIE.length + 1).split('.');
  return !!exp && !!sig && Number(exp) > Date.now() && safeEqual(sig, sign(exp));
}

export function requireAdmin(req) {
  if (!isAdmin(req)) throw fail(401, '로그인이 필요해요.');
}

// Vercel Cron은 Authorization: Bearer <CRON_SECRET> 를 보냅니다.
export function isCron(req) {
  return !!env.cronSecret && safeEqual(req.headers.authorization || '', `Bearer ${env.cronSecret}`);
}
