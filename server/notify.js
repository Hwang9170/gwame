// 문자(솔라피)와 이메일(Resend) 발송. 설정이 없으면 보내지 않고 로그만 남깁니다.
import crypto from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { env } from './env.js';

async function devOutbox(kind, payload) {
  if (env.isVercel) return;
  const dir = path.join(process.cwd(), '.data');
  await fs.mkdir(dir, { recursive: true });
  const line = `[${new Date().toISOString()}] ${kind} ${JSON.stringify(payload)}\n`;
  await fs.appendFile(path.join(dir, 'outbox.log'), line);
}

const digits = (s) => String(s || '').replace(/\D/g, '');

/** 문자 발송. 반환: { sent: boolean, reason?: string } */
export async function sendSms(to, text) {
  const target = digits(to);
  if (!target) return { sent: false, reason: '받는 번호 없음' };
  if (!env.solapiKey || !env.solapiSecret || !env.smsFrom) {
    await devOutbox('SMS(미설정)', { to: target, text });
    return { sent: false, reason: '문자 발송 설정(솔라피) 전' };
  }
  const date = new Date().toISOString();
  const salt = crypto.randomBytes(16).toString('hex');
  const signature = crypto.createHmac('sha256', env.solapiSecret).update(date + salt).digest('hex');
  const r = await fetch('https://api.solapi.com/messages/v4/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `HMAC-SHA256 apiKey=${env.solapiKey}, date=${date}, salt=${salt}, signature=${signature}`,
    },
    body: JSON.stringify({ message: { to: target, from: digits(env.smsFrom), text } }),
  });
  if (!r.ok) {
    const detail = await r.text().catch(() => '');
    console.error('SMS 실패', r.status, detail);
    return { sent: false, reason: `문자 발송 실패 (${r.status})` };
  }
  return { sent: true };
}

/** 이메일 발송. attachments: [{ filename, content(Buffer) }] */
export async function sendMail({ to, subject, html, attachments = [] }) {
  const list = (Array.isArray(to) ? to : [to]).flatMap((s) => String(s || '').split(',')).map((s) => s.trim()).filter(Boolean);
  if (!list.length) return { sent: false, reason: '받는 이메일 없음' };
  if (!env.resendKey || !env.mailFrom) {
    await devOutbox('MAIL(미설정)', { to: list, subject, files: attachments.map((a) => a.filename) });
    return { sent: false, reason: '이메일 발송 설정(Resend) 전' };
  }
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.resendKey}` },
    body: JSON.stringify({
      from: env.mailFrom,
      to: list,
      subject,
      html,
      attachments: attachments.map((a) => ({ filename: a.filename, content: a.content.toString('base64') })),
    }),
  });
  if (!r.ok) {
    const detail = await r.text().catch(() => '');
    console.error('메일 실패', r.status, detail);
    return { sent: false, reason: `메일 발송 실패 (${r.status})` };
  }
  return { sent: true };
}
