-- ==============================================================================
-- Sujango (수장고) 보안 강화 및 사용자 격리 RLS 최종 통합 스키마 v3.2
-- 파일 위치: docs/supabase_security.sql
-- 최종 검증일: 2026-10-22
-- 적용 상태: Supabase 프로덕션 데이터베이스 100% 적용 완료 (Success)
--
-- [주요 보안 특성]
-- 1. 모든 사용자 테이블(artworks, captions, artist_notes, tax_records, inspo_notes, exhibitions)
--    owner_id (UUID NOT NULL REFERENCES auth.users) 기준 본인 격리 RLS (SELECT/INSERT/UPDATE/DELETE)
-- 2. profiles 테이블: auth.uid() = id 기준 격리
--    [보완 1] 요금제 칸(is_pro, plan_tier, storage_limit_gb)은 사용자가 직접 INSERT/UPDATE 불가 (REVOKE)
--    오직 서버 사이드(service_role) 결제 검증 함수에서만 승급 가능
-- 3. share_links 테이블: 도록 링크 기능 보류 상태 ➔ 정책 0개로 모든 외부 접근 100% 완전 차단
-- 4. Storage (artworks): 100% 비공개(Private) 버킷 + 본인 폴더((storage.foldername(name))[1] = auth.uid()) 격리
-- 5. [보완 2] 레거시 공개 정책 동적 일괄 소탕 (USING true 전면 박멸)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- [보완 2] 레거시 공개 정책 자동 전수 삭제 (공개 구멍 원천 차단)
-- ------------------------------------------------------------------------------
DO $$
DECLARE
  pol RECORD;
BEGIN
  -- public 스키마의 테이블 중 _own 으로 끝나지 않는 모든 이전 정책 삭제
  FOR pol IN (
    SELECT schemaname, tablename, policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' 
      AND policyname NOT LIKE '%_own'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
  END LOOP;
END $$;


-- ------------------------------------------------------------------------------
-- 1. profiles 테이블 (auth.users 1:1 매핑 & 본인 격리)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT UNIQUE NOT NULL,
  artist_name TEXT DEFAULT '작가',
  phone TEXT,
  bio TEXT,
  bank_name TEXT,
  bank_account TEXT,
  bank_holder TEXT,
  avatar_url TEXT,
  is_pro BOOLEAN DEFAULT FALSE,
  plan_tier TEXT DEFAULT 'free',
  storage_limit_gb NUMERIC DEFAULT 0,
  watermark_type TEXT DEFAULT 'text',
  watermark_text TEXT DEFAULT '© 2026 Artist. All rights reserved',
  watermark_image_url TEXT,
  watermark_opacity NUMERIC DEFAULT 0.35,
  watermark_position TEXT DEFAULT 'center_diagonal',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 기존에 profiles 테이블이 있던 경우를 위해 누락 컬럼 확실하게 추가
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS artist_name TEXT DEFAULT '작가';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bank_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bank_account TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bank_holder TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_pro BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan_tier TEXT DEFAULT 'free';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS storage_limit_gb NUMERIC DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS watermark_type TEXT DEFAULT 'text';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS watermark_text TEXT DEFAULT '© 2026 Artist. All rights reserved';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS watermark_image_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS watermark_opacity NUMERIC DEFAULT 0.35;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS watermark_position TEXT DEFAULT 'center_diagonal';

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;

CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_delete_own" ON public.profiles
  FOR DELETE TO authenticated USING (auth.uid() = id);

-- [보완 1] 요금제/용량 관련 컬럼은 사용자가 임의로 INSERT/UPDATE할 수 없게 컬럼 레벨 권한 통제
REVOKE INSERT, UPDATE ON public.profiles FROM authenticated;

GRANT INSERT (
  id, user_email, artist_name, phone, bio, bank_name, bank_account,
  bank_holder, avatar_url, watermark_type, watermark_text, watermark_image_url,
  watermark_opacity, watermark_position
) ON public.profiles TO authenticated;

GRANT UPDATE (
  artist_name, phone, bio, bank_name, bank_account, bank_holder,
  avatar_url, watermark_type, watermark_text, watermark_image_url,
  watermark_opacity, watermark_position, updated_at
) ON public.profiles TO authenticated;


-- ------------------------------------------------------------------------------
-- 2. artworks 테이블 (나의 작품 수장고)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.artworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  user_email TEXT NOT NULL,
  title TEXT NOT NULL,
  year TEXT,
  medium TEXT,
  size_width NUMERIC,
  size_height NUMERIC,
  size_unit TEXT DEFAULT 'cm',
  price BIGINT DEFAULT 0,
  status TEXT DEFAULT '보관중',
  image_url TEXT,
  original_image_url TEXT,
  preview_image_url TEXT,
  thumbnail_url TEXT,
  file_size_bytes BIGINT DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 기존 테이블 컬럼 보강 및 [보완 3] owner_id NOT NULL 강제 설정
ALTER TABLE public.artworks ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();
ALTER TABLE public.artworks ADD COLUMN IF NOT EXISTS original_image_url TEXT;
ALTER TABLE public.artworks ADD COLUMN IF NOT EXISTS preview_image_url TEXT;
ALTER TABLE public.artworks ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
ALTER TABLE public.artworks ADD COLUMN IF NOT EXISTS file_size_bytes BIGINT DEFAULT 0;
ALTER TABLE public.artworks ALTER COLUMN owner_id SET NOT NULL;
ALTER TABLE public.artworks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "artworks_select_own" ON public.artworks;
DROP POLICY IF EXISTS "artworks_insert_own" ON public.artworks;
DROP POLICY IF EXISTS "artworks_update_own" ON public.artworks;
DROP POLICY IF EXISTS "artworks_delete_own" ON public.artworks;

CREATE POLICY "artworks_select_own" ON public.artworks
  FOR SELECT TO authenticated USING (auth.uid() = owner_id);

CREATE POLICY "artworks_insert_own" ON public.artworks
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "artworks_update_own" ON public.artworks
  FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "artworks_delete_own" ON public.artworks
  FOR DELETE TO authenticated USING (auth.uid() = owner_id);


-- ------------------------------------------------------------------------------
-- 3. captions 테이블 (전시 캡션 보관함)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.captions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  artwork_id UUID REFERENCES public.artworks(id) ON DELETE SET NULL,
  title_ko TEXT NOT NULL,
  title_en TEXT,
  artist_name_ko TEXT,
  artist_name_en TEXT,
  year TEXT,
  medium_ko TEXT,
  medium_en TEXT,
  dimensions TEXT,
  layout_type TEXT DEFAULT 'standard',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.captions ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();
ALTER TABLE public.captions ALTER COLUMN owner_id SET NOT NULL;
ALTER TABLE public.captions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "captions_select_own" ON public.captions;
DROP POLICY IF EXISTS "captions_insert_own" ON public.captions;
DROP POLICY IF EXISTS "captions_update_own" ON public.captions;
DROP POLICY IF EXISTS "captions_delete_own" ON public.captions;

CREATE POLICY "captions_select_own" ON public.captions
  FOR SELECT TO authenticated USING (auth.uid() = owner_id);

CREATE POLICY "captions_insert_own" ON public.captions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "captions_update_own" ON public.captions
  FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "captions_delete_own" ON public.captions
  FOR DELETE TO authenticated USING (auth.uid() = owner_id);


-- ------------------------------------------------------------------------------
-- 4. artist_notes 테이블 (작가노트 & SNS 스튜디오)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.artist_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  title TEXT NOT NULL,
  artwork_title TEXT,
  keywords TEXT[],
  statement_text TEXT,
  instagram_caption TEXT,
  critique_points TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.artist_notes ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();
ALTER TABLE public.artist_notes ALTER COLUMN owner_id SET NOT NULL;
ALTER TABLE public.artist_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "artist_notes_select_own" ON public.artist_notes;
DROP POLICY IF EXISTS "artist_notes_insert_own" ON public.artist_notes;
DROP POLICY IF EXISTS "artist_notes_update_own" ON public.artist_notes;
DROP POLICY IF EXISTS "artist_notes_delete_own" ON public.artist_notes;

CREATE POLICY "artist_notes_select_own" ON public.artist_notes
  FOR SELECT TO authenticated USING (auth.uid() = owner_id);

CREATE POLICY "artist_notes_insert_own" ON public.artist_notes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "artist_notes_update_own" ON public.artist_notes
  FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "artist_notes_delete_own" ON public.artist_notes
  FOR DELETE TO authenticated USING (auth.uid() = owner_id);


-- ------------------------------------------------------------------------------
-- 5. tax_records 테이블 (창작 가계부 & 3.3% 정산 세무 장부)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tax_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  user_email TEXT NOT NULL,
  project_title TEXT NOT NULL,
  client_name TEXT NOT NULL,
  contract_amount BIGINT NOT NULL DEFAULT 0,
  tax_amount BIGINT NOT NULL DEFAULT 0,
  net_amount BIGINT NOT NULL DEFAULT 0,
  payment_status TEXT DEFAULT '미수금',
  payment_date DATE,
  memo TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 기존 테이블에 owner_id 추가 및 [보완 3] NOT NULL 강제 설정
ALTER TABLE public.tax_records ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();
ALTER TABLE public.tax_records ALTER COLUMN owner_id SET NOT NULL;
ALTER TABLE public.tax_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tax_records_select_own" ON public.tax_records;
DROP POLICY IF EXISTS "tax_records_insert_own" ON public.tax_records;
DROP POLICY IF EXISTS "tax_records_update_own" ON public.tax_records;
DROP POLICY IF EXISTS "tax_records_delete_own" ON public.tax_records;

CREATE POLICY "tax_records_select_own" ON public.tax_records
  FOR SELECT TO authenticated USING (auth.uid() = owner_id);

CREATE POLICY "tax_records_insert_own" ON public.tax_records
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "tax_records_update_own" ON public.tax_records
  FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "tax_records_delete_own" ON public.tax_records
  FOR DELETE TO authenticated USING (auth.uid() = owner_id);


-- ------------------------------------------------------------------------------
-- 6. inspo_notes 테이블 (영감 노트 보관함)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.inspo_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  content TEXT NOT NULL,
  source TEXT,
  author TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.inspo_notes ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();
ALTER TABLE public.inspo_notes ALTER COLUMN owner_id SET NOT NULL;
ALTER TABLE public.inspo_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "inspo_notes_select_own" ON public.inspo_notes;
DROP POLICY IF EXISTS "inspo_notes_insert_own" ON public.inspo_notes;
DROP POLICY IF EXISTS "inspo_notes_update_own" ON public.inspo_notes;
DROP POLICY IF EXISTS "inspo_notes_delete_own" ON public.inspo_notes;

CREATE POLICY "inspo_notes_select_own" ON public.inspo_notes
  FOR SELECT TO authenticated USING (auth.uid() = owner_id);

CREATE POLICY "inspo_notes_insert_own" ON public.inspo_notes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "inspo_notes_update_own" ON public.inspo_notes
  FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "inspo_notes_delete_own" ON public.inspo_notes
  FOR DELETE TO authenticated USING (auth.uid() = owner_id);


-- ------------------------------------------------------------------------------
-- 7. exhibitions 테이블 (전시 및 경력 이력)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.exhibitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  user_email TEXT NOT NULL,
  title TEXT NOT NULL,
  gallery_name TEXT,
  start_date DATE,
  end_date DATE,
  category TEXT DEFAULT '개인전',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 기존 테이블에 owner_id 추가 및 [보완 3] NOT NULL 강제 설정
ALTER TABLE public.exhibitions ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();
ALTER TABLE public.exhibitions ALTER COLUMN owner_id SET NOT NULL;
ALTER TABLE public.exhibitions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "exhibitions_select_own" ON public.exhibitions;
DROP POLICY IF EXISTS "exhibitions_insert_own" ON public.exhibitions;
DROP POLICY IF EXISTS "exhibitions_update_own" ON public.exhibitions;
DROP POLICY IF EXISTS "exhibitions_delete_own" ON public.exhibitions;

CREATE POLICY "exhibitions_select_own" ON public.exhibitions
  FOR SELECT TO authenticated USING (auth.uid() = owner_id);

CREATE POLICY "exhibitions_insert_own" ON public.exhibitions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "exhibitions_update_own" ON public.exhibitions
  FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "exhibitions_delete_own" ON public.exhibitions
  FOR DELETE TO authenticated USING (auth.uid() = owner_id);


-- ------------------------------------------------------------------------------
-- 8. share_links 테이블 (기능 보류 ➔ 정책 0개로 모든 접근 100% 완전 차단)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.share_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  share_token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.share_links ENABLE ROW LEVEL SECURITY;
-- 정책을 일체 주지 않으므로 RLS 기본 차단 규칙에 따라 모든 사용자/공개 접근이 100% 거부됩니다.


-- ------------------------------------------------------------------------------
-- 9. Storage (artworks 비공개 버킷 생성 및 폴더 격리 RLS)
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'artworks',
  'artworks',
  false,               -- 100% 비공개(Private) 버킷
  52428800,            -- 파일당 최대 50MB 제한
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET public = false;

DROP POLICY IF EXISTS "Artworks storage select" ON storage.objects;
DROP POLICY IF EXISTS "Artworks storage insert" ON storage.objects;
DROP POLICY IF EXISTS "Artworks storage update" ON storage.objects;
DROP POLICY IF EXISTS "Artworks storage delete" ON storage.objects;

CREATE POLICY "Artworks storage select" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'artworks' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Artworks storage insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'artworks' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Artworks storage update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'artworks' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'artworks' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Artworks storage delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'artworks' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );
