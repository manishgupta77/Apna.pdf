# iConvertPDF — PDF & Image Converter

iLovePDF jaisa free online tool + Image Converter (Pixel Art, Convert, Resize, Compress)

## Tech Stack
- **Frontend**: React + Vite + PWA (Play Store ke liye ready)
- **PDF Backend**: Python FastAPI + PyMuPDF
- **Image Backend**: Python FastAPI + Pillow (NO GPU needed!)
- **Hosting**: Cloudflare Pages (free) + Railway.app (~₹500/mo)

## Features

### PDF Tools
- ✅ Merge PDF
- ✅ Split PDF
- ✅ Compress PDF
- ✅ PDF to Image
- ✅ Image to PDF
- ✅ Rotate PDF

### Image Tools
- ✅ Convert (JPG, PNG, WebP, AVIF, BMP, GIF, TIFF)
- ✅ Resize (by pixels, auto aspect ratio)
- ✅ Compress (quality slider)
- ✅ Crop
- ✅ Add Watermark
- ✅ Pixel Art (NO GPU — pure Pillow magic!)

## VS Code mein kaise run karein

### Step 1: Prerequisites
```
Node.js 18+ install karo: https://nodejs.org
Python 3.10+ install karo: https://python.org
```

### Step 2: Setup (Windows)
```
setup-windows.bat
```
### Step 2: Setup (Mac/Linux)
```bash
chmod +x setup.sh && ./setup.sh
```

### Step 3: Start karo
**Windows:**
```
start-all.bat
```
**Mac/Linux:**
```bash
./start-all.sh
```

### Step 4: Browser mein kholo
```
http://localhost:3000
```

### API Docs
```
PDF API:   http://localhost:8001/docs
Image API: http://localhost:8002/docs
```

## Project Structure
```
ilovepdf-clone/
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx       ← Homepage with all tools
│   │   │   ├── PDFTool.jsx    ← PDF tool page
│   │   │   └── ImageTool.jsx  ← Image tool page
│   │   └── components/
│   │       └── common/
│   │           ├── Navbar.jsx
│   │           ├── Footer.jsx
│   │           └── FileUploader.jsx
│   ├── vite.config.js
│   └── package.json
│
├── backend-pdf/
│   ├── main.py        ← All PDF endpoints
│   └── requirements.txt
│
├── backend-image/
│   ├── main.py        ← All Image endpoints (including Pixel Art)
│   └── requirements.txt
│
├── setup-windows.bat  ← Windows setup
├── start-all.bat      ← Windows start
├── setup.sh           ← Mac/Linux setup
└── start-all.sh       ← Mac/Linux start
```
