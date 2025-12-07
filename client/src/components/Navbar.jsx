//import { Link2 } from 'lucide-react'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { logout } from '../app/features/authSlice'
import { CircleUserIcon } from 'lucide-react'

const Navbar = () => {

    const {user} = useSelector(state => state.auth)
    const dispatch = useDispatch()

    const navigate = useNavigate()

    const logoutUser = () => {
        navigate('/')
        dispatch(logout())
    }

    const primaryColor = 'text-emerald-600';
    const primaryBg = 'bg-emerald-600';
    const primaryBgHover = 'hover:bg-emerald-700';

  return (
    <div className='shadow bg-white'>
      <nav className='flex items-center justify-between max-w-7xl mx-auto px-4 py-3.5 text-slate-800 transition-all'>
        <Link to='/' className="flex items-center gap-1">
            <div className="size-8 rounded-md flex items-center justify-center font-bold text-white bg-emerald-600 text-xl">R</div>
            <span className={`text-2xl font-bold ${primaryColor}`}>aptor<span className='text-slate-700'>CV</span>.</span>
        </Link>

        <div className='flex items-center gap-4 text-sm'>
            <p className='max-sm:hidden flex items-center gap-1'>
              <CircleUserIcon className='size-5 text-gray-700' /> {/* Icon එක */}
              Hi, {user?.name}
            </p>
            <button onClick={logoutUser} className={`px-5 py-3 ${primaryBg} ${primaryBgHover} transition rounded-lg text-white font-semibold shadow-md shadow-emerald-200 active:scale-[0.98]`}>Logout</button>
        </div>
      </nav>
    </div>
  )
}

export default Navbar
