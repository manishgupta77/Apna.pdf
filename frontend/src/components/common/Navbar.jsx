import React, { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  return (
    <nav style={{
      background: 'white',
      borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, zIndex: 100,
      boxShadow: '0 1px 8px rgba(0,0,0,0.06)'
    }}>
      <div className="container" style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', height: 60
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            background: 'var(--primary)', color: 'white',
            width: 34, height: 34, borderRadius: 8,
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontWeight: 700, fontSize: 16
          }}>i</div>
          <span style={{ fontWeight: 700, fontSize: 18 }}>
            Convert<span style={{ color: 'var(--primary)' }}>PDF</span>
          </span>
        </Link>

        <div style={{ display: 'flex', gap: 8 }}>
          <Link to="/pdf/merge" style={{
            padding: '8px 16px', borderRadius: 8,
            color: 'var(--text-muted)', fontSize: 14, fontWeight: 500
          }}>PDF Tools</Link>
          <Link to="/image/convert" style={{
            padding: '8px 16px', borderRadius: 8,
            color: 'var(--text-muted)', fontSize: 14, fontWeight: 500
          }}>Image Tools</Link>
        </div>
      </div>
    </nav>
  )
}
