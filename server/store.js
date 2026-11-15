// 주문 저장소. Supabase가 설정돼 있으면 Supabase, 아니면(로컬 개발) .data/orders.json 파일을 씁니다.
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

function supabaseStore() {
  const db = createClient(env.supabaseUrl, env.supabaseKey, { auth: { persistSession: false } });
  const t = () => db.from('orders');
  const must = ({ data, error }) => {
    if (error) throw new Error('DB 오류: ' + error.message);
    return data;
  };
  return {
    async create(o) { return must(await t().insert(o).select().single()); },
    async get(id) { return must(await t().select().eq('id', id).maybeSingle()); },
    async update(id, patch) { return must(await t().update(patch).eq('id', id).select().single()); },
    async byShipRange(from, to) {
      return must(await t().select().gte('ship_date', from).lte('ship_date', to).order('created_at'));
    },
    async inTransit() {
      return must(await t().select().eq('status', 'shipped').not('tracking_no', 'is', null));
    },
  };
}

function fileStore() {
  const dir = path.join(process.cwd(), '.data');
  const file = path.join(dir, 'orders.json');
  const load = async () => {
    try { return JSON.parse(await fs.readFile(file, 'utf8')); } catch { return []; }
  };
  const save = async (rows) => {
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(file, JSON.stringify(rows, null, 2));
  };
  return {
    async create(o) { const rows = await load(); rows.push(o); await save(rows); return o; },
    async get(id) { return (await load()).find((r) => r.id === id) || null; },
    async update(id, patch) {
      const rows = await load();
      const i = rows.findIndex((r) => r.id === id);
      if (i < 0) throw new Error('주문을 찾을 수 없어요: ' + id);
      rows[i] = { ...rows[i], ...patch };
      await save(rows);
      return rows[i];
    },
    async byShipRange(from, to) {
      return (await load()).filter((r) => r.ship_date >= from && r.ship_date <= to);
    },
    async inTransit() {
      return (await load()).filter((r) => r.status === 'shipped' && r.tracking_no);
    },
  };
}

let store;
export function getStore() {
  if (store) return store;
  if (env.supabaseUrl && env.supabaseKey) store = supabaseStore();
  else if (!env.isVercel) store = fileStore();
  else throw new Error('주문 저장소(Supabase)가 설정되지 않았어요. SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY를 넣어주세요.');
  return store;
}
