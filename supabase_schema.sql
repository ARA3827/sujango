-- ==========================================================
-- Sujango (수장고) & ArtFlow - 클라우드 데이터베이스 스키마 v2.0
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
  plan_tier TEXT DEFAULT 'free',                 -- 'free', 'pro', 'studio'
  storage_limit_gb NUMERIC DEFAULT 0,            -- free: 0(로컬), pro: 100, studio: 500
  watermark_type TEXT DEFAULT 'text',            -- 'text', 'image', 'none'
  watermark_text TEXT DEFAULT '© 2026 Artist. All rights reserved', -- 자동 생성 워터마크 기본 문구
  watermark_image_url TEXT,                      -- 사용자 투명 로고/서명 PNG URL
  watermark_opacity NUMERIC DEFAULT 0.35,        -- 투명도 (0.1 ~ 1.0)
  watermark_position TEXT DEFAULT 'center_diagonal', -- 'center_diagonal', 'bottom_right', 'grid'
  terms_agreed_at TIMESTAMPTZ,                  -- 이용약관 필수 동의 일시
  privacy_agreed_at TIMESTAMPTZ,                -- 개인정보 수집/이용 필수 동의 일시
  policy_version TEXT DEFAULT '2026-10-31',      -- 동의한 약관 버전
  is_over_fourteen BOOLEAN DEFAULT TRUE,         -- 만 14세 이상 확인
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 기존 profiles 테이블이 이미 있는 경우를 위한 안전한 마이그레이션 컬럼 추가
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan_tier TEXT DEFAULT 'free';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS storage_limit_gb NUMERIC DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS watermark_type TEXT DEFAULT 'text';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS watermark_text TEXT DEFAULT '© 2026 Artist. All rights reserved';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS watermark_image_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS watermark_opacity NUMERIC DEFAULT 0.35;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS watermark_position TEXT DEFAULT 'center_diagonal';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS terms_agreed_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS privacy_agreed_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS policy_version TEXT DEFAULT '2026-10-31';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_over_fourteen BOOLEAN DEFAULT TRUE;

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
  status TEXT DEFAULT '보관중',                  -- 보관중, 전시중, 판매완료, 렌탈중
  image_url TEXT,                                -- 레거시/기본 표시용 이미지 URL
  original_image_url TEXT,                       -- 고화질 원본 보관소 URL (외부 미노출)
  preview_image_url TEXT,                        -- 1080px 워터마크 웹 시안 URL (클라이언트 서빙용)
  thumbnail_url TEXT,                            -- 목록 열람용 경량 썸네일 URL
  file_size_bytes BIGINT DEFAULT 0,              -- 원본 파일 용량 (스토리지 사용량 합산용)
  is_shared BOOLEAN DEFAULT FALSE,               -- 클라이언트 외부 공유 여부
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 기존 artworks 테이블이 이미 있는 경우를 위한 안전한 마이그레이션 컬럼 추가
ALTER TABLE public.artworks ADD COLUMN IF NOT EXISTS original_image_url TEXT;
ALTER TABLE public.artworks ADD COLUMN IF NOT EXISTS preview_image_url TEXT;
ALTER TABLE public.artworks ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
ALTER TABLE public.artworks ADD COLUMN IF NOT EXISTS file_size_bytes BIGINT DEFAULT 0;
ALTER TABLE public.artworks ADD COLUMN IF NOT EXISTS is_shared BOOLEAN DEFAULT FALSE;

-- 3. 보안 공유 링크 테이블 (Share Links - 클라이언트 피드백 & 시안 검토)
CREATE TABLE IF NOT EXISTS public.share_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  artwork_id UUID REFERENCES public.artworks(id) ON DELETE CASCADE,
  share_token TEXT UNIQUE NOT NULL,              -- 외부 접속용 난수 토큰
  client_name TEXT,                              -- 전달 대상 (갤러리, 큐레이터, 클라이언트명)
  expires_at TIMESTAMPTZ NOT NULL,               -- 링크 유효 만료 시점 (예: 생성 후 7일)
  pin_code TEXT,                                 -- 선택적 4자리 보안 PIN 번호
  allow_download BOOLEAN DEFAULT FALSE,          -- 원본 다운로드 허용 여부
  view_count INT DEFAULT 0,                      -- 열람 횟수
  feedback_notes TEXT,                           -- 클라이언트가 남긴 피드백/의견
  status TEXT DEFAULT 'active',                  -- 'active', 'expired', 'revoked'
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. 3.3% 정산 & 원천징수 세무 장부 (Tax & Settlements)
CREATE TABLE IF NOT EXISTS public.tax_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  project_title TEXT NOT NULL,
  client_name TEXT NOT NULL,
  contract_amount BIGINT NOT NULL DEFAULT 0,     -- 총 계약금
  tax_amount BIGINT NOT NULL DEFAULT 0,          -- 3.3% 세액 (사업소득세 3% + 지방소득세 0.3%)
  net_amount BIGINT NOT NULL DEFAULT 0,          -- 실제 입금액
  payment_status TEXT DEFAULT '미수금',          -- 입금완료, 미수금, 분할입금
  payment_date DATE,
  memo TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. 전시 및 경력 이력 (Exhibitions & CV)
CREATE TABLE IF NOT EXISTS public.exhibitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  title TEXT NOT NULL,
  gallery_name TEXT,
  start_date DATE,
  end_date DATE,
  category TEXT DEFAULT '개인전',                -- 개인전, 단체전, 아트페어, 수상
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================================
-- RLS (Row Level Security) 설정 및 접근 제어
-- ==========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.share_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exhibitions ENABLE ROW LEVEL SECURITY;

-- 1) 작가 프로필 접근 정책
DROP POLICY IF EXISTS "Allow public read access" ON public.profiles;
DROP POLICY IF EXISTS "Allow public write access" ON public.profiles;
CREATE POLICY "Allow public read access" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow public write access" ON public.profiles FOR ALL USING (true);

-- 2) 작품 보관함 접근 정책
DROP POLICY IF EXISTS "Allow public read artworks" ON public.artworks;
DROP POLICY IF EXISTS "Allow public write artworks" ON public.artworks;
CREATE POLICY "Allow public read artworks" ON public.artworks FOR SELECT USING (true);
CREATE POLICY "Allow public write artworks" ON public.artworks FOR ALL USING (true);

-- 3) 보안 공유 링크 접근 정책
DROP POLICY IF EXISTS "Allow public read share_links" ON public.share_links;
DROP POLICY IF EXISTS "Allow public write share_links" ON public.share_links;
CREATE POLICY "Allow public read share_links" ON public.share_links FOR SELECT USING (true);
CREATE POLICY "Allow public write share_links" ON public.share_links FOR ALL USING (true);

-- 4) 정산 장부 접근 정책
DROP POLICY IF EXISTS "Allow public read tax_records" ON public.tax_records;
DROP POLICY IF EXISTS "Allow public write tax_records" ON public.tax_records;
CREATE POLICY "Allow public read tax_records" ON public.tax_records FOR SELECT USING (true);
CREATE POLICY "Allow public write tax_records" ON public.tax_records FOR ALL USING (true);

-- 5) 전시 이력 접근 정책
DROP POLICY IF EXISTS "Allow public read exhibitions" ON public.exhibitions;
DROP POLICY IF EXISTS "Allow public write exhibitions" ON public.exhibitions;
CREATE POLICY "Allow public read exhibitions" ON public.exhibitions FOR SELECT USING (true);
CREATE POLICY "Allow public write exhibitions" ON public.exhibitions FOR ALL USING (true);

-- ==========================================================
-- 6. 수장고 1기 파운딩 아티스트 지원서 테이블 (Founding Applicants)
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.founding_applicants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_code TEXT UNIQUE,                   -- 고유 접수번호 (예: FA-1730000000000)
  name TEXT NOT NULL,                           -- 작가 활동명 / 본명
  email TEXT UNIQUE NOT NULL,                   -- 통보용 이메일 (중복 신청 방지)
  phone TEXT,                                   -- 연락처
  genres JSONB DEFAULT '[]'::jsonb,             -- 주 활동 분야 배열 (서양화, 동양화 등)
  genre_other TEXT,                             -- 기타 분야 직접 입력
  experience TEXT,                              -- 활동 경력 (1년 미만, 1~3년, 4~7년, 8년 이상)
  activities JSONB DEFAULT '[]'::jsonb,         -- 주요 활동 형태 (개인전, 단체전, 아트페어 등)
  portfolio_url TEXT,                           -- 인스타그램/웹사이트/포트폴리오 링크
  pain_point TEXT NOT NULL,                     -- 창작 외 번거로웠던 업무/고민
  current_storage JSONB DEFAULT '[]'::jsonb,    -- 현재 작품사진/자료 보관 방식
  wanted_features JSONB DEFAULT '[]'::jsonb,    -- 먼저 써보고 싶은 기능 (최대 3개)
  primary_device TEXT,                          -- 주 사용 기기 (PC, 스마트폰/태블릿, 둘 다)
  can_commit TEXT,                              -- 2개월 참여 및 설문 동의
  promo_consent TEXT,                           -- 공식 채널 작품 소개 희망 여부
  referral_source TEXT,                         -- 유입 경로
  referral_other TEXT,
  privacy_consent BOOLEAN DEFAULT TRUE,         -- 개인정보 수집 및 이용 동의
  over_fourteen BOOLEAN DEFAULT TRUE,           -- 만 14세 이상 확인
  marketing_consent BOOLEAN DEFAULT FALSE,      -- 소식 수신 동의
  status TEXT DEFAULT '접수완료',                -- '접수완료', '1차선정', '2차선정', '보류'
  notes TEXT,                                   -- 관리자 메모
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 이메일 대소문자 무시 고유 인덱스 (중복 신청 원천 방지)
CREATE UNIQUE INDEX IF NOT EXISTS idx_founding_applicants_lower_email 
ON public.founding_applicants (lower(email));

-- RLS 활성화 및 익명/로그인 사용자 쓰기/읽기 허용
ALTER TABLE public.founding_applicants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public insert founding_applicants" ON public.founding_applicants;
DROP POLICY IF EXISTS "Allow public read founding_applicants" ON public.founding_applicants;
CREATE POLICY "Allow public insert founding_applicants" ON public.founding_applicants FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read founding_applicants" ON public.founding_applicants FOR SELECT USING (true);

