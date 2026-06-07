from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, ImageDraw, ImageFont, ImageOps
import io

try:
    import pillow_avif
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
    "gif": "image/gif", "bmp": "image/bmp",
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
        img.convert("P", palette=Image.ADAPTIVE).save(buf, format="GIF")
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

def respond(data: bytes, fmt: str, filename: str):
    return StreamingResponse(
        io.BytesIO(data),
        media_type=MIME.get(fmt.lower(), "image/png"),
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@app.get("/")
def root():
    return {"status": "ok", "service": "Image Converter"}

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.post("/convert")
async def convert_image(file: UploadFile = File(...), format: str = Form("png")):
    img = Image.open(io.BytesIO(await file.read()))
    return respond(pil_save(img, format), format, f"converted.{format}")

@app.post("/resize")
async def resize_image(
    file: UploadFile = File(...),
    width: str = Form(""),
    height: str = Form(""),
    format: str = Form("png")
):
    img = Image.open(io.BytesIO(await file.read()))
    w = int(width) if width else None
    h = int(height) if height else None
    if w and h:
        img = img.resize((w, h), Image.LANCZOS)
    elif w:
        img = img.resize((w, int(img.height * w / img.width)), Image.LANCZOS)
    elif h:
        img = img.resize((int(img.width * h / img.height), h), Image.LANCZOS)
    return respond(pil_save(img, format), format, f"resized.{format}")

@app.post("/compress")
async def compress_image(
    file: UploadFile = File(...),
    quality: int = Form(75),
    format: str = Form("jpeg")
):
    img = Image.open(io.BytesIO(await file.read()))
    return respond(pil_save(img, format, quality), format, f"compressed.{format}")

@app.post("/crop")
async def crop_image(
    file: UploadFile = File(...),
    x: int = Form(0),
    y: int = Form(0),
    width: int = Form(100),
    height: int = Form(100),
    format: str = Form("png")
):
    img = Image.open(io.BytesIO(await file.read()))
    img = img.crop((x, y, x + width, y + height))
    return respond(pil_save(img, format), format, f"cropped.{format}")

@app.post("/watermark")
async def watermark_image(
    file: UploadFile = File(...),
    watermark_text: str = Form("Sample"),
    format: str = Form("png")
):
    img = Image.open(io.BytesIO(await file.read())).convert("RGBA")
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    try:
        font = ImageFont.truetype(
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            max(24, img.width // 15)
        )
    except:
        font = ImageFont.load_default()
    step_x = img.width // 3
    step_y = img.height // 3
    for xi in range(0, img.width + step_x, step_x):
        for yi in range(0, img.height + step_y, step_y):
            draw.text((xi, yi), watermark_text, fill=(200, 200, 200, 100), font=font)
    combined = Image.alpha_composite(img, overlay).convert("RGB")
    return respond(pil_save(combined, format), format, f"watermarked.{format}")

@app.post("/pixel-art")
async def pixel_art(
    file: UploadFile = File(...),
    pixel_size: int = Form(8),
    format: str = Form("png")
):
    img = Image.open(io.BytesIO(await file.read())).convert("RGB")
    pixel_size = max(2, min(pixel_size, 64))
    small = img.resize(
        (max(1, img.width // pixel_size), max(1, img.height // pixel_size)),
        Image.BOX
    )
    pixelated = small.resize(img.size, Image.NEAREST)
    return respond(pil_save(pixelated, format), format, f"pixel_art.{format}")

@app.post("/rotate")
async def rotate_image(
    file: UploadFile = File(...),
    degrees: int = Form(90),
    format: str = Form("png")
):
    img = Image.open(io.BytesIO(await file.read()))
    img = img.rotate(-degrees, expand=True)
    return respond(pil_save(img, format), format, f"rotated.{format}")

@app.post("/flip")
async def flip_image(
    file: UploadFile = File(...),
    direction: str = Form("horizontal"),
    format: str = Form("png")
):
    img = Image.open(io.BytesIO(await file.read()))
    if direction == "horizontal":
        img = ImageOps.mirror(img)
    else:
        img = ImageOps.flip(img)
    return respond(pil_save(img, format), format, f"flipped.{format}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)