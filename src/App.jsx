import { useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UploadForm from './components/Upload';
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import MainDisplay from './components/MainDisplay'

function App() {

  return (
    <Router>
      <Navbar />
      <div className="inset-0 -z-10 h-full w-full items-center px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]">
        <Routes>
          <Route path="/" element={<MainDisplay />} />
          <Route path="/home" element={<MainDisplay />} />
          <Route path="/upload" element={<UploadForm />} />
        </Routes>
      </div>
      <Footer />
    </Router>
  )
}

export default App
