import { useState, useEffect } from 'react'

// import './App.css'
import AdsHomepage from './Ad'
import AdCard from './components/AdCard.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import AdDetails from './pages/AdDetails.jsx'
import { AuthProvider } from './services/AuthContext.jsx';
import {BrowserRouter, Routes,Route} from 'react-router-dom'
import NavBar from './components/NavBar.jsx'
import './css/App.css'


function App() {
  const [ads, setAds] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8080/ad/getAll')
        .then(res => res.json())
        .then(data => setAds(data.content ?? []))
        .catch(err => console.error(err));
  }, []);

  return (
    <AuthProvider>
  
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ads" element={<Home />} />
          <Route path="/ad/:id" element={<AdDetails ads={ads} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
         
        </Routes>

    </AuthProvider>
  )

}

export default App
