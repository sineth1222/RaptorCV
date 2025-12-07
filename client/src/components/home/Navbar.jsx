import React from 'react'
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { assets } from '../../assets/assets';

function Navbar() {

    const {user} = useSelector(state => state.auth)
    const [menuOpen, setMenuOpen] = React.useState(false);

    // Using the same Tailwind color for consistency and professional look
    const primaryColor = 'text-emerald-600';
    const primaryBg = 'bg-emerald-600';
    const primaryBgHover = 'hover:bg-emerald-700';


  return (
    
            <nav className="flex items-center justify-between w-full py-4 px-4 md:px-12 border-b border-gray-100 shadow-sm sticky top-0 bg-white z-50">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-1">
                    {/* Placeholder for 'R' logo icon */}
                    <div className="size-8 rounded-md flex items-center justify-center font-bold text-white bg-emerald-600 text-xl">R</div>
                    <span className={`text-2xl font-bold ${primaryColor}`}>aptor<span className='text-slate-700'>CV</span>.</span>
                </Link>

                {/* Desktop Nav Links and CTAs (Visible on large screens) */}
                <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-700">
                    <a href="#" className={`hover:${primaryColor} transition`}>HOME</a>
                    <a href="#features" className={`hover:${primaryColor} transition`}>FEATURES</a>
                    <a href="#template-showcase" className={`hover:${primaryColor} transition`}>TEMPLATE SHOWCASE</a>
                    <a href="#contact-us" className={`hover:${primaryColor} transition`}>CONTACT US</a>
                    
                    {/* Sign In / Dashboard */}
                    {!user ? (
                        <Link to='/app?state=login' className={`text-slate-700 hover:${primaryColor} transition`}>
                            SIGN IN
                        </Link>
                    ) : (
                        <Link to='/app' className={`text-slate-700 hover:${primaryColor} transition`}>
                            DASHBOARD
                        </Link>
                    )}
                    
                    {/* Create Resume CTA */}
                    <Link to='/app?state=register' className={`px-5 py-3 ${primaryBg} ${primaryBgHover} transition rounded-lg text-white font-semibold shadow-md shadow-emerald-200 active:scale-[0.98]`}>
                        Create Resume
                    </Link>
                </div>

                {/* Mobile Menu Button (Hamburger Icon) */}
                <button onClick={() => setMenuOpen(true)} className="lg:hidden active:scale-90 transition p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu"><path d="M4 12h16"/><path d="M4 6h16"/><path d="M4 18h16"/></svg>
                </button>

                {/* Mobile Menu (Slides from the right) */}
                            <div className={`fixed inset-0 z-50 bg-slate-900/90 backdrop-blur text-white flex flex-col items-center justify-center text-lg gap-8 lg:hidden transition-transform duration-300 ${menuOpen ? "translate-x-0" : "translate-x-full"}`} >
                                <a href="#" className="hover:text-emerald-400 transition">HOME</a>
                                <a href="#features" className="hover:text-emerald-400 transition">FEATURES</a>
                                <a href="#template-showcase" className="hover:text-emerald-400 transition">TEMPLATE SHOWCASE</a>
                                <a href="#contact-us" className="hover:text-emerald-400 transition">CONTACT US</a>
                                {!user ? (
                                    <Link to='/app?state=login' className="hover:text-emerald-400 transition">
                                        SIGN IN
                                    </Link>
                                ) : (
                                    <Link to='/app' className="hover:text-emerald-400 transition">
                                        DASHBOARD
                                    </Link>
                                )}
                                <Link to="/app?state=register" className={`px-5 py-3 ${primaryBg} ${primaryBgHover} transition rounded-lg text-white font-semibold`}>
                                    Create Resume
                                </Link>
                                <button onClick={() => setMenuOpen(false)} className="absolute top-6 right-6 p-2 text-white hover:text-emerald-400 active:scale-90 transition" >
                                    {/* Close Icon (X) */}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                                </button>
                            </div>
            </nav>

            
  )
}

export default Navbar
