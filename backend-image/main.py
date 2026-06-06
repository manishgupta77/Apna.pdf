from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, ImageDraw, ImageFont
import io
import os

try:
    import pillow_avif  # enables AVIF support
except ImportError:
    pass

app = FastAPI(title="Image Converter Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MIME = {
    "jpeg": "image/jpeg", "jpg": "image/jpeg",
    "png": "image/png", "webp": "image/webp",
    "gif": "image/gif",  "bmp": "image/bmp",
    "tiff": "image/tiff", "avif": "image/avif"
}

def pil_save(img: Image.Image, fmt: str, quality: int = 85) -> bytes:
    buf = io.BytesIO()
    fmt_upper = fmt.upper()
    if fmt_upper in ("JPEG", "JPG"):
        img = img.convert("RGB")
        img.save(buf, format="JPEG", quality=quality, optimize=True)
    elif fmt_upper == "PNG":
        img.save(buf, format="PNG", optimize=True)
    elif fmt_upper == "WEBP":
        img.save(buf, format="WEBP", quality=quality)
    elif fmt_upper == "GIF":
        img = img.convert("P", palette=Image.ADAPTIVE)
        img.save(buf, format="GIF")
    elif fmt_upper == "BMP":
        img.save(buf, format="BMP")
    elif fmt_upper == "TIFF":
        img.save(buf, format="TIFF")
    elif fmt_upper == "AVIF":
        img.save(buf, format="AVIF", quality=quality)
    else:
        img.save(buf, format=fmt_upper)
    buf.seek(0)
    return buf.getvalue()

@app.get("/")
def root():
    return {"status": "ok", "service": "Image Converter"}

@app.get("/health")
def health():
    return {"status": "healthy"}

# ─── CONVERT ──────────────────────────────────────────
@app.post("/convert")
async def convert_image(
    file: UploadFile = File(...),
    format: str = Form("png")
):
    """Convert image to any format: jpeg, png, webp, avif, bmp, gif, tiff"""
    data = await file.read()
    img = Image.open(io.BytesIO(data))
    result = pil_save(img, format)
    mime = MIME.get(format.lower(), "image/png")
    return StreamingResponse(io.BytesIO(result), media_type=mime,
                              headers={"Content-Disposition": f"attachment; filename=converted.{format}"})

# ─── RESIZE ───────────────────────────────────────────
@app.post("/resize")
async def resize_image(
    file: UploadFile = File(...),
    width: str = Form(""),
    height: str = Form(""),
    format: str = Form("png")
):
    """Resize image by pixels. Leave one blank to keep aspect ratio."""
    data = await file.read()
    img = Image.open(io.BytesIO(data))

    w = int(width) if width else None
    h = int(height) if height else None

    if w and h:
        img = img.resize((w, h), Image.LANCZOS)
    elif w:
        ratio = w / img.width
        img = img.resize((w, int(img.height * ratio)), Image.LANCZOS)
    elif h:
        ratio = h / img.height
        img = img.resize((int(img.width * ratio), h), Image.LANCZOS)

    result = pil_save(img, format)
    return StreamingResponse(io.BytesIO(result), media_type=MIME.get(format, "image/png"),
                              headers={"Content-Disposition": f"attachment; filename=resized.{format}"})

# ─── COMPRESS ─────────────────────────────────────────
@app.post("/compress")
async def compress_image(
    file: UploadFile = File(...),
    quality: int = Form(75),
    format: str = Form("jpeg")
):
    """Compress image with quality setting (10-100)"""
    data = await file.read()
    img = Image.open(io.BytesIO(data))
    result = pil_save(img, format, quality=quality)
    return StreamingResponse(io.BytesIO(result), media_type=MIME.get(format, "image/jpeg"),
                              headers={"Content-Disposition": f"attachment; filename=compressed.{format}"})

# ─── CROP ─────────────────────────────────────────────
@app.post("/crop")
async def crop_image(
    file: UploadFile = File(...),
    x: int = Form(0),
    y: int = Form(0),
    width: int = Form(100),
    height: int = Form(100),
    format: str = Form("png")
):
    """Crop image to box (x, y, width, height)"""
    data = await file.read()
    img = Image.open(io.BytesIO(data))
    img = img.crop((x, y, x + width, y + height))
    result = pil_save(img, format)
    return StreamingResponse(io.BytesIO(result), media_type=MIME.get(format, "image/png"),
                              headers={"Content-Disposition": f"attachment; filename=cropped.{format}"})

# ─── WATERMARK ────────────────────────────────────────
@app.post("/watermark")
async def watermark_image(
    file: UploadFile = File(...),
    watermark_text: str = Form("Sample"),
    format: str = Form("png")
):
    """Add a diagonal text watermark to image"""
    data = await file.read()
    img = Image.open(io.BytesIO(data)).convert("RGBA")

    # Create overlay
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    # Use default font (no GPU, no complex font rendering)
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
                                   max(24, img.width // 15))
    except:
        font = ImageFont.load_default()

    # Draw repeated diagonal watermark
    step_x = img.width // 3
    step_y = img.height // 3
    for xi in range(0, img.width + step_x, step_x):
        for yi in range(0, img.height + step_y, step_y):
            draw.text((xi, yi), watermark_text, fill=(200, 200, 200, 100), font=font)

    combined = Image.alpha_composite(img, overlay).convert("RGB")
    result = pil_save(combined, format)
    return StreamingResponse(io.BytesIO(result), media_type=MIME.get(format, "image/png"),
                              headers={"Content-Disposition": f"attachment; filename=watermarked.{format}"})

# ─── PIXEL ART (No GPU!) ──────────────────────────────
@app.post("/pixel-art")
async def pixel_art(
    file: UploadFile = File(...),
    pixel_size: int = Form(8),
    format: str = Form("png")
):
    """
    Convert image to pixel art style.
    Pure CPU magic using Pillow — NO GPU needed at all!
    Shrinks image down, then enlarges with nearest-neighbour.
    """
    data = await file.read()
    img = Image.open(io.BytesIO(data)).convert("RGB")

    # Clamp pixel_size
    pixel_size = max(2, min(pixel_size, 64))

    # Step 1: Shrink to tiny size (this creates the "pixel blocks")
    small_w = max(1, img.width // pixel_size)
    small_h = max(1, img.height // pixel_size)
    small = img.resize((small_w, small_h), Image.BOX)

    # Step 2: Scale back up with NEAREST (no anti-aliasing = pixelated)
    pixelated = small.resize(img.size, Image.NEAREST)

    result = pil_save(pixelated, format)
    return StreamingResponse(io.BytesIO(result), media_type=MIME.get(format, "image/png"),
                              headers={"Content-Disposition": f"attachment; filename=pixel_art.{format}"})

# ─── ROTATE IMAGE ─────────────────────────────────────
@app.post("/rotate")
async def rotate_image(
    file: UploadFile = File(...),
    degrees: int = Form(90),
    format: str = Form("png")
):
    img = Image.open(io.BytesIO(await file.read()))
    img = img.rotate(-degrees, expand=True)
    return respond(pil_save(img, format), format, f"rotated.{format}")

# ─── FLIP IMAGE ───────────────────────────────────────
@app.post("/flip")
async def flip_image(
    file: UploadFile = File(...),
    direction: str = Form("horizontal"),
    format: str = Form("png")
):
    from PIL import ImageOps
    img = Image.open(io.BytesIO(await file.read()))
    if direction == "horizontal":
        img = ImageOps.mirror(img)
    else:
        img = ImageOps.flip(img)
    return respond(pil_save(img, format), format, f"flipped.{format}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
