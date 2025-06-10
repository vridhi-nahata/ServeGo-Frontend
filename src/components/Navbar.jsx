import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

function Navbar() {
  const navigate=useNavigate();
  return (
    <div className='w-full flex justify-between items-center p-5 absolute top-0 bg-white shadow-md'>
        <div className='flex items-center gap-2'>
            <img src={assets.logo} alt="logo" className="w-6 sm:w-10"/>
            <p className='text-blue-800 font-extrabold hidden xs:block'>ServeGo</p>
        </div>
        <button onClick={()=>navigate('/login')} className='flex items-center gap-2 px-2 py-2 text-stone-900 hover:bg-grayy-100 transition-all rounded-3xl bg-emerald-500'>
            <p className='hidden xs:block'>Login</p>
            <img src={assets.arrow_icon} alt="arrow" className='w-5' />
        </button>
    </div>
  )
}

export default Navbar
