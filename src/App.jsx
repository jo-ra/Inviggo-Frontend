import { useState, useEffect } from 'react'


import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import AdDetails from './pages/AdDetails.jsx'
import AddAd from './pages/AddAd.jsx'
import EditAd from './pages/EditAd.jsx'
import { AuthProvider } from './services/AuthContext.jsx';
import { AdsProvider } from './services/AdsContext.jsx';
import {Routes,Route} from 'react-router-dom'
import NavBar from './components/NavBar.jsx'
import './css/App.css'


function App() {

  return (
    <AuthProvider>
      <AdsProvider>
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ads" element={<Home />} />
          <Route path="/ad/:id" element={<AdDetails />} />
          <Route path="/add-ad" element={<AddAd />} />
          <Route path="/edit-ad/:id" element={<EditAd />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
         
        </Routes>
      </AdsProvider>
    </AuthProvider>
  )

}

export default App
