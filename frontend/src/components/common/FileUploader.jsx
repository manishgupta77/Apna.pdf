import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

export default function FileUploader({ onFiles, accept, multiple = false, label }) {
  const onDrop = useCallback(files => onFiles(files), [onFiles])

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop, accept, multiple
  })

  return (
    <div>
      <div
        {...getRootProps()}
        style={{
          border: `2px dashed ${isDragActive ? 'var(--primary)' : 'var(--border)'}`,
          borderRadius: 'var(--radius)',
          padding: '48px 32px',
          textAlign: 'center',
          cursor: 'pointer',
          background: isDragActive ? 'var(--primary-light)' : 'var(--bg-secondary)',
          transition: 'all 0.2s'
        }}
      >
        <input {...getInputProps()} />
        <div style={{ fontSize: 48, marginBottom: 16 }}>📂</div>
        <p style={{ fontSize: 17, fontWeight: 600, marginBottom: 8 }}>
          {isDragActive ? 'Drop here!' : label || 'Drag & Drop your file here'}
        </p>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
          or click to browse
        </p>
        <button className="btn-primary" type="button">Choose File</button>
      </div>

      {acceptedFiles.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Selected files:</p>
          {acceptedFiles.map((file, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px',
              background: '#f0fdf4',
              border: '1px solid #86efac',
              borderRadius: 8, marginBottom: 6
            }}>
              <span style={{ fontSize: 18 }}>📄</span>
              <span style={{ fontSize: 14, fontWeight: 500 }}>{file.name}</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>
                {(file.size / 1024).toFixed(1)} KB
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
