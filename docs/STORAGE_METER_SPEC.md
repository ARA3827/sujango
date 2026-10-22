# Sujango (수장고) - 작가별 저장 용량(Storage Meter) 사양서 (과제 6)

> **문서 상태:** 완료 (Production Ready)  
> **작성일:** 2026-10-22  
> **소속:** Ara Agent Lab  
> **포트:** `5198`

---

## 1. 개요 및 비즈니스 목적
1인 예술가 창업 도구인 **수장고(Sujango)**에서 작가가 자신의 작품 저장 용량을 한눈에 확인하고, 요금제별 상한(1GB / 100GB / 500GB)에 도달했을 때 자연스럽게 Pro 멤버십으로 확장할 수 있도록 돕는 실시간 게이지 및 차단 시스템입니다.

---

## 2. 플랜별 용량 및 작품 수 기준

| 플랜명 | 한글 라벨 | 저장 용량 상한 | 작품 수 한도 | 특화 기능 |
| :--- | :--- | :---: | :---: | :--- |
| **Free Artist** | 무료 기본 수장고 | **1 GB** | 30점 | 웹 확인용 압축본 보관, 기본 5대 행정 서류 |
| **Pro Artist** | Sujango Pro | **100 GB** | **무제한** | 고화질 사진 약 5,000장, 무손실 원본 금고, 클라우드 동기화 |
| **Studio Partner** | Sujango Studio | **500 GB** | **무제한** | 4K 영상/대형작 약 25,000장, 7일 보안 링크, 워터마크 |

---

## 3. 핵심 모듈 구성

### (1) 용량 계산 유틸리티 (`src/utils/storageMeter.js`)
- `getUserStoragePlan(user)`: 사용자의 멤버십/티어에 따른 한도 바이트 조회
- `calculateUsedStorage(artworks)`: 실제 파일 크기(`fileSizeBytes`), Base64 스트링, 또는 보수적 추정치를 기반으로 총 사용량 계산
- `formatBytes(bytes)`: 사람이 읽기 쉬운 단위(`KB`, `MB`, `GB`)로 포맷팅
- `checkStorageOverflow(current, newFile, limit)`: 신규 파일 업로드 시 사전 한도 초과 여부 검증 및 사용률(%) 반환

### (2) 수장고 메인 화면 (`src/components/ArchiveStudio.jsx`)
- 상단 타이틀 영역 하단에 실시간 게이지 카드 배치
- `현재 사용량: X.X MB / 1 GB` 표시 및 동적 컬러(먹색 ➔ 황토색 ➔ 연지색) 프로그레스 바
- 새 작품 등록(`handleOpenAddModal`) 및 이미지 선택(`handleImageUpload`) 시 사전 용량 초과 차단 및 안내 모달 팝업

### (3) 메인 대시보드 (`src/components/Dashboard.jsx`)
- "나의 작품 디지털 수장고" 헤더에 `총 N점 보관 중 · N MB / 1 GB` 미니 배지 연동
- 상단 4px 미니 프로그레스 바를 통해 창작 현황을 한눈에 파악 가능
- Free 유저에게는 단정한 `100GB 확장` 바로가기 버튼 제공

---

## 4. 커밋 및 빌드 기록
- **Git Commit:** `9882e5d` (`feat: 작가별 1GB/100GB/500GB 저장 용량 상한 및 실시간 게이지 구축 (과제 6)`)
- **빌드 상태:** `npm run build` 통과 완료 (323ms)
