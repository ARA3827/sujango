# Sujango (수장고) Supabase 클라우드 데이터베이스 연동 및 보안 가이드

## 1. 개요 및 배경
- **서비스명**: Sujango (수장고) - 1인 예술가를 위한 프라이빗 디지털 수장고 & 행정/정산 워크스테이션 (고유 포트 5198)
- **도입 기술**: Supabase (PostgreSQL 기반 BaaS)
- **선정 사유**: 예술가의 3.3% 원천징수 정산, 세무 통계, 작품 크기/가격 정렬 등 관계형 데이터 쿼리에 최적화.

## 2. 보안 격리 및 환경변수 아키텍처
- **문제점**: 깃허브 공개 시 API 키와 DB 접근 정보 유출 위험.
- **해결책**:
  1. `.gitignore`에 `.env`, `.env.*` 추가 및 `!.env.example`만 템플릿으로 허용.
  2. 실제 발급된 Publishable Anon Key는 로컬 전용 `.env` 파일에 보관.
  3. `src/utils/supabaseClient.js`에서 `import.meta.env`로 안전하게 주입.

## 3. 핵심 데이터베이스 스키마 설계 (v2.0)
1. **profiles (작가 프로필 & 스튜디오 설정)**:
   - 기본: 작가명, 연락처, 프로필 소개, 정산 계좌 정보, Pro/Studio 요금제 티어(`plan_tier`: 'free' | 'pro' | 'studio', `storage_limit_gb`)
   - **워터마크 설정**: `watermark_type`('text'|'image'|'none'), `watermark_text` (기본 문구 자동생성), `watermark_image_url`, `watermark_opacity`, `watermark_position`
2. **artworks (작품 아카이브 금고)**:
   - 기본 메타데이터: 작품명, 제작연도, 재료, 규격(가로x세로x단위), 가격, 상태, 메모
   - **이미지 파이프라인**: 
     - `original_image_url`: 대용량 원본 파일 보관소 (외부 미노출)
     - `preview_image_url`: 1080px 워터마크 자동 합성 웹 전용 시안
     - `thumbnail_url`: 목록 표시용 경량 이미지
     - `file_size_bytes`: 스토리지 사용량 합산 및 500GB 한도 추적
     - `is_shared`: 외부 공개 여부
3. **share_links (보안 만료 공유 링크 - ArtFlow 연동)**:
   - `share_token`: 클라이언트/갤러리 전용 접속 토큰
   - `expires_at`: 링크 만료 일시 (예: 발급 후 7일 자동 만료)
   - `pin_code`: 선택적 4자리 비밀번호 잠금
   - `allow_download`: 원본 다운로드 허용 여부 (기본 false)
   - `feedback_notes`: 클라이언트가 남긴 의견 및 리뷰 수합
4. **tax_records (3.3% 정산 & 원천징수 세무 장부)**: 프로젝트명, 거래처명, 총 계약금, 3.3% 세액, 실수령액, 입금 상태(입금완료/미수금), 정산일
5. **exhibitions (전시 및 경력 이력)**: 전시명, 갤러리명, 시작일, 종료일, 전시 유형(개인전/단체전/아트페어)

## 4. RLS (Row Level Security) 정책
- 초기 개발 단계에서는 익명/인증 사용자 읽기 및 쓰기를 허용하고, 실운영 진입 시 사용자 소유권(UUID/email) 기준 격리 정책 적용.
- `share_links`는 `share_token`을 보유한 게스트 클라이언트가 시안을 조회하고 피드백을 남길 수 있도록 안전하게 개방.

## 5. 프론트엔드 하이브리드 동기화 아키텍처
1. **로컬 우선 즉각 반응(Optimistic Local First)**:
   - 로컬스토리지에 즉시 저장하여 네트워크 지연 없이 0ms UX 제공.
2. **클라우드 비동기 영구 보관(Background Cloud Sync)**:
   - `saveSingleArtwork`: 로컬 저장 즉시 Supabase `artworks` 테이블에 백그라운드 upsert.
   - `deleteArtwork`: 로컬 삭제 즉시 Supabase에서도 비동기 삭제.
   - `syncArtworksFromSupabase`: 앱 진입 시 클라우드에서 최신 데이터를 가져와 동기화.
   - `syncUserProfile`: 소셜 로그인 성공 시 Supabase `profiles` 테이블에 사용자 메타데이터 및 워터마크 설정 자동 등록.
