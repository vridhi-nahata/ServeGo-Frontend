import './App.css'
import { Routes,Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import EmailVerify from './pages/EmailVerify'
import ResetPassword from './pages/ResetPassword'
import { ToastContainer, toast } from 'react-toastify';

function App() {
  return (
    <>
    <ToastContainer/>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/email-verify" element={<EmailVerify/>} />
        <Route path="/reset-password" element={<ResetPassword/>} />
      </Routes>
    </>
  )
}

export default App
