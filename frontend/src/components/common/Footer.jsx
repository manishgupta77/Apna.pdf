import React from 'react'

export default function Footer() {
  return (
    <footer style={{
      background: '#1a1a2e', color: '#9ca3af',
      padding: '40px 0', marginTop: 80
    }}>
      <div className="container" style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 14 }}>
          © 2025 iConvertPDF — Free PDF & Image Tools
        </p>
        <p style={{ fontSize: 12, marginTop: 8 }}>
          Files are deleted from server after 1 hour
        </p>
      </div>
    </footer>
  )
}
