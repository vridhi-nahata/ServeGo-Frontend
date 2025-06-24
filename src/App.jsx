import { Routes,Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import EmailVerify from './pages/EmailVerify'
import ResetPassword from './pages/ResetPassword'
import Services from './pages/Services'
import ServiceDetail from './pages/ServiceDetail'
import ProviderProfile from "./pages/ProviderProfile";
import { ToastContainer, toast } from 'react-toastify';

function App() {
  return (
    <>
    <ToastContainer/>
    <Navbar />
      <div className="pt-15">{/* offset for fixed header */}
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/email-verify" element={<EmailVerify/>} />
        <Route path="/reset-password" element={<ResetPassword/>} />
        <Route path="/services" element={<Services/>} />
        <Route path="/services/:serviceName" element={<ServiceDetail />} />
        <Route path="/provider/:providerId" element={<ProviderProfile />} />
      </Routes>
      </div>
    </>
  )
}

export default App
