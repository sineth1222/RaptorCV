import React from 'react';
import { assets } from '../../assets/assets';

// Mocking icons for a single-file React component setup
const ZapIcon = ({ className = 'size-8' }) => (
    // Icon for AI/Enhance (Lightning Bolt)
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        {/* ප්‍රධාන හරස් තාරකාව (Main Crossed Star) */}
        <path d="M10 4L12 9L17 11L12 13L10 18L8 13L3 11L8 9L10 4Z"/>
        {/* වටේ ඇති කුඩා තිත් (Small Dots around the star) - ඔබේ රූපයේ ඇති ආකාරයට */}
        <path d="M19 3L20 4"/>
        <path d="M4 20L5 21"/>
        <path d="M19 20L20 21"/>
    </svg>
);

const ClockIcon = ({ className = 'size-8' }) => (
    // Icon for Time Saving
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
);

const featuresData = [
    {
        title: "AI-Powered Summary Writing",
        description: "Generate a professional-level Professional Summary in seconds by entering your skills and experience. You can edit the result as needed.",
        icon: ZapIcon,
        bgColor: "bg-purple-100",
        iconColor: "text-purple-600",
        imageText: assets.ai1v, // Placeholder text for image
    },
    {
        title: "Enhance Job Descriptions",
        description: "Simply enter your job responsibilities and click the 'AI Enhance' button. Our AI transforms them into strong, action-oriented bullet points that employers look for.",
        icon: ZapIcon,
        bgColor: "bg-green-100",
        iconColor: "text-green-600",
        imageText: assets.ai3v // Placeholder text for image
    },
    {
        title: "Save Valuable Time",
        description: "Save hours by using our AI tools instead of starting from scratch. Quickly and easily tailor content to perfectly fit your experience.",
        icon: ClockIcon,
        bgColor: "bg-indigo-100",
        iconColor: "text-indigo-600",
        imageText: assets.ai2 // Placeholder text for image
    },
];

const AIFeatures = () => {
    const primaryColor = 'text-emerald-600';
    const primaryBg = 'bg-emerald-600';
    const primaryBgHover = 'hover:bg-emerald-700';

    return (
        <div id='features' className='flex flex-col items-center py-20 bg-gray-50 font-poppins px-4'>
            
            {/* Main Title Section */}
            <div className="text-center mb-16 max-w-3xl">
                <h2 className={`text-sm font-semibold tracking-widest uppercase ${primaryColor} mb-2`}>
                    POWERED BY AI
                </h2>
                <p className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight">
                    AI-Powered Features
                </p>
                <p className="mt-4 text-xl text-slate-600 font-medium">
                    Easily create your job application and make it instantly more appealing.
                </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
                {featuresData.map((feature, index) => (
                    <div key={index} className="flex flex-col bg-white rounded-2xl shadow-xl transition-transform duration-300 hover:scale-[1.02] overflow-hidden">
                        
                        {/* Feature Content */}
                        <div className="p-6 md:p-8 h-full">
                            <div className='flex flex-col items-center justify-center'>
                                <div className={`p-3 rounded-xl ${feature.bgColor} mb-4`}>
                                    <feature.icon className={`${feature.iconColor}`} />
                                </div>
                            </div>

                            <div className='flex flex-col items-start'>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">
                                {feature.title}
                                </h3>
                                <p className="text-slate-600 mb-4 grow">
                                    {feature.description}
                                </p>
                                
                                {/* "How Easy It Is" Indicator */}
                                <div className="flex items-center text-sm font-semibold text-purple-700 mt-2">
                                    {/* Using ZapIcon here to denote speed/instant result */}
                                    <ZapIcon className="size-4 mr-1 text-yellow-500 fill-yellow-500" />
                                    <span className="text-purple-700">Ready in seconds!</span>
                                </div>
                            </div>
                                                       
                        </div>

                        {/* Image Mockup based on user needs */}
                        <div className="w-full h-74 sm:h-74 border-gray-200">
                            <img 
                                src={feature.imageText}
                                alt={feature.title} 
                                className="w-full h-full object-cover"
                                // Fallback image in case mock URL fails
                                onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/600x400/cccccc/333333?text=Feature+Image"}}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* CTA 
            <button 
                className={`mt-16 max-w-sm py-4 px-10 ${primaryBg} ${primaryBgHover} transition-colors rounded-xl text-white text-lg font-semibold shadow-xl shadow-purple-300/50 active:scale-[0.98]`}
                onClick={() => console.log('Starting AI creation flow')}
            >
                Start with AI Tools
            </button>*/}


            {/* Poppins Font Import - ensuring consistency */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
                .font-poppins {
                    font-family: 'Poppins', sans-serif;
                }
            `}</style>
        </div>
    );
};

export default AIFeatures;