import React from 'react';
//import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { assets } from '../../assets/assets';

const Hero = () => {
    //const { user } = useSelector(state => state.auth);
    //const [menuOpen, setMenuOpen] = React.useState(false);
    
    // 🆕 State: වත්මන් active image එක පාලනය කිරීමට.
    const [isFlipped, setIsFlipped] = React.useState(false);

    // 🆕 Effect: තත්පර 4කට වරක් image එක මාරු කිරීමට (Flip කිරීමට).
    React.useEffect(() => {
        const interval = setInterval(() => {
            setIsFlipped(prev => !prev);
        }, 4000); 

        return () => clearInterval(interval);
    }, []);

    const primaryColor = 'text-emerald-600';
    const primaryBg = 'bg-emerald-600';
    const primaryBgHover = 'hover:bg-emerald-700';

    // 🆕 ඔබගේ රූප දෙක. (assets.creative නොමැති නම් proffetional ම භාවිතා වේ)
    const imageOne = assets.proffetional;
    const imageTwo = assets.minimalimage || assets.proffetional; 
    
    const fallbackImage = assets.mordern;


    return (
        <div className="min-h-screen mt-20 bg-white text-slate-900 font-inter">
            
            {/* Main Hero Content - Responsive Two-Column Layout */}
            {/* py-16 mobile padding එකට ඉඩ දෙන්න */}
            <div className="container mx-auto px-4 py-8  md:py-24">
                {/* flex-col: Mobile එකේදී සිරස් අතට පෙන්වයි. md:flex-row: Desktop එකේදී තිරස් අතට පෙන්වයි. */}
                <div className="flex flex-col md:flex-row items-center md:items-start gap-4 lg:gap-20">
                    
                    {/* Left Column: Headline and CTAs */}
                    {/* md:w-1/2: Desktop එකේදී 50% ක් ගනී. Mobile එකේදී w-full ගනී. */}
                    <div className="md:w-1/2 text-center md:text-left">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold max-w-xl leading-snug mb-8 text-slate-900">
                            Land Your Dream Job With <span className=" bg-linear-to-r from-green-700 to-green-600 bg-clip-text text-transparent text-nowrap">AI-Powered </span> Resumes.
                        </h1>

                        <div className="space-y-6 mb-10">
                            {/* Feature 1: Eye-catching templates */}
                            <div className="flex items-center justify-start max-w-xs sm:max-w-none mx-auto md:justify-start gap-3">
                                <span className="p-2 bg-emerald-100 rounded-full">
                                    {/* Eye Icon */}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`size-5 ${primaryColor}`}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                                </span>
                                <p className="text-lg sm:text-xl text-slate-700">Eye-catching resume templates.</p>
                            </div>

                            {/* Feature 2: AI Assistance */}
                            <div className="flex items-center justify-start max-w-xs sm:max-w-none mx-auto md:justify-start gap-3">
                                <span className="p-2 bg-emerald-100 rounded-full">
                                    {/* Sparkles Icon (AI - clearer definition) */}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`size-5 ${primaryColor}`}>
                                        <path d="M9.9 10.9v2.2L12 15l2.1-1.9v-2.2L12 9l-2.1 1.9Z"/>
                                        <path d="M12 2v2"/>
                                        <path d="M20 12h2"/>
                                        <path d="m19 5-1 1"/>
                                        <path d="m5 19 1-1"/>
                                        <path d="m5 5 1 1"/>
                                        <path d="m19 19-1-1"/>
                                    </svg>
                                </span>
                                <p className="text-lg sm:text-xl text-slate-700">AI assistance to effortlessly write and optimize your resume.</p>
                            </div>

                            {/* Feature 3: Step-by-step process */}
                            <div className="flex items-center justify-start max-w-xs sm:max-w-none mx-auto md:justify-start gap-3">
                                <span className="p-2 bg-emerald-100 rounded-full">
                                    {/* List Icon */}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`size-5 ${primaryColor}`}><path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/></svg>
                                </span>
                                <p className="text-lg sm:text-xl text-slate-700">Step-by-step process created by resume experts.</p>
                            </div>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
                            
                            {/* Build My Resume (Solid Green) */}
                            <Link to='/app' className={`w-full sm:w-auto px-10 py-4 ${primaryBg} ${primaryBgHover} transition rounded-xl text-white font-bold shadow-xl shadow-emerald-200 active:scale-[0.98]`}>
                                Build My Resume
                            </Link>

                            {/* Watch Video (Outlined Button) */}
                            <button className={`w-full sm:w-auto flex justify-center items-center gap-2 border-2 border-emerald-600 hover:bg-emerald-50 transition rounded-xl px-10 py-4 ${primaryColor} font-bold active:scale-[0.98]`}>
                                {/* Play Icon */}
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                                <span>Watch Video</span>
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Resume Preview (Takes 100% on mobile, 50% on desktop) */}

                    <div className="md:w-1/2 md:flex justify-center md:justify-end mt-2 md:mt-0 hidden">

                        {/* Placeholder for the resume image using the user-provided image URL */}

                        <div className="p-4 bg-white rounded-xl lg:max-w-lg w-full">

                            {/* 💡 Inner Flip Container - 3D effect එක සහ Flip animation එක මෙහි පාලනය වේ */}
                            <div className="relative w-full h-full" style={{ perspective: '1000px', margin: 'auto', 
                                width: '440px', 
                                height: '550px', }}>
                                <div className={`w-full h-full transition-transform duration-1000 ease-in-out`}
                                    style={{
                                        transformStyle: 'preserve-3d',
                                        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                                    }}>

                                    {/* 1. Front Side: Image One */}
                                    <div className={`absolute inset-0 backface-hidden`}
                                        style={{
                                            backfaceVisibility: 'hidden',
                                        }}>
                                        <img
                                            src={imageOne}
                                            alt="Professional resume preview"
                                            className="w-full h-auto rounded-lg object-contain shadow-xl shadow-emerald-900"
                                            style={{ maxHeight: 'inherit' }}
                                            onError={(e) => { e.target.onerror = null; e.target.src=fallbackImage}}
                                        />
                                    </div>

                                    {/* 2. Back Side: Image Two (Flipped to start) */}
                                    <div className={`absolute inset-0 backface-hidden`}
                                        style={{
                                            transform: 'rotateY(180deg)',
                                            backfaceVisibility: 'hidden',
                                        }}>
                                        <img
                                            src={imageTwo} 
                                            alt="Creative resume preview"
                                            className="w-full h-auto rounded-lg object-contain shadow-xl shadow-emerald-900"
                                            style={{ maxHeight: 'inherit' }}
                                            onError={(e) => { e.target.onerror = null; e.target.src=fallbackImage}}
                                        />
                                    </div>
                                </div>
                            </div>

                        </div>

                    </div>

                </div>

            </div>


            {/* ... Mobile Menu and Style block (වෙනස්කම් නැත) ... */}
            {/* ... */}

            <style>
                {/* Setting 'Inter' as the main font for clean, modern UI */}
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
                    .font-inter {
                        font-family: 'Inter', sans-serif;
                    }
                    /* backface-hidden class එක */
                    .backface-hidden {
                        backface-visibility: hidden;
                        -webkit-backface-visibility: hidden; /* For Safari */
                    }
                `}
            </style>
            
        </div>
    );
}

export default Hero;



/*import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { assets } from '../../assets/assets';

const Hero = () => {
    const { user } = useSelector(state => state.auth);
    const [menuOpen, setMenuOpen] = React.useState(false);
    
    // 🆕 State: වත්මන් active image එක පාලනය කිරීමට.
    const [isFlipped, setIsFlipped] = React.useState(false);

    // 🆕 Effect: තත්පර 4කට වරක් image එක මාරු කිරීමට (Flip කිරීමට).
    React.useEffect(() => {
        const interval = setInterval(() => {
            setIsFlipped(prev => !prev);
        }, 4000); 

        return () => clearInterval(interval);
    }, []);

    const primaryColor = 'text-emerald-600';
    const primaryBg = 'bg-emerald-600';
    const primaryBgHover = 'hover:bg-emerald-700';

    // 🆕 ඔබගේ රූප දෙක. (assets.creative නොමැති නම් proffetional ම භාවිතා වේ)
    const imageOne = assets.proffetional;
    const imageTwo = assets.minimalimage || assets.proffetional; 
    
    const fallbackImage = assets.mordern;


    return (
        <div className="min-h-screen bg-white text-slate-900 font-inter">
            
            {/* Main Hero Content - Responsive Two-Column Layout /}
            <div className="container mx-auto px-4 py-16 md:py-24">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-12 lg:gap-20">
                    
                    {/* Left Column: Headline and CTAs (වෙනස්කම් නැත) /}
                    <div className="md:w-1/2 text-center md:text-left">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold max-w-xl leading-snug mb-8 text-slate-900">
                            Land Your Dream Job With <span className=" bg-linear-to-r from-green-700 to-green-600 bg-clip-text text-transparent text-nowrap">AI-Powered </span> Resumes.
                        </h1>

                        <div className="space-y-6 mb-10">
                            {/* Feature 1: Eye-catching templates /}
                            <div className="flex items-center justify-start md:justify-start gap-3">
                                <span className="p-2 bg-emerald-100 rounded-full">
                                    {/* Eye Icon /}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`size-5 ${primaryColor}`}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                                </span>
                                <p className="text-lg sm:text-xl text-slate-700">Eye-catching resume templates.</p>
                            </div>

                            {/* Feature 2: AI Assistance /}
                            <div className="flex items-center justify-center md:justify-start gap-3">
                                <span className="p-2 bg-emerald-100 rounded-full">
                                    {/* Sparkles Icon (AI - clearer definition) /}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`size-5 ${primaryColor}`}>
                                        <path d="M9.9 10.9v2.2L12 15l2.1-1.9v-2.2L12 9l-2.1 1.9Z"/>
                                        <path d="M12 2v2"/>
                                        <path d="M20 12h2"/>
                                        <path d="m19 5-1 1"/>
                                        <path d="m5 19 1-1"/>
                                        <path d="m5 5 1 1"/>
                                        <path d="m19 19-1-1"/>
                                    </svg>
                                </span>
                                <p className="text-lg sm:text-xl text-slate-700">AI assistance to effortlessly write and optimize your resume.</p>
                            </div>

                            {/* Feature 3: Step-by-step process /}
                            <div className="flex items-center justify-center md:justify-start gap-3">
                                <span className="p-2 bg-emerald-100 rounded-full">
                                    {/* List Icon /}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`size-5 ${primaryColor}`}><path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/></svg>
                                </span>
                                <p className="text-lg sm:text-xl text-slate-700">Step-by-step process created by resume experts.</p>
                            </div>
                        </div>

                        {/* CTA Buttons /}
                        <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
                            
                            {/* Build My Resume (Solid Green) /}
                            <Link to='/app' className={`w-full sm:w-auto px-10 py-4 ${primaryBg} ${primaryBgHover} transition rounded-xl text-white font-bold shadow-xl shadow-emerald-200 active:scale-[0.98]`}>
                                Build My Resume
                            </Link>

                            {/* Watch Video (Outlined Button) /}
                            <button className={`w-full sm:w-auto flex justify-center items-center gap-2 border-2 border-emerald-600 hover:bg-emerald-50 transition rounded-xl px-10 py-4 ${primaryColor} font-bold active:scale-[0.98]`}>
                                {/* Play Icon /}
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                                <span>Watch Video</span>
                            </button>
                        </div>
                    </div>

                    {/* 🔄 Right Column: Resume Preview with Flipping Effect - Corrected for original size /}
                    <div className="md:w-1/2 flex justify-center md:justify-end mt-4 md:mt-0">
                        {/* 🌟 Outer Container: පෙර තිබූ විශාලත්වය පාලනය කරයි /}
                        <div className="p-4 bg-white shadow-2xl rounded-xl max-w-sm md:max-w-md lg:max-w-lg w-full" >
                            
                            {/* 💡 Inner Flip Container - 3D effect එක සහ Flip animation එක මෙහි පාලනය වේ /}
                            <div className="relative w-full h-full" style={{ perspective: '1000px', margin: 'auto' }}>
                                <div className={`w-full h-full transition-transform duration-1000 ease-in-out`}
                                    style={{
                                        transformStyle: 'preserve-3d',
                                        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                                    }}>

                                    {/* 1. Front Side: Image One /}
                                    <div className={`absolute inset-0 backface-hidden`}
                                        style={{
                                            backfaceVisibility: 'hidden',
                                        }}>
                                        <img
                                            src={imageOne}
                                            alt="Professional resume preview"
                                            className="w-full h-auto rounded-lg object-contain shadow-xl shadow-emerald-900"
                                            style={{ maxHeight: 'inherit' }} // Adjusted max height to fit padding
                                            onError={(e) => { e.target.onerror = null; e.target.src=fallbackImage}}
                                        />
                                    </div>

                                    {/* 2. Back Side: Image Two (Flipped to start) /}
                                    <div className={`absolute inset-0 backface-hidden`}
                                        style={{
                                            transform: 'rotateY(180deg)',
                                            backfaceVisibility: 'hidden',
                                        }}>
                                        <img
                                            src={imageTwo} 
                                            alt="Creative resume preview"
                                            className="w-full h-auto rounded-lg object-contain shadow-xl shadow-emerald-900"
                                            style={{ maxHeight: 'inherit' }} // Adjusted max height to fit padding
                                            onError={(e) => { e.target.onerror = null; e.target.src=fallbackImage}}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <style>
                {/* Setting 'Inter' as the main font for clean, modern UI /}
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
                    .font-inter {
                        font-family: 'Inter', sans-serif;
                    }
                    /* backface-hidden class එක /
                    .backface-hidden {
                        backface-visibility: hidden;
                        -webkit-backface-visibility: hidden; /* For Safari /
                    }
                `}
            </style>
        </div>
    );
}

export default Hero;*/


/*import React from 'react'
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const Hero = () => {

    const {user} = useSelector(state => state.auth)
   const [menuOpen, setMenuOpen] = React.useState(false);

    const logos = [
        'https://saasly.prebuiltui.com/assets/companies-logo/instagram.svg',
        'https://saasly.prebuiltui.com/assets/companies-logo/framer.svg',
        'https://saasly.prebuiltui.com/assets/companies-logo/microsoft.svg',
        'https://saasly.prebuiltui.com/assets/companies-logo/huawei.svg',
        'https://saasly.prebuiltui.com/assets/companies-logo/walmart.svg',
    ]

    return (
        <>
            <div className="min-h-screen pb-20">
                {/* Navbar /}
                <nav className="z-50 flex items-center justify-between w-full py-4 px-6 md:px-10 lg:px-18 xl:px-34 text-sm">
                    <a href="https://prebuiltui.com">
                        <img src="/logo.svg" alt="logo"  className='h-11 w-auto'/>
                    </a>

                    <div className="hidden md:flex items-center gap-8 transition duration-500 text-slate-800">
                        <a href="#" className="hover:text-green-600 transition">Home</a>
                        <a href="#features" className="hover:text-green-600 transition">Features</a>
                        <a href="#testimonials" className="hover:text-green-600 transition">Testimonials</a>
                        <a href="#cta" className="hover:text-green-600 transition">Contact</a>
                    </div>

                    <div className="flex gap-2">
                        <Link to='/app?state=register' className="hidden md:block px-6 py-2 bg-green-500 hover:bg-green-700 active:scale-95 transition-all rounded-full text-white" hidden={user}>
                            Get started
                        </Link>
                        <Link to='/app?state=login' className="hidden md:block px-6 py-2 border active:scale-95 hover:bg-slate-50 transition-all rounded-full text-slate-700 hover:text-slate-900" hidden={user}>
                            Login
                        </Link>
                        <Link to='/app' className='hidden md:block px-8 py-2 bg-green-500 hover:bg-green-700 active:scale-95 transition-all rounded-full text-white' hidden={!user}>
                            Dashboard
                        </Link>
                    </div>

                    <button onClick={() => setMenuOpen(true)} className="md:hidden active:scale-90 transition" >
                        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" className="lucide lucide-menu" >
                            <path d="M4 5h16M4 12h16M4 19h16" />
                        </svg>
                    </button>
                </nav>

                {/* Mobile Menu /}
                <div className={`fixed inset-0 z-100 bg-black/40 text-black backdrop-blur flex flex-col items-center justify-center text-lg gap-8 md:hidden transition-transform duration-300 ${menuOpen ? "translate-x-0" : "-translate-x-full"}`} >
                    <a href="#" className="text-white">Home</a>
                    <a href="#features" className="text-white">Features</a>
                    <a href="#testimonials" className="text-white">Testimonials</a>
                    <a href="#cta" className="text-white">Contact</a>
                    <button onClick={() => setMenuOpen(false)} className="active:ring-3 active:ring-white aspect-square size-10 p-1 items-center justify-center bg-green-600 hover:bg-green-700 transition text-white rounded-md flex" >
                        X
                    </button>
                </div>

                {/* Hero Section /}
                <div className="relative flex flex-col items-center justify-center text-sm px-4 md:px-16 lg:px-24 xl:px-40 text-black">
                    <div className="absolute top-28 xl:top-10 -z-10 left-1/4 size-72 sm:size-96 xl:size-120 2xl:size-132 bg-green-300 blur-[100px] opacity-30"></div>

                    {/* Avatars + Stars /}
                    <div className="flex items-center mt-24">
                        <div className="flex -space-x-3 pr-3">
                            <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200" alt="user3" className="size-8 object-cover rounded-full border-2 border-white hover:-translate-y-0.5 transition z-1" />
                            <img src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200" alt="user1" className="size-8 object-cover rounded-full border-2 border-white hover:-translate-y-0.5 transition z-2" />
                            <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200" alt="user2" className="size-8 object-cover rounded-full border-2 border-white hover:-translate-y-0.5 transition z-3" />
                            <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200" alt="user3" className="size-8 object-cover rounded-full border-2 border-white hover:-translate-y-0.5 transition z-4" />
                            <img src="https://randomuser.me/api/portraits/men/75.jpg" alt="user5" className="size-8 rounded-full border-2 border-white hover:-translate-y-0.5 transition z-5" />
                        </div>

                        <div>
                            <div className="flex ">
                                {Array(5).fill(0).map((_, i) => (
                                    <svg key={i} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star text-transparent fill-green-600" aria-hidden="true"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path></svg>
                                ))}
                            </div>
                            <p className="text-sm text-gray-700">
                                Used by 10,000+ users
                            </p>
                        </div>
                    </div>

                    {/* Headline + CTA /}
                    <h1 className="text-5xl md:text-6xl font-semibold max-w-5xl text-center mt-4 md:leading-[70px]">
                        Land Your Dream Job With <span className=" bg-linear-to-r from-green-700 to-green-600 bg-clip-text text-transparent text-nowrap">AI-Powered </span> Resumes.
                    </h1>

                    <p className="max-w-md text-center text-base my-7">Create, edit and download professional resumes with AI-Powered assistance.</p>

                    {/* CTA Buttons /}
                    <div className="flex items-center gap-4 ">
                        <Link to='/app' className="bg-green-500 hover:bg-green-600 text-white rounded-full px-9 h-12 m-1 ring-offset-2 ring-1 ring-green-400 flex items-center transition-colors">
                            Get started
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right ml-1 size-4" aria-hidden="true"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                        </Link>
                        <button className="flex items-center gap-2 border border-slate-400 hover:bg-green-50 transition rounded-full px-7 h-12 text-slate-700">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-video size-5" aria-hidden="true"><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"></path><rect x="2" y="6" width="14" height="12" rx="2"></rect></svg>
                            <span>Try demo</span>
                        </button>
                    </div>

                    <p className="py-6 text-slate-600 mt-14">Trusting by leading brands, including</p>

                    <div className="flex flex-wrap justify-between max-sm:justify-center gap-6 max-w-3xl w-full mx-auto py-4" id="logo-container">
                        {logos.map((logo, index) => <img key={index} src={logo} alt="logo" className="h-6 w-auto max-w-xs" />)}
                    </div>
                </div>
            </div>
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');

                    * {
                        font-family: 'Poppins', sans-serif;
                    }
                `}
            </style>
        </>
    );
}

export default Hero*/
