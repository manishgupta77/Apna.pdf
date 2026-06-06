import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/common/Navbar.jsx'
import Footer from './components/common/Footer.jsx'
import Home from './pages/Home.jsx'
import PDFTool from './pages/PDFTool.jsx'
import ImageTool from './pages/ImageTool.jsx'

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pdf/:tool" element={<PDFTool />} />
          <Route path="/image/:tool" element={<ImageTool />} />
        </Routes>
      </main>
      <Footer />
      <Toaster position="top-center" />
    </>
  )
}
