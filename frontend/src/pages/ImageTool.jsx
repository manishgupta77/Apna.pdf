import { IMAGE_API } from '../api.js'
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import FileUploader from '../components/common/FileUploader.jsx'
import toast from 'react-hot-toast'
import axios from 'axios'

const TOOL_CONFIG = {
  convert: { title: 'Convert Image', desc: 'Convert between image formats', icon: '🔄' },
  resize: { title: 'Resize Image', desc: 'Change image width & height', icon: '📐' },
  compress: { title: 'Compress Image', desc: 'Reduce image file size', icon: '🗜️' },
  crop: { title: 'Crop Image', desc: 'Drag to select crop area', icon: '✂️' },
  watermark: { title: 'Add Watermark', desc: 'Add text watermark to your image', icon: '💧' },
  pixel: { title: 'Pixel Art', desc: 'Convert to pixel art style (no GPU)', icon: '🎨' },
  rotate: { title: 'Rotate Image', desc: 'Rotate image 90°, 180°, 270°', icon: '🔁' },
  flip: { title: 'Flip Image', desc: 'Flip horizontal or vertical', icon: '↔️' },
}

const FORMATS = ['jpeg', 'png', 'webp', 'avif', 'bmp', 'gif', 'tiff']

// ─── Visual Crop Component ─────────────────────────────
function CropSelector({ imageUrl, onCropChange }) {
  const containerRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [start, setStart] = useState({ x: 0, y: 0 })
  const [box, setBox] = useState(null)
  const [imgSize, setImgSize] = useState({ w: 1, h: 1, natW: 1, natH: 1 })

  const getPos = (e, el) => {
    const rect = el.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    return {
      x: Math.max(0, Math.min(clientX - rect.left, rect.width)),
      y: Math.max(0, Math.min(clientY - rect.top, rect.height)),
    }
  }

  const onMouseDown = (e) => {
    e.preventDefault()
    const el = containerRef.current
    const pos = getPos(e, el)
    setStart(pos)
    setBox(null)
    setDragging(true)
  }

  const onMouseMove = useCallback((e) => {
    if (!dragging) return
    const el = containerRef.current
    const pos = getPos(e, el)
    const newBox = {
      x: Math.min(start.x, pos.x),
      y: Math.min(start.y, pos.y),
      w: Math.abs(pos.x - start.x),
      h: Math.abs(pos.y - start.y),
    }
    setBox(newBox)

    // Convert to actual image pixels
    const scaleX = imgSize.natW / imgSize.w
    const scaleY = imgSize.natH / imgSize.h
    onCropChange({
      x: Math.round(newBox.x * scaleX),
      y: Math.round(newBox.y * scaleY),
      width: Math.round(newBox.w * scaleX),
      height: Math.round(newBox.h * scaleY),
    })
  }, [dragging, start, imgSize, onCropChange])

  const onMouseUp = useCallback(() => setDragging(false), [])

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('touchmove', onMouseMove)
    window.addEventListener('touchend', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('touchmove', onMouseMove)
      window.removeEventListener('touchend', onMouseUp)
    }
  }, [onMouseMove, onMouseUp])

  return (
    <div style={{ marginTop: 16 }}>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
        🖱️ Image pe drag karo crop area select karne ke liye:
      </p>
      <div
        ref={containerRef}
        onMouseDown={onMouseDown}
        onTouchStart={onMouseDown}
        style={{
          position: 'relative', display: 'inline-block',
          cursor: 'crosshair', userSelect: 'none', width: '100%'
        }}
      >
        <img
          src={imageUrl}
          alt="crop preview"
          onLoad={e => {
            setImgSize({
              w: e.target.offsetWidth,
              h: e.target.offsetHeight,
              natW: e.target.naturalWidth,
              natH: e.target.naturalHeight,
            })
          }}
          style={{
            width: '100%', display: 'block',
            borderRadius: 8, border: '1px solid var(--border)'
          }}
          draggable={false}
        />
        {box && box.w > 5 && box.h > 5 && (
          <>
            {/* Dark overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0.4)',
              borderRadius: 8,
            }} />
            {/* Bright crop area */}
            <div style={{
              position: 'absolute',
              left: box.x, top: box.y,
              width: box.w, height: box.h,
              border: '2px solid var(--primary)',
              background: 'rgba(255,255,255,0.1)',
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.4)',
              borderRadius: 2,
            }} />
            {/* Dimensions label */}
            <div style={{
              position: 'absolute',
              left: box.x, top: box.y - 24,
              background: 'var(--primary)', color: 'white',
              fontSize: 11, padding: '2px 8px', borderRadius: 4,
              fontWeight: 600, whiteSpace: 'nowrap'
            }}>
              {Math.round(box.w * (imgSize.natW / imgSize.w))} × {Math.round(box.h * (imgSize.natH / imgSize.h))} px
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────
export default function ImageTool() {
  const { tool } = useParams()
  const config = TOOL_CONFIG[tool] || { title: 'Image Tool', desc: '', icon: '🖼️' }
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [cropData, setCropData] = useState({ x: 0, y: 0, width: 100, height: 100 })
  const [options, setOptions] = useState({
    format: 'png',
    width: '',
    height: '',
    quality: 85,
    watermark_text: 'Sample Watermark',
    pixel_size: 8,
    degrees: 90,
    direction: 'horizontal',
  })

  // Jab file select ho to preview banao
  useEffect(() => {
    if (files.length > 0) {
      const url = URL.createObjectURL(files[0])
      setPreviewUrl(url)
      setResult(null)
      return () => URL.revokeObjectURL(url)
    }
  }, [files])

  const handleProcess = async () => {
    if (!files.length) return toast.error('Please select a file first')
    if (tool === 'crop' && cropData.width < 5) return toast.error('Pehle image pe drag karke crop area select karo!')
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', files[0])

      if (tool === 'convert') formData.append('format', options.format)
      if (tool === 'resize') {
        if (options.width) formData.append('width', options.width)
        if (options.height) formData.append('height', options.height)
        formData.append('format', options.format)
      }
      if (tool === 'compress') {
        formData.append('quality', options.quality)
        formData.append('format', options.format)
      }
      if (tool === 'crop') {
        formData.append('x', cropData.x)
        formData.append('y', cropData.y)
        formData.append('width', cropData.width)
        formData.append('height', cropData.height)
        formData.append('format', options.format)
      }
      if (tool === 'watermark') {
        formData.append('watermark_text', options.watermark_text)
        formData.append('format', options.format)
      }
      if (tool === 'pixel') {
        formData.append('pixel_size', options.pixel_size)
        formData.append('format', options.format)
      }
      if (tool === 'rotate') {
        formData.append('degrees', options.degrees)
        formData.append('format', options.format)
      }
      if (tool === 'flip') {
        formData.append('direction', options.direction)
        formData.append('format', options.format)
      }

      const endpoint = {
        convert: `${IMAGE_API}/convert`,
        resize: `${IMAGE_API}/resize`,
        compress: `${IMAGE_API}/compress`,
        crop: `${IMAGE_API}/crop`,
        watermark: `${IMAGE_API}/watermark`,
        pixel: `${IMAGE_API}/pixel-art`,
        rotate: `${IMAGE_API}/rotate`,
        flip: `${IMAGE_API}/flip`,
      }[tool]

      const res = await axios.post(endpoint, formData, { responseType: 'blob' })
      const url = URL.createObjectURL(new Blob([res.data]))
      setResult(url)
      toast.success('Done! Click Download to save.')
    } catch (err) {
      toast.error('Error processing. Is the image backend running?')
      console.error(err)
    }
    setLoading(false)
  }

  return (
    <div className="container" style={{ paddingTop: 48, paddingBottom: 80 }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>{config.icon}</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>{config.title}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 16 }}>{config.desc}</p>
        </div>

        <FileUploader
          onFiles={setFiles}
          multiple={false}
          accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.gif', '.tiff', '.avif'] }}
        />

        {/* Crop: visual selector */}
        {tool === 'crop' && previewUrl && (
          <CropSelector imageUrl={previewUrl} onCropChange={setCropData} />
        )}

        {/* Options panel */}
        <div style={{
          marginTop: 20, padding: 20,
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)'
        }}>

          {/* Format selector — sab tools ke liye */}
          {tool !== 'crop' && (
            <div style={{ marginBottom: tool === 'convert' ? 0 : 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>
                Output format:
              </label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {FORMATS.map(f => (
                  <button key={f}
                    onClick={() => setOptions(o => ({ ...o, format: f }))}
                    style={{
                      padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                      border: '2px solid',
                      borderColor: options.format === f ? 'var(--primary)' : 'var(--border)',
                      background: options.format === f ? 'var(--primary-light)' : 'white',
                      color: options.format === f ? 'var(--primary)' : 'var(--text-muted)',
                    }}
                  >{f.toUpperCase()}</button>
                ))}
              </div>
            </div>
          )}

          {tool === 'resize' && (
            <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
              {[['Width (px)', 'width'], ['Height (px)', 'height']].map(([label, key]) => (
                <div key={key}>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>{label}</label>
                  <input type="number" value={options[key]}
                    onChange={e => setOptions(o => ({ ...o, [key]: e.target.value }))}
                    placeholder="auto"
                    style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, width: 120 }}
                  />
                </div>
              ))}
            </div>
          )}

          {tool === 'compress' && (
            <div style={{ marginTop: 16 }}>
              <label style={{ fontSize: 14, fontWeight: 600 }}>Quality: {options.quality}%</label>
              <input type="range" min={10} max={100} value={options.quality}
                onChange={e => setOptions(o => ({ ...o, quality: Number(e.target.value) }))}
                style={{ width: '100%', marginTop: 10 }} />
            </div>
          )}

          {tool === 'crop' && (
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                Selected area:
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                X: {cropData.x}px, Y: {cropData.y}px,
                Width: {cropData.width}px, Height: {cropData.height}px
              </p>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginTop: 12, marginBottom: 8 }}>
                Output format:
              </label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {FORMATS.map(f => (
                  <button key={f}
                    onClick={() => setOptions(o => ({ ...o, format: f }))}
                    style={{
                      padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                      border: '2px solid',
                      borderColor: options.format === f ? 'var(--primary)' : 'var(--border)',
                      background: options.format === f ? 'var(--primary-light)' : 'white',
                      color: options.format === f ? 'var(--primary)' : 'var(--text-muted)',
                    }}
                  >{f.toUpperCase()}</button>
                ))}
              </div>
            </div>
          )}

          {tool === 'watermark' && (
            <div style={{ marginTop: 16 }}>
              <label style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 8 }}>Watermark text:</label>
              <input type="text" value={options.watermark_text}
                onChange={e => setOptions(o => ({ ...o, watermark_text: e.target.value }))}
                style={{ padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, width: '100%' }}
              />
            </div>
          )}

          {tool === 'pixel' && (
            <div style={{ marginTop: 16 }}>
              <label style={{ fontSize: 14, fontWeight: 600 }}>Pixel block size: {options.pixel_size}px</label>
              <input type="range" min={2} max={32} value={options.pixel_size}
                onChange={e => setOptions(o => ({ ...o, pixel_size: Number(e.target.value) }))}
                style={{ width: '100%', marginTop: 10 }} />
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                Larger value = more pixelated (no GPU needed)
              </p>
            </div>
          )}

          {tool === 'rotate' && (
            <div>
              <label style={{ fontSize: 14, fontWeight: 600 }}>Rotation angle:</label>
              <select value={options.degrees}
                onChange={e => setOptions(o => ({ ...o, degrees: Number(e.target.value) }))}
                style={{ marginLeft: 12, padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14 }}>
                <option value={90}>90° clockwise</option>
                <option value={180}>180°</option>
                <option value={270}>270° clockwise</option>
              </select>
            </div>
          )}

          {tool === 'flip' && (
            <div style={{ display: 'flex', gap: 10 }}>
              {['horizontal', 'vertical'].map(d => (
                <button key={d} onClick={() => setOptions(o => ({ ...o, direction: d }))}
                  style={{
                    padding: '8px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600,
                    border: '2px solid',
                    borderColor: options.direction === d ? 'var(--primary)' : 'var(--border)',
                    background: options.direction === d ? 'var(--primary-light)' : 'white',
                    color: options.direction === d ? 'var(--primary)' : 'var(--text-muted)',
                  }}
                >{d === 'horizontal' ? '↔️ Horizontal' : '↕️ Vertical'}</button>
              ))}
            </div>
          )}

        </div>

        <button className="btn-primary"
          onClick={handleProcess}
          disabled={loading || !files.length}
          style={{
            width: '100%', marginTop: 20, fontSize: 16, padding: '14px',
            opacity: loading || !files.length ? 0.6 : 1
          }}
        >
          {loading ? '⏳ Processing...' : `${config.icon} ${config.title}`}
        </button>

        {result && (
          <div style={{ marginTop: 20 }}>
            <img src={result} alt="result" style={{
              width: '100%', borderRadius: 'var(--radius)',
              border: '1px solid var(--border)', marginBottom: 12
            }} />
            <a href={result}
              download={`result.${options.format || 'png'}`}
              className="btn-primary"
              style={{ display: 'block', textAlign: 'center', padding: '14px', background: '#10B981', fontSize: 16 }}
            >⬇️ Download Result</a>
          </div>
        )}
      </div>
    </div>
  )
}