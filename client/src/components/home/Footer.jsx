import React from 'react';

// Mocking icons for a single-file React component setup (using simple SVGs)
const FacebookIcon = ({ className = 'size-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M14 11h3V8h-3V5c0-1.1.9-2 2-2h1V1h-2c-2.8 0-5 2.2-5 5v3H7v3h2v10h4V11z"/>
    </svg>
);
const TwitterIcon = ({ className = 'size-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M22.46 6c-.77.34-1.6.56-2.47.65.88-.53 1.56-1.37 1.88-2.37-.83.49-1.74.85-2.69 1.04-1.72-1.83-4.57-1.83-6.29 0-1.72 1.83-1.72 4.75 0 6.58-4.4-2.22-8.32-5.91-10.94-9.98-.45.77-.7 1.66-.7 2.58 0 1.77.9 3.32 2.27 4.22-.79-.02-1.54-.24-2.19-.6v.05c0 2.45 1.74 4.48 4.05 4.93-.42.11-.86.17-1.31.17-.32 0-.64-.03-.95-.09.64 2.01 2.5 3.47 4.67 3.51-1.75 1.37-3.95 2.2-6.35 2.2-.41 0-.82-.02-1.22-.07C2.05 21.28 4.3 22 6.7 22c8.03 0 12.39-6.65 12.39-12.39v-.56c.86-.62 1.6-1.38 2.19-2.24z"/>
    </svg>
);
const LinkedInIcon = ({ className = 'size-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19H5v-9h3v9zm-1.5-10.5c-.97 0-1.75-.78-1.75-1.75s.78-1.75 1.75-1.75 1.75.78 1.75 1.75-.78 1.75-1.75 1.75zm13.5 10.5h-3v-5.46c0-1.21-.43-2.03-1.51-2.03-1.23 0-1.95.82-1.95 2.03v5.46h-3v-9h2.89v1.39c.47-.7 1.32-1.39 3.31-1.39 2.13 0 3.76 1.41 3.76 4.41v5.59z"/>
    </svg>
);


const Footer = () => {
    // Adopting the Emerald color scheme from AIFeatures.jsx
    const primaryColor = 'text-emerald-600';
    const primaryColorText = 'text-emerald-400';
    const primaryColorHover = 'hover:text-emerald-300';
    const primaryBg = 'bg-slate-900'; // Using a dark background for contrast
    const accentColor = 'text-slate-400';

    const quickLinks = [
        { name: "AI Features", href: "#ai-features" },
        { name: "Pricing", href: "#pricing" },
        { name: "Templates", href: "#templates" },
        { name: "FAQ", href: "#faq" },
    ];

    const companyLinks = [
        { name: "About Us", href: "#about" },
        { name: "Contact Us", href: "#contact-us" },
        { name: "Privacy Policy", href: "#privacy" },
        { name: "Terms of Service", href: "#terms" },
    ];

    const socialLinks = [
        { icon: FacebookIcon, href: "https://facebook.com" },
        { icon: TwitterIcon, href: "https://twitter.com" },
        { icon: LinkedInIcon, href: "https://linkedin.com" },
    ];

    return (
        <footer className={`w-full ${primaryBg} font-poppins text-white border-t border-emerald-700/50`}>
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                
                {/* Main Grid Section */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                    
                    {/* Column 1: Logo and Socials */}
                    <div className="col-span-2 lg:col-span-2 space-y-4">
                        <div className="flex items-center gap-1">
                            {/* Placeholder Logo/Brand Name */}
                            <div className="size-8 rounded-md flex items-center justify-center font-bold text-white bg-emerald-600 text-xl">R</div>
                            <span className={`text-2xl font-bold ${primaryColor}`}>aptor<span className='text-slate-700'>CV</span>.</span>
                        </div>
                        <p className={accentColor}>
                            Building the future of professional job applications.
                        </p>
                        
                        {/* Social Icons */}
                        <div className="flex space-x-4 pt-2">
                            {socialLinks.map((link, index) => (
                                <a key={index} href={link.href} target="_blank" rel="noopener noreferrer" 
                                   className={`${primaryColorText} ${primaryColorHover} transition-colors`}>
                                    <link.icon />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div className="space-y-4">
                        <h4 className={`text-lg font-semibold ${primaryColorText}`}>Quick Links</h4>
                        <ul className="space-y-3">
                            {quickLinks.map((link, index) => (
                                <li key={index}>
                                    <a href={link.href} className={`text-sm ${accentColor} ${primaryColorHover} transition-colors block`}>
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 3: Company */}
                    <div className="space-y-4">
                        <h4 className={`text-lg font-semibold ${primaryColorText}`}>Company</h4>
                        <ul className="space-y-3">
                            {companyLinks.map((link, index) => (
                                <li key={index}>
                                    <a href={link.href} className={`text-sm ${accentColor} ${primaryColorHover} transition-colors block`}>
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Divider */}
                <div className="mt-12 border-t border-emerald-700/30 pt-8 flex flex-col md:flex-row justify-between items-center">
                    
                    {/* Copyright */}
                    <p className={`text-sm ${accentColor}`}>
                        &copy; {new Date().getFullYear()} PraDha. All rights reserved.
                    </p>

                    {/* Footer Contact Info (Optional) */}
                    <div className={`flex space-x-6 mt-4 md:mt-0 ${accentColor}`}>
                        <span className="text-sm">Email: raptorcv.team@gmail.com</span>
                        <span className="text-sm hidden sm:inline">Phone: +94 (705) 089-955</span>
                    </div>
                </div>
            </div>

            {/* Poppins Font Import - ensuring consistency */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
                .font-poppins {
                    font-family: 'Poppins', sans-serif;
                }
            `}</style>
        </footer>
    );
};

export default Footer;


/*import React from 'react'

const Footer = () => {
  return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
            
                * {
                    font-family: 'Poppins', sans-serif;
                }
            `}</style>
            
            <footer className="flex flex-wrap justify-center lg:justify-between overflow-hidden gap-10 md:gap-20 py-16 px-6 md:px-16 lg:px-24 xl:px-32 text-[13px] text-gray-500 bg-linear-to-r from-white via-green-200/60 to-white mt-40">
                <div className="flex flex-wrap items-start gap-10 md:gap-[60px] xl:gap-[140px]">
                    <a href="#">
                        <img src="/logo.svg" alt="logo" className='h-10 w-auto'/>
                    </a>
                    <div>
                        <p className="text-slate-800 font-semibold">Product</p>
                        <ul className="mt-2 space-y-2">
                            <li><a href="/" className="hover:text-green-600 transition">Home</a></li>
                            <li><a href="/" className="hover:text-green-600 transition">Support</a></li>
                            <li><a href="/" className="hover:text-green-600 transition">Pricing</a></li>
                            <li><a href="/" className="hover:text-green-600 transition">Affiliate</a></li>
                        </ul>
                    </div>
                    <div>
                        <p className="text-slate-800 font-semibold">Resources</p>
                        <ul className="mt-2 space-y-2">
                            <li><a href="/" className="hover:text-green-600 transition">Company</a></li>
                            <li><a href="/" className="hover:text-green-600 transition">Blogs</a></li>
                            <li><a href="/" className="hover:text-green-600 transition">Community</a></li>
                            <li><a href="/" className="hover:text-green-600 transition">Careers<span className="text-xs text-white bg-green-600 rounded-md ml-2 px-2 py-1">We’re hiring!</span></a></li>
                            <li><a href="/" className="hover:text-green-600 transition">About</a></li>
                        </ul>
                    </div>
                    <div>
                        <p className="text-slate-800 font-semibold">Legal</p>
                        <ul className="mt-2 space-y-2">
                            <li><a href="/" className="hover:text-green-600 transition">Privacy</a></li>
                            <li><a href="/" className="hover:text-green-600 transition">Terms</a></li>
                        </ul>
                    </div>
                </div>
                <div className="flex flex-col max-md:items-center max-md:text-center gap-2 items-end">
                    <p className="max-w-60">Making every customer feel valued—no matter the size of your audience.</p>
                    <div className="flex items-center gap-4 mt-3">
                        <a href="https://dribbble.com/prebuiltui" target="_blank" rel="noreferrer">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-dribbble size-5 hover:text-green-500" aria-hidden="true">
                                <circle cx="12" cy="12" r="10"></circle>
                                <path d="M19.13 5.09C15.22 9.14 10 10.44 2.25 10.94"></path>
                                <path d="M21.75 12.84c-6.62-1.41-12.14 1-16.38 6.32"></path>
                                <path d="M8.56 2.75c4.37 6 6 9.42 8 17.72"></path>
                            </svg>
                        </a>
                        <a href="https://www.linkedin.com/company/prebuiltui" target="_blank" rel="noreferrer">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-linkedin size-5 hover:text-green-500" aria-hidden="true">
                                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                                <rect width="4" height="12" x="2" y="9"></rect>
                                <circle cx="4" cy="4" r="2"></circle>
                            </svg>
                        </a>
                        <a href="https://x.com/prebuiltui" target="_blank" rel="noreferrer">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter size-5 hover:text-green-500" aria-hidden="true">
                                <path
                                    d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z">
                                </path>
                            </svg>
                        </a>
                        <a href="https://www.youtube.com/@prebuiltui" target="_blank" rel="noreferrer">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-youtube size-6 hover:text-green-500" aria-hidden="true">
                                <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17">
                                </path>
                                <path d="m10 15 5-3-5-3z"></path>
                            </svg>
                        </a>
                    </div>
                    <p className="mt-3 text-center">© 2025 <a href="https://prebuiltui.com">PrebuiltUI</a></p>
                </div>
            </footer>
        </>
    );
}

export default Footer*/
