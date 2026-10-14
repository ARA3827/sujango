"""
ArtFlow (아트플로우) 라우터
/api/artflow/
- 클라이언트 시안 검토용 보안 만료 공유 링크 (Signed URL 기술)
- 피드백 수합 및 갤러리 협업
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta, timezone
import secrets

router = APIRouter(prefix="/api/artflow", tags=["ArtFlow"])

class CreateShareLinkSchema(BaseModel):
    user_email: str
    artwork_id: str
    client_name: str
    expires_in_days: int = 7
    pin_code: Optional[str] = None
    allow_download: bool = False

class FeedbackSchema(BaseModel):
    client_author: str
    feedback_notes: str

# 인메모리 공유 링크 DB (실제 연동 시 Supabase share_links 테이블과 연동)
_share_db = {}

@router.post("/share")
async def create_share_link(payload: CreateShareLinkSchema):
    """
    고화질 원본은 숨기고 1080px 워터마크 프리뷰만 볼 수 있는 
    일정 시간 후 만료되는 보안 공유 링크를 발급합니다.
    """
    token = f"art_{secrets.token_hex(8)}"
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(days=payload.expires_in_days)

    share_record = {
        "share_token": token,
        "user_email": payload.user_email,
        "artwork_id": payload.artwork_id,
        "client_name": payload.client_name,
        "expires_at": expires_at.isoformat(),
        "pin_code": payload.pin_code,
        "allow_download": payload.allow_download,
        "view_count": 0,
        "feedback_notes": None,
        "status": "active",
        "created_at": now.isoformat()
    }

    _share_db[token] = share_record

    return {
        "status": "success",
        "message": f"{payload.expires_in_days}일간 유효한 보안 링크가 생성되었습니다.",
        "data": {
            "share_token": token,
            "share_url": f"http://127.0.0.1:5198/#share?token={token}",
            "expires_at": expires_at.isoformat(),
            "pin_protected": bool(payload.pin_code)
        }
    }

@router.get("/share/{token}")
async def get_shared_artwork(token: str, pin: Optional[str] = None):
    """
    클라이언트가 보안 링크를 통해 작품 시안을 열람합니다.
    유효기간 만료 및 PIN 보안을 검증합니다.
    """
    record = _share_db.get(token)
    if not record:
        raise HTTPException(status_code=404, detail="존재하지 않는 공유 링크입니다.")

    # 1. 만료 일시 검증 (Signed URL 원리)
    expires_at = datetime.fromisoformat(record["expires_at"])
    if datetime.now(timezone.utc) > expires_at:
        record["status"] = "expired"
        raise HTTPException(status_code=410, detail="유효기간이 만료된 보안 링크입니다.")

    # 2. PIN 비밀번호 검증
    if record.get("pin_code"):
        if not pin or pin != record["pin_code"]:
            raise HTTPException(status_code=401, detail="보안 PIN 번호가 필요하거나 일치하지 않습니다.")

    # 열람 횟수 증가
    record["view_count"] += 1

    return {
        "status": "success",
        "data": {
            "client_name": record["client_name"],
            "artwork_id": record["artwork_id"],
            "preview_image_url": f"/storage/preview/{record['artwork_id']}_1080p_watermarked.jpg",
            "allow_download": record["allow_download"],
            "expires_at": record["expires_at"],
            "existing_feedback": record.get("feedback_notes")
        }
    }

@router.post("/share/{token}/feedback")
async def submit_feedback(token: str, payload: FeedbackSchema):
    """클라이언트가 시안을 검토한 후 작가에게 피드백을 전달합니다."""
    record = _share_db.get(token)
    if not record:
        raise HTTPException(status_code=404, detail="공유 링크를 찾을 수 없습니다.")

    record["feedback_notes"] = f"[{payload.client_author}] {payload.feedback_notes}"

    return {
        "status": "success",
        "message": "피드백이 작가에게 안전하게 전송되었습니다."
    }
