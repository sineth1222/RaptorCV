import React from 'react';
import { Link } from 'react-router-dom';

// Defining the features based on the provided image's structure and color theme.
const featuresData = [
    {
        // Icon 1: Pencil/Edit (Orange/Peach) - Represents pre-written content/editing
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6 stroke-orange-600">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
        ),
        colorClass: 'bg-orange-100 border-orange-300',
        title: "Save time using pre-written bullets crafted by resume experts.",
    },
    {
        // Icon 2: Layout/Template (Violet/Purple) - Represents selecting a template
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6 stroke-violet-600">
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <line x1="3" x2="21" y1="9" y2="9" />
                <line x1="9" x2="9" y1="21" y2="9" />
            </svg>
        ),
        colorClass: 'bg-violet-100 border-violet-300',
        title: "Select a recruiter approved template that will get your resume noticed.",
    },
    {
        // Icon 3: Download/Print (Green/Emerald) - Represents downloading or printing
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6 stroke-emerald-600">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" x2="12" y1="15" y2="3" />
            </svg>
        ),
        colorClass: 'bg-emerald-100 border-emerald-300',
        title: "Download or print your new resume!",
    },
];

const Features = () => {
    // Zap Icon used for the '3 SIMPLE STEPS' header tag, similar to the original snippet
    const ZapIcon = ({ width = 14, className = 'stroke-green-600' }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={width} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
    );

    return (
        <div id='features' className='flex flex-col items-center py-10 bg-white min-h-screen font-poppins'>

            {/* Header Tag: '3 SIMPLE STEPS' 
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-400/10 rounded-full px-4 py-1.5 mb-6 font-medium tracking-widest">
                <ZapIcon width={14} />
                <span>3 SIMPLE STEPS</span>
            </div>*/}

            <h2 className={`text-sm font-semibold tracking-widest uppercase text-emerald-600 mb-2`}>
                    3 SIMPLE STEPS
                </h2>

            {/* Main Title: 'Getting Started' */}
            <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-12 text-center max-w-lg">
                Getting Started
            </h2>

            {/* Features List (Vertical Center Aligned, matching the image) */}
            <div className="flex flex-col items-center justify-center gap-6 max-w-sm w-full px-4">
                
                {featuresData.map((feature, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 w-full">
                        {/* Icon Container (matches the rounded square in the image) */}
                        {/* Note: I'm using border-2 to give the icons a slightly more defined look as in the source image */}
                        <div className={`p-3 rounded-xl border-2 ${feature.colorClass}`}>
                            {feature.icon}
                        </div>
                        {/* Feature Description */}
                        <p className="text-base text-slate-700 pt-2">{feature.title}</p>
                    </div>
                ))}
            </div>
            
            {/* CTA Button */}
            <Link to='/app?state=register' className="mt-12 sm:w-full w-auto px-20 max-w-sm py-4 bg-emerald-600 hover:bg-emerald-700 transition-colors rounded-xl text-white text-lg font-semibold shadow-2xl shadow-emerald-200 active:scale-[0.98] flex items-center justify-center">
                Let's Get Started
            </Link>

            {/* Legal Text 
            <p className="mt-6 text-xs text-slate-500 text-center max-w-md px-4">
                By clicking "Let's Get Started" you agree to our 
                <a href="#terms" className="text-purple-600 hover:text-purple-700 font-medium ml-1" onClick={(e) => e.preventDefault()}>Terms and Conditions</a> 
                and 
                <a href="#privacy" className="text-purple-600 hover:text-purple-700 font-medium ml-1" onClick={(e) => e.preventDefault()}>Privacy Policy</a>.
            </p>*/}

            {/* Poppins Font Import (used in the original snippet) */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
                .font-poppins {
                    font-family: 'Poppins', sans-serif;
                }
            `}</style>
        </div>
    );
}

export default Features;


/*import { Zap } from 'lucide-react';
import React from 'react'
import Title from './Title';

const Features = () => {
   const [isHover, setIsHover] = React.useState(false);

    return (
        <div id='features' className='flex flex-col items-center my-10 scroll-mt-12'>

            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-400/10 rounded-full px-6 py-1.5">
                <Zap width={14}/>
                <span>Simple Process</span>
            </div>

            <Title title="Build your resume effortlessly" description="Our streamlined process makes it easy to create a professional resume in minutes with intelligent AI-Powered tools and features." />

            <div className="flex flex-col md:flex-row items-center justify-center xl:-mt-10">
                <img className="max-w-2xl w-full xl:-ml-32" src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/features/group-image-1.png" alt="" />
                <div className="px-4 md:px-0" onMouseEnter={() => setIsHover(true)} onMouseLeave={() => setIsHover(false)}>
                    <div className={"flex items-center justify-center gap-6 max-w-md group cursor-pointer"}>
                        <div className={`p-6 group-hover:bg-violet-100 border border-transparent group-hover:border-violet-300  flex gap-4 rounded-xl transition-colors ${!isHover ? 'border-violet-300 bg-violet-100' : ''}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6 stroke-violet-600"><path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z" /><circle cx="16.5" cy="7.5" r=".5" fill="currentColor" /></svg>
                            <div className="space-y-2">
                                <h3 className="text-base font-semibold text-slate-700">Real-Time Analytics</h3>
                                <p className="text-sm text-slate-600 max-w-xs">Get instant insights into your finances with live dashboards.</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-6 max-w-md group cursor-pointer">
                        <div className="p-6 group-hover:bg-green-100 border border-transparent group-hover:border-green-300 flex gap-4 rounded-xl transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6 stroke-green-600"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z" /></svg>
                            <div className="space-y-2">
                                <h3 className="text-base font-semibold text-slate-700">Bank-Grade Security</h3>
                                <p className="text-sm text-slate-600 max-w-xs">End-to-end encryption, 2FA, compliance with GDPR standards.</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-6 max-w-md group cursor-pointer">
                        <div className="p-6 group-hover:bg-orange-100 border border-transparent group-hover:border-orange-300 flex gap-4 rounded-xl transition-colors">
                            <svg className="size-6 stroke-orange-600" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15V3" /><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5" /></svg>
                            <div className="space-y-2">
                                <h3 className="text-base font-semibold text-slate-700">Customizable Reports</h3>
                                <p className="text-sm text-slate-600 max-w-xs">Export professional, audit-ready financial reports for tax or internal review.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
            
                * {
                    font-family: 'Poppins', sans-serif;
                }
            `}</style>
        </div>
    );
}

export default Features*/
