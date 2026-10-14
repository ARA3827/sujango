"""
Sujango (수장고) 라우터
/api/sujango/
- 원본 이미지 안전 보관
- 1080px 워터마크 프리뷰 캐싱 생성
- 작가 워터마크 설정 관리
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from typing import Optional
import uuid
from services.watermark_service import generate_watermarked_preview

router = APIRouter(prefix="/api/sujango", tags=["Sujango"])

class WatermarkSettingsSchema(BaseModel):
    user_email: str
    watermark_type: str = "text" # 'text', 'image', 'none'
    watermark_text: str = "© 2026 Artist. All rights reserved"
    watermark_image_url: Optional[str] = None
    watermark_opacity: float = 0.35
    watermark_position: str = "center_diagonal"

# 인메모리 / 캐시 모의 DB (실제 연동 시 Supabase와 동기화)
_watermark_db = {}

@router.get("/watermark-settings")
async def get_watermark_settings(user_email: str):
    """작가의 워터마크 보안 설정을 조회합니다."""
    settings = _watermark_db.get(user_email, {
        "user_email": user_email,
        "watermark_type": "text",
        "watermark_text": "© 2026 Artist. All rights reserved",
        "watermark_opacity": 0.35,
        "watermark_position": "center_diagonal"
    })
    return {"status": "success", "data": settings}

@router.post("/watermark-settings")
async def save_watermark_settings(settings: WatermarkSettingsSchema):
    """작가의 워터마크 설정을 저장합니다."""
    _watermark_db[settings.user_email] = settings.model_dump()
    return {"status": "success", "message": "워터마크 설정이 저장되었습니다.", "data": settings}

@router.post("/upload")
async def upload_artwork_image(
    file: UploadFile = File(...),
    user_email: str = Form(...),
    title: str = Form(...)
):
    """
    고화질 작품 이미지를 업로드하고, 
    원본은 금고에 안전하게 보관하면서 1080px 워터마크 웹 시안을 1회 생성(캐싱)합니다.
    """
    try:
        content = await file.read()
        file_size = len(content)

        # 1. 작가의 워터마크 설정 조회
        user_settings = _watermark_db.get(user_email, {
            "watermark_type": "text",
            "watermark_text": f"© 2026 {user_email}. All rights reserved",
            "watermark_opacity": 0.35,
            "watermark_position": "center_diagonal"
        })

        # 2. 1080px 워터마크 시안 자동 합성
        watermarked_bytes = generate_watermarked_preview(
            image_bytes=content,
            watermark_type=user_settings.get("watermark_type", "text"),
            watermark_text=user_settings.get("watermark_text", "© 2026 Artist"),
            opacity=user_settings.get("watermark_opacity", 0.35),
            position=user_settings.get("watermark_position", "center_diagonal"),
            target_width=1080
        )

        artwork_id = f"art-{uuid.uuid4().hex[:8]}"

        # 실제 프로덕션에서는 Cloudflare R2 / Supabase Storage에 업로드
        # 여기서는 반환 스키마 규격을 정의합니다.
        return {
            "status": "success",
            "data": {
                "artwork_id": artwork_id,
                "title": title,
                "file_size_bytes": file_size,
                "original_url": f"/storage/vault/{artwork_id}_original.jpg",
                "preview_url": f"/storage/preview/{artwork_id}_1080p_watermarked.jpg",
                "thumbnail_url": f"/storage/thumb/{artwork_id}_400p.jpg"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"이미지 가공 파이프라인 오류: {str(e)}")
