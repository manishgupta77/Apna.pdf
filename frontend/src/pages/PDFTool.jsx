import { PDF_API } from '../api.js'
import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import FileUploader from '../components/common/FileUploader.jsx'
import toast from 'react-hot-toast'
import axios from 'axios'

const TOOL_CONFIG = {
  merge: { title: 'Merge PDF', desc: 'Select multiple PDFs to merge', icon: '🔗', multiple: true },
  split: { title: 'Split PDF', desc: 'Select a PDF to split', icon: '✂️', multiple: false },
  compress: { title: 'Compress PDF', desc: 'Select a PDF to compress', icon: '🗜️', multiple: false },
  pdf2img: { title: 'PDF to Image', desc: 'Select a PDF to convert', icon: '🖼️', multiple: false },
  img2pdf: { title: 'Image to PDF', desc: 'Select images to convert', icon: '📄', multiple: true },
  rotate: { title: 'Rotate PDF', desc: 'Select a PDF to rotate', icon: '🔄', multiple: false },
  pdf2word: { title: 'PDF to Word', desc: 'Select a PDF to convert to DOCX', icon: '📝', multiple: false },
  word2pdf: { title: 'Word to PDF', desc: 'Select a DOCX file to convert', icon: '📃', multiple: false },
  pdf2excel: { title: 'PDF to Excel', desc: 'Select a PDF to extract data', icon: '📊', multiple: false },
  excel2pdf: { title: 'Excel to PDF', desc: 'Select an XLSX file to convert', icon: '📋', multiple: false },
  pdf2ppt: { title: 'PDF to PowerPoint', desc: 'Select a PDF to convert to PPTX', icon: '📊', multiple: false },
  ppt2pdf: { title: 'PowerPoint to PDF', desc: 'Select a PPTX file to convert', icon: '📑', multiple: false },
}

export default function PDFTool() {
  const { tool } = useParams()
  const config = TOOL_CONFIG[tool] || { title: 'PDF Tool', desc: '', icon: '📄', multiple: false }
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [options, setOptions] = useState({ rotate_degrees: 90, password: '', position: 'bottom-center' })

  const getAccept = () => {
    if (tool === 'word2pdf') return { 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] }
    if (tool === 'excel2pdf') return { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] }
    if (tool === 'ppt2pdf') return { 'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'] }
    if (tool === 'img2pdf') return { 'image/*': ['.jpg', '.jpeg', '.png'] }
    return { 'application/pdf': ['.pdf'] }
  }

  const handleProcess = async () => {
    if (!files.length) return toast.error('Please select a file first')
    setLoading(true)
    try {
      const formData = new FormData()
      files.forEach(f => formData.append('files', f))
      if (tool === 'rotate') formData.append('degrees', options.rotate_degrees)
      if (tool === 'protect') formData.append('password', options.password)
      if (tool === 'unlock') formData.append('password', options.password)
      if (tool === 'pagenumbers') formData.append('position', options.position)

      const endpoint = {
        merge: `${PDF_API}/merge`,
        split: `${PDF_API}/split`,
        compress: `${PDF_API}/compress`,
        pdf2img: `${PDF_API}/pdf-to-image`,
        img2pdf: `${PDF_API}/image-to-pdf`,
        rotate: `${PDF_API}/rotate`,
        pdf2word: `${PDF_API}/pdf-to-word`,
        word2pdf: `${PDF_API}/word-to-pdf`,
        pdf2excel: `${PDF_API}/pdf-to-excel`,
        excel2pdf: `${PDF_API}/excel-to-pdf`,
        pdf2ppt: `${PDF_API}/pdf-to-ppt`,
        ppt2pdf: `${PDF_API}/ppt-to-pdf`,
      }[tool]

      const res = await axios.post(endpoint, formData, { responseType: 'blob' })
      const url = URL.createObjectURL(new Blob([res.data]))
      const ext = tool === 'pdf2img' || tool === 'split' ? 'zip'
        : tool === 'pdf2word' ? 'docx'
          : tool === 'pdf2excel' ? 'xlsx'
            : tool === 'pdf2ppt' ? 'pptx'
              : 'pdf'
      setResult({ url, ext })
      toast.success('Done! Click Download to save your file.')
    } catch (err) {
      toast.error('Something went wrong. Is the backend running?')
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
          multiple={config.multiple}
          accept={getAccept()}
          label={config.desc}
        />

        {tool === 'rotate' && (
          <div style={{ marginTop: 20 }}>
            <label style={{ fontSize: 14, fontWeight: 600 }}>Rotation angle:</label>
            <select
              value={options.rotate_degrees}
              onChange={e => setOptions(o => ({ ...o, rotate_degrees: Number(e.target.value) }))}
              style={{ marginLeft: 12, padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14 }}
            >
              <option value={90}>90° clockwise</option>
              <option value={180}>180°</option>
              <option value={270}>270° clockwise</option>
            </select>
          </div>
        )}

        {tool === 'protect' && (
          <div style={{ marginTop: 20 }}>
            <label style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 8 }}>Set Password:</label>
            <input type="password" value={options.password}
              onChange={e => setOptions(o => ({ ...o, password: e.target.value }))}
              placeholder="Enter password to set"
              style={{ padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, width: '100%' }}
            />
          </div>
        )}

        {tool === 'unlock' && (
          <div style={{ marginTop: 20 }}>
            <label style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 8 }}>Enter Current Password:</label>
            <input type="password" value={options.password}
              onChange={e => setOptions(o => ({ ...o, password: e.target.value }))}
              placeholder="Enter PDF password to remove"
              style={{ padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, width: '100%' }}
            />
          </div>
        )}

        {tool === 'pagenumbers' && (
          <div style={{ marginTop: 20 }}>
            <label style={{ fontSize: 14, fontWeight: 600 }}>Position:</label>
            <select
              value={options.position}
              onChange={e => setOptions(o => ({ ...o, position: e.target.value }))}
              style={{ marginLeft: 12, padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14 }}
            >
              <option value="bottom-center">Bottom Center</option>
              <option value="bottom-right">Bottom Right</option>
              <option value="bottom-left">Bottom Left</option>
            </select>
          </div>
        )}

        <button className="btn-primary"
          onClick={handleProcess}
          disabled={loading || !files.length}
          style={{ width: '100%', marginTop: 24, fontSize: 16, padding: '14px', opacity: loading || !files.length ? 0.6 : 1 }}
        >
          {loading ? '⏳ Processing...' : `${config.icon} ${config.title}`}
        </button>

        {result && (
          <a

            href={result.url}
            download={`result.${result.ext}`}
            className="btn-primary"
            style={{ display: 'block', textAlign: 'center', marginTop: 16, padding: '14px', background: '#10B981', fontSize: 16 }}
          >
            ⬇️ Download Result
          </a>
        )}
      </div>
    </div>
  )
}