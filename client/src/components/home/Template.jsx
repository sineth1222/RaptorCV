import React from 'react';
import { useNavigate } from 'react-router-dom';
import { assets } from '../../assets/assets';

// Mocking icons for a single-file React component setup
const ChevronLeftIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m15 18-6-6 6-6"/>
    </svg>
);

const ChevronRightIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m9 18 6-6-6-6"/>
    </svg>
);

// Template Data (using mock image URLs)
const TEMPLATES = [
    {
        id: "professional", // TemplateSelector එකේ ID එකට ගැලපෙන්න
        name: "Professional Resume",
        src: assets.proffetional,
        description: "A polished, one-page layout optimized for quick professional review.",
    },
    {
        id: "modern", // TemplateSelector එකේ ID එකට ගැලපෙන්න
        name: "Creative CV",
        src: assets.mordern,
        description: "Sleek design with strategic use of color and modern font choices.",
    },
    {
        id: "simple-modern", // TemplateSelector එකේ ID එකට ගැලපෙන්න
        name: "Academic Resume",
        src: assets.mordernsimple,
        description: "A sleek, clean format prioritizing readability and content flow.",
    },
    {
        id: "mordern-image", // TemplateSelector එකේ ID එකට ගැලපෙන්න
        name: "Mordern Image Resume",
        src: assets.minimalimage,
        description: "Modern structure incorporating a photo for a more personal touch.",
    },
    {
        id: "strong", // TemplateSelector එකේ ID එකට ගැලපෙන්න
        name: "Strong Resume",
        src: assets.strong,
        description: "Uses bold headings and lines to create a strong visual hierarchy.",
    },
    {
        id: "calm-sidebar", // TemplateSelector එකේ ID එකට ගැලපෙන්න
        name: "Calm Sidebar Resume",
        src: assets.calmsidebar,
        description: "Distinct two-column format with a dedicated, light sidebar for key info.",
    },  
    {
        id: "mordern-image-new", // TemplateSelector එකේ ID එකට ගැලපෙන්න
        name: "Calm Resume",
        src: assets.calm,
        description: "A clean, modern design with subtle, calming color accents.",
    },  
    {
        id: "natural", // TemplateSelector එකේ ID එකට ගැලපෙන්න
        name: "Natural Resume",
        src: assets.natural,
        description: "Soft tones and balanced spacing for a relaxed, easy-to-read feel.",
    }, 
    {
        id: "minimal-image", // TemplateSelector එකේ ID එකට ගැලපෙන්න
        name: "Minimal Image Resume",
        src: assets.minimalimage,
        description: "Minimal design with a single image and clean typography.",
    },
    // ... (අනෙකුත් templates ද මෙලෙසම ID සමඟ යාවත්කාලීන කරන්න) ...
];

const TemplateShowcase = () => {
    const navigate = useNavigate();
    const [currentTemplateIndex, setCurrentTemplateIndex] = React.useState(0);
    const primaryColor = 'text-emerald-600';
    const primaryColortemp = 'text-slate-700';
    const primaryBg = 'bg-slate-900';
    const primaryBgHover = 'hover:bg-slate-950';

    const nextTemplate = () => {
        setCurrentTemplateIndex((prevIndex) => (prevIndex + 1) % TEMPLATES.length);
    };

    const prevTemplate = () => {
        setCurrentTemplateIndex((prevIndex) => (prevIndex - 1 + TEMPLATES.length) % TEMPLATES.length);
    };

    const currentTemplate = TEMPLATES[currentTemplateIndex];
    
    // Function to handle template selection
    const handleTemplateSelection = () => {

        const templateId = currentTemplate.id; 
        
        // ඔබගේ ResumeBuilder එකේ URL structure එක: /app/edit/:resumeId
        // 'new' යනු ඔබ අලුතින් Resume එකක් හදන බව server එකට දන්වන ID එකක් ලෙස උපකල්පනය කරමි.
        navigate(`/app/builder/new?template=${templateId}`);
    };

    return (
        <div id='template-showcase' className='flex flex-col items-center py-20 bg-gray-50 font-poppins'>

            {/* Title Section */}
            <div className="text-center mb-12 px-4">
                <h2 className={`text-sm font-semibold tracking-widest uppercase ${primaryColor} mb-2`}>
                    AWESOME TEMPLATE
                </h2>
                <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4">
                    Choose Your Perfect Template
                </h2>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                    Browse dozens of professionally designed, recruiter-approved templates and find the one that fits your industry.
                </p>
            </div>

            {/* Template Carousel Container */}
            <div className="relative w-full max-w-3xl px-4 md:px-0">
                
                {/* Image Display Card - Added 'group' for hover effect */}
                <div className="group bg-white p-6 rounded-2xl shadow-2xl shadow-purple-200/50 flex flex-col items-center transition-all duration-300 transform scale-100">
                    <h3 className={`text-2xl font-bold mb-4 ${primaryColortemp} text-center`}>
                        {currentTemplate.name}
                    </h3>
                    
                    {/* Template Image Container - Relative for absolute positioning of overlay */}
                    <div className="relative max-w-xs md:max-w-md overflow-hidden rounded-lg border-4 border-slate-200 cursor-pointer sm:h-[650px] h-[500px] w-[440px]" >
                        
                        {/* Template Image */}
                        <img 
                            src={currentTemplate.src} 
                            alt={currentTemplate.name} 
                            className="w-full h-auto object-cover transition duration-500"
                            // Fallback image in case mock URL fails
                            onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/400x550/cccccc/333333?text=Error"}}
                            onClick={handleTemplateSelection} // Allow click to select template
                        />

                        {/* Overlay Button (Appears on Hover or Mobile Click/Tap) */}
                        <div 
                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none md:pointer-events-auto"
                            // Mobile fix: on mobile, you can show the button by default or handle touch events if needed. 
                            // For simplicity, we make it always clickable but visually show it on hover/focus.
                        >
                            <button
                                onClick={handleTemplateSelection}
                                className={`py-3 px-6 ${primaryBg} ${primaryBgHover} rounded-lg text-white font-semibold text-lg shadow-xl active:scale-[0.95] pointer-events-auto`}
                            >
                                Use This Template
                            </button>
                        </div>
                    </div>
                    
                    <p className="text-sm text-slate-500 mt-4 text-center max-w-sm">
                        {currentTemplate.description}
                    </p>
                </div>

                {/* Navigation Buttons - Mobile and Desktop (For swiping) */}
                <button 
                    onClick={prevTemplate} 
                    className={`absolute left-0 top-1/2 transform -translate-y-1/2 p-3 bg-white rounded-full shadow-lg border border-slate-200 ${primaryColortemp} transition-all duration-300 hover:scale-110 active:scale-95 z-10 md:-left-22`}
                    aria-label="Previous template"
                >
                    <ChevronLeftIcon className="size-6" />
                </button>
                <button 
                    onClick={nextTemplate} 
                    className={`absolute right-0 top-1/2 transform -translate-y-1/2 p-3 bg-white rounded-full shadow-lg border border-slate-200 ${primaryColortemp} transition-all duration-300 hover:scale-110 active:scale-95 z-10 md:-right-22`}
                    aria-label="Next template"
                >
                    <ChevronRightIcon className="size-6" />
                </button>
            </div>
            
            {/* Indicators (Dots) */}
            <div className="flex justify-center gap-2 mt-8">
                {TEMPLATES.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentTemplateIndex(index)}
                        className={`size-3 rounded-full transition-all duration-300 ${
                            index === currentTemplateIndex ? `${primaryBg} w-6` : 'bg-slate-300 hover:bg-slate-400'
                        }`}
                        aria-label={`Go to template ${index + 1}`}
                    />
                ))}
            </div>

            {/* CTA to start building (Kept as a fallback/secondary CTA) 
            <button 
                onClick={handleTemplateSelection}
                className={`mt-10 max-w-sm py-4 px-10 ${primaryBg} ${primaryBgHover} transition-colors rounded-xl text-white text-lg font-semibold shadow-xl shadow-purple-300/50 active:scale-[0.98]`}
            >
                Start Building with This Template
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

export default TemplateShowcase;