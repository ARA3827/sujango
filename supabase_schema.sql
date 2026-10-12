-- ==========================================================
-- Sujango (수장고) - 클라우드 데이터베이스 스키마
-- 실행 위치: Supabase 대시보드 > 좌측 'SQL Editor' > 새 쿼리 붙여넣기 후 'Run'
-- ==========================================================

-- 1. 작가 프로필 테이블 (Profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT UNIQUE NOT NULL,
  artist_name TEXT,
  phone TEXT,
  bio TEXT,
  bank_name TEXT,
  bank_account TEXT,
  bank_holder TEXT,
  avatar_url TEXT,
  is_pro BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. 작품 아카이브 보관함 (Artworks)
CREATE TABLE IF NOT EXISTS public.artworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  title TEXT NOT NULL,
  year TEXT,
  medium TEXT,
  size_width NUMERIC,
  size_height NUMERIC,
  size_unit TEXT DEFAULT 'cm',
  price BIGINT DEFAULT 0,
  status TEXT DEFAULT '보관중', -- 보관중, 전시중, 판매완료, 렌탈중
  image_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. 3.3% 정산 & 원천징수 세무 장부 (Tax & Settlements)
CREATE TABLE IF NOT EXISTS public.tax_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  project_title TEXT NOT NULL,
  client_name TEXT NOT NULL,
  contract_amount BIGINT NOT NULL DEFAULT 0, -- 총 계약금
  tax_amount BIGINT NOT NULL DEFAULT 0,      -- 3.3% 세액 (사업소득세 3% + 지방소득세 0.3%)
  net_amount BIGINT NOT NULL DEFAULT 0,      -- 실제 입금액
  payment_status TEXT DEFAULT '미수금',      -- 입금완료, 미수금, 분할입금
  payment_date DATE,
  memo TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. 전시 및 경력 이력 (Exhibitions & CV)
CREATE TABLE IF NOT EXISTS public.exhibitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  title TEXT NOT NULL,
  gallery_name TEXT,
  start_date DATE,
  end_date DATE,
  category TEXT DEFAULT '개인전', -- 개인전, 단체전, 아트페어, 수상
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS (Row Level Security) 설정 안내:
-- 프로토타입 단계에서는 개발 편의를 위해 테이블 기본 접근을 허용하거나
-- 추후 로그인 세션 연동 시 사용자별 데이터 보호 정책을 추가 적용합니다.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exhibitions ENABLE ROW LEVEL SECURITY;

-- 개발/연동용 기본 정책 (익명/인증 사용자 읽기 및 쓰기 허용)
CREATE POLICY "Allow public read access" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow public write access" ON public.profiles FOR ALL USING (true);

CREATE POLICY "Allow public read artworks" ON public.artworks FOR SELECT USING (true);
CREATE POLICY "Allow public write artworks" ON public.artworks FOR ALL USING (true);

CREATE POLICY "Allow public read tax_records" ON public.tax_records FOR SELECT USING (true);
CREATE POLICY "Allow public write tax_records" ON public.tax_records FOR ALL USING (true);

CREATE POLICY "Allow public read exhibitions" ON public.exhibitions FOR SELECT USING (true);
CREATE POLICY "Allow public write exhibitions" ON public.exhibitions FOR ALL USING (true);
