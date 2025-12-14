import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Menu, X, ArrowUp } from 'lucide-react';

function Navbar() {

    const {user} = useSelector(state => state.auth);
    const [menuOpen, setMenuOpen] = useState(false);
    
    // States
    const [isVisible, setIsVisible] = useState(true);
    const [isAtTop, setIsAtTop] = useState(true);

    // Tailwind වර්ණ නියතයන්
    const primaryColor = 'text-emerald-600';
    const primaryBg = 'bg-emerald-600';
    const primaryBgHover = 'hover:bg-emerald-700';
    const buttonprimaryBg = 'bg-slate-900';
    const buttonprimaryBgHover = 'hover:bg-slate-900/90';
    const transitionStyles = 'transition-transform duration-300 ease-in-out';

    // Scroll event logic (වෙනස් කර නැත)
    useEffect(() => {
        let lastScrollY = window.scrollY;

        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            
            if (currentScrollY > 100) {
                if (currentScrollY > lastScrollY) {
                    setIsVisible(false);
                } 
                else if (currentScrollY < lastScrollY) {
                    setIsVisible(true);
                }
                
                setIsAtTop(false);
                
            } else {
                setIsVisible(true);
                setIsAtTop(true);
            }

            lastScrollY = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const bringNavbarBack = () => {
        setIsVisible(true);
        /*window.scrollTo({
            top: 0,
            behavior: 'smooth' 
        });*/
    }

    return (
        <>
            {/* -------------------- 1. Navbar -------------------- */}
            <nav 
                className={`flex items-center justify-between w-full py-4 px-4 md:px-12 border-b border-gray-100 shadow-md fixed top-0 bg-white z-50 ${transitionStyles} 
                    ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}
            >
                {/* Logo */}
                <Link to="/" className="flex items-center gap-1">
                    <div className="size-8 rounded-md flex items-center justify-center font-bold text-white bg-emerald-600 text-xl">R</div>
                    <span className={`text-2xl font-bold ${primaryColor}`}>aptor<span className='text-slate-700'>CV</span>.</span>
                </Link>

                {/* Desktop Nav Links and CTAs */}
                <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-700">
                    <a href="#" className={`hover:${primaryColor} transition`}>HOME</a>
                    <a href="#features" className={`hover:${primaryColor} transition`}>FEATURES</a>
                    <a href="#template-showcase" className={`hover:${primaryColor} transition`}>TEMPLATE SHOWCASE</a>
                    <a href="#contact-us" className={`hover:${primaryColor} transition`}>CONTACT US</a>
                    
                    {!user ? (
                        <Link to='/app?state=login' className={`text-slate-700 hover:${primaryColor} transition`}>SIGN IN</Link>
                    ) : (
                        <Link to='/app' className={`text-slate-700 hover:${primaryColor} transition`}>DASHBOARD</Link>
                    )}
                    
                    <Link to='/app?state=register' className={`px-5 py-3 ${primaryBg} ${primaryBgHover} transition rounded-lg text-white font-semibold shadow-md shadow-emerald-200 active:scale-[0.98]`}>
                        Create Resume
                    </Link>
                </div>

                {/* Mobile Menu Button (Hamburger Icon) - Mobile වලට පමණයි */}
                <button 
                    onClick={() => setMenuOpen(true)} 
                    className="lg:hidden active:scale-90 transition p-2"
                >
                    <Menu size={28} className='text-slate-700' />
                </button>

                {/* Mobile Menu (Slides from the right) */}
                {/* **යාවත්කාලීන කළා:** Menu එක තිරයෙන් පිටත තබන විට, overflow-hidden සහ වමේ සිට දකුණටම ආවරණය වන පරිදි classes යෙදුවා. */}
                <div 
                    className={`fixed inset-0 z-100 bg-slate-900/90 backdrop-blur text-white flex flex-col items-center justify-center lg:hidden text-lg gap-8 transition-transform duration-300 h-screen ${menuOpen ? "translate-x-0" : "translate-x-full"}`} 
                    // `z-[100]` මගින් සියලු elements වලට වඩා ඉහලින් පෙන්වීම සහතික කරයි.
                    // `left-0` සහ `w-full` මගින් එය තිරයේ වමේ සිටම ආරම්භ වන බව සහතික කරයි.
                >
                    <a href="#" onClick={() => setMenuOpen(false)} className="hover:text-emerald-400 transition">HOME</a>
                    <a href="#features" onClick={() => setMenuOpen(false)} className="hover:text-emerald-400 transition">FEATURES</a>
                    <a href="#template-showcase" onClick={() => setMenuOpen(false)} className="hover:text-emerald-400 transition">TEMPLATE SHOWCASE</a>
                    <a href="#contact-us" onClick={() => setMenuOpen(false)} className="hover:text-emerald-400 transition">CONTACT US</a>
                    {!user ? (
                        <Link to='/app?state=login' onClick={() => setMenuOpen(false)} className="hover:text-emerald-400 transition">SIGN IN</Link>
                    ) : (
                        <Link to='/app' onClick={() => setMenuOpen(false)} className="hover:text-emerald-400 transition">DASHBOARD</Link>
                    )}
                    <Link to="/app?state=register" onClick={() => setMenuOpen(false)} className={`px-5 py-3 ${primaryBg} ${primaryBgHover} transition rounded-lg text-white font-semibold`}>
                        Create Resume
                    </Link>
                    <button onClick={() => setMenuOpen(false)} className="absolute top-6 right-6 p-2 text-white hover:text-emerald-400 active:scale-90 transition" >
                        <X size={28} />
                    </button>
                </div>
            </nav>

            {/* -------------------- 2. Floating Action Button (FAB) -------------------- */}
            <button
                onClick={bringNavbarBack}
                // FAB එක සියලුම තිර වලට (ඔබ ඉල්ලූ පරිදි)
                className={`fixed bottom-6 right-6 z-40 p-4 rounded-full ${buttonprimaryBg} ${buttonprimaryBgHover} text-white shadow-xl ${transitionStyles}
                    ${!isVisible && !isAtTop ? 'scale-100 opacity-100' : 'scale-0 opacity-0'} 
                `}
                aria-label="Show Navigation Bar"
            >
                <ArrowUp size={24} /> 
            </button>
        </>
    );
}

export default Navbar;


/*import React from 'react'
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

function Navbar() {

    const {user} = useSelector(state => state.auth)
    const [menuOpen, setMenuOpen] = React.useState(false);

    // Using the same Tailwind color for consistency and professional look
    const primaryColor = 'text-emerald-600';
    const primaryBg = 'bg-emerald-600';
    const primaryBgHover = 'hover:bg-emerald-700';


  return (
    
            <nav className="flex items-center justify-between w-full py-4 px-4 md:px-12 border-b border-gray-100 shadow-sm sticky top-0 bg-white z-50">
                {/* Logo /}
                <Link to="/" className="flex items-center gap-1">
                    {/* Placeholder for 'R' logo icon /}
                    <div className="size-8 rounded-md flex items-center justify-center font-bold text-white bg-emerald-600 text-xl">R</div>
                    <span className={`text-2xl font-bold ${primaryColor}`}>aptor<span className='text-slate-700'>CV</span>.</span>
                </Link>

                {/* Desktop Nav Links and CTAs (Visible on large screens) /}
                <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-700">
                    <a href="#" className={`hover:${primaryColor} transition`}>HOME</a>
                    <a href="#features" className={`hover:${primaryColor} transition`}>FEATURES</a>
                    <a href="#template-showcase" className={`hover:${primaryColor} transition`}>TEMPLATE SHOWCASE</a>
                    <a href="#contact-us" className={`hover:${primaryColor} transition`}>CONTACT US</a>
                    
                    {/* Sign In / Dashboard /}
                    {!user ? (
                        <Link to='/app?state=login' className={`text-slate-700 hover:${primaryColor} transition`}>
                            SIGN IN
                        </Link>
                    ) : (
                        <Link to='/app' className={`text-slate-700 hover:${primaryColor} transition`}>
                            DASHBOARD
                        </Link>
                    )}
                    
                    {/* Create Resume CTA /}
                    <Link to='/app?state=register' className={`px-5 py-3 ${primaryBg} ${primaryBgHover} transition rounded-lg text-white font-semibold shadow-md shadow-emerald-200 active:scale-[0.98]`}>
                        Create Resume
                    </Link>
                </div>

                {/* Mobile Menu Button (Hamburger Icon) /}
                <button onClick={() => setMenuOpen(true)} className="lg:hidden active:scale-90 transition p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu"><path d="M4 12h16"/><path d="M4 6h16"/><path d="M4 18h16"/></svg>
                </button>

                {/* Mobile Menu (Slides from the right) /}
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
                                    {/* Close Icon (X) /}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                                </button>
                            </div>
            </nav>

            
  )
}

export default Navbar*/
