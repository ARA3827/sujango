# Sujango (수장고) 도메인 연결 & 토스페이먼츠 결제 시스템 가이드

> **Ara Agent Lab 영구 기술 자산**  
> 대상 서비스: 수장고 (Sujango) / ArtFlow  
> 로컬 고유 포트: `5198`

---

## 1. 커스텀 도메인 연결 3단계 실무 가이드 (Vercel + 호스팅KR/가비아)

웹사이트에 내가 구매한 도메인(예: `sujango.com`)을 연결하려면, 웹사이트가 클라우드 호스팅(Vercel 추천 - 무료, 글로벌 CDN, 자동 HTTPS 보안 인증서)에 올라가 있어야 합니다.

### 1단계: GitHub 푸시 및 Vercel 프로젝트 배포
1. GitHub에 `ArtFlow` 최신 코드를 푸시합니다.
2. [Vercel](https://vercel.com) 로그인 후 **[Add New...] -> [Project]**를 클릭합니다.
3. 방금 푸시한 `ArtFlow` 리포지토리를 선택하고 **[Deploy]** 버튼을 누릅니다.
   - 프레임워크 프리셋: `Vite` 자동 감지
   - 환경 변수(Environment Variables) 설정:
     - `VITE_SUPABASE_URL`: Supabase 프로젝트 URL
     - `VITE_SUPABASE_ANON_KEY`: Supabase 익명 키
     - `VITE_TOSS_CLIENT_KEY`: 토스페이먼츠 클라이언트 키 (테스트: `test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm`)

---

### 2단계: Vercel에 커스텀 도메인 등록
1. Vercel 배포 완료 후, 프로젝트 **[Settings] -> [Domains]** 탭으로 이동합니다.
2. 구매하신 도메인(예: `sujango.com`)을 입력하고 **[Add]**를 클릭합니다.
3. `www` 서브도메인 리다이렉트 권장 옵션(`Redirect to sujango.com`)을 체크합니다.

---

### 3단계: 도메인 구매처(호스팅KR / 가비아 / 후이즈 등) DNS 레코드 등록
도메인을 구매하신 관리 콘솔의 **[DNS 레코드 관리 / 네임서버 설정]** 메뉴에서 아래 2개의 레코드만 추가해 주시면 됩니다.

| 레코드 타입 (Type) | 호스트 (Host / 이름) | 값 / 대상 (Value / Target) | TTL | 설명 |
| :--- | :--- | :--- | :--- | :--- |
| **A 레코드** | `@` (또는 빈칸) | `76.76.21.21` | 3600 (또는 기본값) | 메인 루트 도메인 연결 |
| **CNAME** | `www` | `cname.vercel-dns.com` | 3600 (또는 기본값) | www 접속 시 자동 연결 |

> 💡 **안내:** DNS 레코드 입력 후 전 세계 인터넷 망에 전파(Propagation)되기까지 보통 10분~최대 1시간 정도 소요되며, 완료되면 Vercel에서 자동으로 유효한 SSL 보안 인증서(HTTPS)가 발급됩니다.

---

## 2. 토스페이먼츠(Toss Payments) 결제위젯 시스템 명세

수장고(Sujango)에는 국내 1위 결제 솔루션인 **토스페이먼츠 공식 결제위젯 SDK (`@tosspayments/payment-widget-sdk`)**가 탑재되었습니다.

### 2.1 지원 결제 수단
- **신용 / 체크카드**: 국내 모든 카드사 (국민, 신한, 삼성, 현대, 롯데, 비씨, 농협, 하나 등)
- **간편결제**: 카카오페이(KakaoPay), 네이버페이(NaverPay), 토스페이(TossPay)
- **계좌 간편결제 & 가상계좌**: 퀵계좌이체
- **무통장 입금 및 증빙 폼**: 현금영수증(소득공제용) / 전자세금계산서(사업자지출증빙) 신청 접수

### 2.2 테스트 모드 vs 실운영 전환
1. **현재 상태 (테스트 모드)**:
   - 클라이언트 키: `test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm`
   - 실제 결제 승인창, 약관 동의, 카드 선택 UI가 100% 정상 작동하며 실제 요금은 청구되지 않습니다.
   - 결제 완료 시 즉시 `?payment=success` 콜백을 감지하여 폭죽 효과와 함께 멤버십이 Pro(100GB) 또는 Studio(500GB)로 자동 승급됩니다.
2. **실운영 전환 시**:
   - [토스페이먼츠 개발자센터](https://developers.tosspayments.com) 로그인 ➔ 상점 등록 및 사업자 심사
   - 발급받은 실운영 클라이언트 키(`live_ck_...`)를 `.env` 및 Vercel의 `VITE_TOSS_CLIENT_KEY`에 등록하면 즉시 실제 매출이 발생하는 정식 서비스로 가동됩니다.
