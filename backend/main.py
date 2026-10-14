"""
ArtFlow & Sujango - FastAPI 통합 백엔드 서버
- 포트: 8198 (프론트엔드 5198과 통신)
- 통합 DB & 분리된 라우터 (/api/sujango/ & /api/artflow/)
- 캐싱형 다이나믹 워터마킹 파이프라인
- 만료 공유 링크 (Signed URL 기술)
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.sujango import router as sujango_router
from routers.artflow import router as artflow_router

app = FastAPI(
    title="ArtFlow & Sujango Core API",
    description="1인 예술가를 위한 프라이빗 수장고 & 클라이언트 보안 협업 백엔드",
    version="2.0.0"
)

# CORS 설정 (Vite 5198 포트 연동)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5198",
        "http://localhost:5198",
        "http://127.0.0.1:8888",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 분리된 라우터 등록
app.include_router(sujango_router)
app.include_router(artflow_router)

@app.get("/")
async def root():
    return {
        "service": "ArtFlow & Sujango API",
        "status": "online",
        "version": "2.0.0",
        "endpoints": {
            "sujango_vault": "/api/sujango/upload",
            "watermark_settings": "/api/sujango/watermark-settings",
            "artflow_share": "/api/artflow/share"
        }
    }

if __name__ == "__main__":
    import uvicorn
    # ArtFlow 전용 백엔드 고유 포트 8198
    uvicorn.run("main:app", host="127.0.0.1", port=8198, reload=True)
