import React from 'react'
import { Link } from 'react-router-dom'
const PDF_TOOLS = [
  { id: 'merge',    icon: '🔗', title: 'Merge PDF',       desc: 'Combine multiple PDFs into one',    color: '#E8432D' },
  { id: 'split',    icon: '✂️', title: 'Split PDF',       desc: 'Split PDF into separate files',     color: '#F59E0B' },
  { id: 'compress', icon: '🗜️', title: 'Compress PDF',    desc: 'Reduce PDF file size',              color: '#10B981' },
  { id: 'pdf2img',  icon: '🖼️', title: 'PDF to Image',    desc: 'Convert PDF pages to images',       color: '#8B5CF6' },
  { id: 'img2pdf',  icon: '📄', title: 'Image to PDF',    desc: 'Convert images to PDF',             color: '#3B82F6' },
  { id: 'rotate',   icon: '🔄', title: 'Rotate PDF',      desc: 'Rotate pages in your PDF',          color: '#EC4899' },
  { id: 'pdf2word', icon: '📝', title: 'PDF to Word',     desc: 'Convert PDF to editable DOCX',      color: '#2563EB' },
  { id: 'word2pdf', icon: '📄', title: 'Word to PDF',     desc: 'Convert DOCX to PDF',               color: '#7C3AED' },
  { id: 'pdf2excel', icon: '📊',title: 'PDF to Excel',    desc: 'Extract PDF data to XLSX',          color: '#059669' },
  { id: 'excel2pdf', icon: '📋',title: 'Excel to PDF',    desc: 'Convert XLSX to PDF',               color: '#0891B2' },
  { id: 'pdf2ppt', icon: '📊', title: 'PDF to PowerPoint',desc: 'Convert PDF to PPTX slides',        color: '#F97316' },
  { id: 'ppt2pdf', icon: '📑', title: 'PowerPoint to PDF',desc: 'Convert PPTX to PDF',               color: '#8B5CF6' },
]


const IMAGE_TOOLS = [
  { id: 'convert',  icon: '🔄', title: 'Convert Image',   desc: 'JPG, PNG, WebP, AVIF, BMP, GIF',   color: '#E8432D' },
  { id: 'resize',   icon: '📐', title: 'Resize Image',    desc: 'Change image dimensions (px/%)',    color: '#F59E0B' },
  { id: 'compress', icon: '🗜️', title: 'Compress Image',  desc: 'Reduce image file size',            color: '#10B981' },
  { id: 'crop',     icon: '✂️', title: 'Crop Image',      desc: 'Crop to custom dimensions',         color: '#8B5CF6' },
  { id: 'watermark',icon: '💧', title: 'Watermark',       desc: 'Add text watermark to image',       color: '#3B82F6' },
  { id: 'pixel',    icon: '🎨', title: 'Pixel Art',       desc: 'Convert image to pixel art style',  color: '#EC4899' },
  { id: 'rotate', icon: '🔁',   title: 'Rotate Image',    desc: 'Rotate 90°, 180°, 270°',            color: '#F97316' },
  { id: 'flip',   icon: '↔️',   title: 'Flip Image',      desc: 'Flip horizontal or vertical',       color: '#EC4899' },
]

function ToolCard({ tool, type }) {
  return (
    <Link to={`/${type}/${tool.id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: 'white',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: 24,
        transition: 'all 0.2s',
        cursor: 'pointer',
      }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-4px)'
          e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)'
          e.currentTarget.style.borderColor = tool.color
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = 'none'
          e.currentTarget.style.borderColor = 'var(--border)'
        }}
      >
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: tool.color + '15',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 24,
          marginBottom: 12
        }}>{tool.icon}</div>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{tool.title}</h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{tool.desc}</p>
      </div>
    </Link>
  )
}

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #fff0ee 0%, #ffffff 60%)',
        padding: '64px 0 48px',
        textAlign: 'center'
      }}>
        <div className="container">
          <h1 style={{ fontSize: 42, fontWeight: 800, lineHeight: 1.2, marginBottom: 16 }}>
            Free Online <span style={{ color: 'var(--primary)' }}>PDF & Image</span> Tools
          </h1>
          <p style={{ fontSize: 18, color: 'var(--text-muted)', maxWidth: 520, margin: '0 auto' }}>
            Merge, split, compress PDFs. Convert, resize, compress images.
            All free, no signup required.
          </p>
        </div>
      </div>

      {/* PDF Tools */}
      <div className="container" style={{ marginTop: 56 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
          📄 PDF Tools
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
          Everything you need to work with PDF files
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 16
        }}>
          {PDF_TOOLS.map(tool => (
            <ToolCard key={tool.id} tool={tool} type="pdf" />
          ))}
        </div>
      </div>

      {/* Image Tools */}
      <div className="container" style={{ marginTop: 56 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
          🖼️ Image Tools
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
          Pixel-perfect image editing, no design skills needed
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 16
        }}>
          {IMAGE_TOOLS.map(tool => (
            <ToolCard key={tool.id} tool={tool} type="image" />
          ))}
        </div>
      </div>

      {/* Trust section */}
      <div style={{ background: 'var(--bg-secondary)', marginTop: 72, padding: '48px 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 48, flexWrap: 'wrap' }}>
            {[
              { icon: '🔒', text: 'Files auto-deleted after 1hr' },
              { icon: '⚡', text: 'Fast processing, no signup' },
              { icon: '📱', text: 'Works on mobile too' },
            ].map((item, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{item.icon}</div>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
