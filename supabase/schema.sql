-- Supabase 대시보드 → SQL Editor 에 붙여넣고 실행하세요.
create table if not exists public.orders (
  id                   text primary key,
  created_at           timestamptz not null default now(),
  status               text not null default 'pending'
                         check (status in ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
  items                jsonb not null,
  total                integer not null,
  receive_date         date not null,
  ship_date            date not null,
  name                 text not null,
  phone                text not null,
  address              text not null,
  memo                 text,
  tracking_no          text,
  delivery_status      text,
  delivery_detail      text,
  delivery_checked_at  timestamptz,
  paid_at              timestamptz,
  shipped_at           timestamptz,
  tracking_notified_at timestamptz
);

create index if not exists orders_ship_date_idx on public.orders (ship_date);
create index if not exists orders_status_idx on public.orders (status);

-- 손님 개인정보가 들어 있으므로 외부(anon) 접근을 막습니다.
-- 서버는 service_role 키로 접근하므로 RLS의 영향을 받지 않습니다.
alter table public.orders enable row level security;
