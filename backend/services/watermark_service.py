"""
ArtFlow & Sujango - 백엔드 이미지 워터마킹 및 리사이징 서비스
고화질 원본 파일(RAW, TIFF, 고화질 JPG)을 받아
1회성으로 1080px 웹 최적화 리사이징 및 작가 맞춤형 투명 워터마크를 합성하여 캐싱합니다.
"""

import io
from PIL import Image, ImageDraw, ImageFont, ImageEnhance

def generate_watermarked_preview(
    image_bytes: bytes,
    watermark_type: str = "text",
    watermark_text: str = "© 2026 Artist. All rights reserved",
    watermark_logo_bytes: bytes = None,
    opacity: float = 0.35,
    position: str = "center_diagonal",
    target_width: int = 1080
) -> bytes:
    """
    원본 이미지 바이트를 받아 1080px 워터마크 프리뷰 이미지 바이트를 생성합니다.
    """
    # 1. 원본 이미지 로드
    base_image = Image.open(io.BytesIO(image_bytes)).convert("RGBA")
    
    # 2. 비율 유지 가로 target_width로 리사이징
    orig_w, orig_h = base_image.size
    if orig_w > target_width:
        target_h = int((orig_h * target_width) / orig_w)
        base_image = base_image.resize((target_width, target_h), Image.Resampling.LANCZOS)
    
    width, height = base_image.size

    # 워터마크 미적용인 경우 단순 리사이즈 결과 반환
    if watermark_type == "none":
        output = io.BytesIO()
        base_image.convert("RGB").save(output, format="JPEG", quality=85, optimize=True)
        return output.getvalue()

    # 3. 투명 오버레이 레이어 생성
    overlay = Image.new("RGBA", (width, height), (255, 255, 255, 0))

    if watermark_type == "text" and watermark_text:
        # 텍스트 워터마크 렌더링
        font_size = max(20, int(width * 0.038))
        try:
            # 시스템 기본 폰트 또는 트루타입 폰트
            font = ImageFont.truetype("arial.ttf", font_size)
        except IOError:
            font = ImageFont.load_default()

        # 텍스트 레이어 생성 및 회전
        text_layer = Image.new("RGBA", (width, height), (255, 255, 255, 0))
        draw = ImageDraw.Draw(text_layer)
        alpha = int(max(0.1, min(1.0, opacity)) * 255)
        text_color = (255, 255, 255, alpha)

        if position == "center_diagonal":
            # 텍스트 크기 계산
            bbox = draw.textbbox((0, 0), watermark_text, font=font)
            text_w = bbox[2] - bbox[0]
            text_h = bbox[3] - bbox[1]
            
            # 중앙 배치 후 회전용 임시 이미지
            txt_img = Image.new("RGBA", (text_w + 40, text_h + 40), (255, 255, 255, 0))
            d = ImageDraw.Draw(txt_img)
            d.text((20, 20), watermark_text, font=font, fill=text_color)
            rotated_txt = txt_img.rotate(25, expand=True, resample=Image.Resampling.BICUBIC)
            
            # overlay 중앙에 합성
            rw, rh = rotated_txt.size
            overlay.paste(rotated_txt, ((width - rw) // 2, (height - rh) // 2), rotated_txt)

        elif position == "bottom_right":
            bbox = draw.textbbox((0, 0), watermark_text, font=font)
            text_w = bbox[2] - bbox[0]
            text_h = bbox[3] - bbox[1]
            padding = int(width * 0.04)
            draw.text((width - text_w - padding, height - text_h - padding), watermark_text, font=font, fill=text_color)
            overlay = Image.alpha_composite(overlay, text_layer)

        elif position == "grid":
            step_x = int(width * 0.45)
            step_y = int(height * 0.35)
            for x in range(0, width, step_x):
                for y in range(0, height, step_y):
                    draw.text((x, y), watermark_text, font=font, fill=text_color)
            overlay = Image.alpha_composite(overlay, text_layer)

    elif watermark_type == "image" and watermark_logo_bytes:
        # PNG 로고 워터마크 합성
        logo = Image.open(io.BytesIO(watermark_logo_bytes)).convert("RGBA")
        
        # 투명도 적용
        alpha = logo.split()[3]
        alpha = ImageEnhance.Brightness(alpha).enhance(opacity)
        logo.putalpha(alpha)

        # 크기 조정
        max_logo_w = int(width * 0.35)
        if logo.size[0] > max_logo_w:
            logo_h = int((logo.size[1] * max_logo_w) / logo.size[0])
            logo = logo.resize((max_logo_w, logo_h), Image.Resampling.LANCZOS)

        if position == "bottom_right":
            padding = int(width * 0.04)
            overlay.paste(logo, (width - logo.size[0] - padding, height - logo.size[1] - padding), logo)
        else:
            # 중앙 회전
            rotated_logo = logo.rotate(15, expand=True, resample=Image.Resampling.BICUBIC)
            rw, rh = rotated_logo.size
            overlay.paste(rotated_logo, ((width - rw) // 2, (height - rh) // 2), rotated_logo)

    # 4. 베이스 이미지와 워터마크 오버레이 합성
    watermarked = Image.alpha_composite(base_image, overlay)

    # 5. JPEG 고품질 바이트로 반환
    output = io.BytesIO()
    watermarked.convert("RGB").save(output, format="JPEG", quality=85, optimize=True)
    return output.getvalue()
