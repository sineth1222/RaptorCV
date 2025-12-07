import React from 'react';
import { assets } from '../../assets/assets';
import toast from 'react-hot-toast';

// Mocking icons for a single-file React component setup
const MailIcon = ({ className = 'size-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.83 1.83 0 0 1-2.06 0L2 7" />
    </svg>
);

const PhoneIcon = ({ className = 'size-6' }) => (
    // UPDATED: Replaced the previous complex icon with a standard, clearer phone handset icon.
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M22 16.92v3a2 2 0 0 1-2 2h-3.92a2 2 0 0 1-2-2v-3.92a2 2 0 0 0-2-2c-4 0-6-2-8-6a2 2 0 0 0-2-2H2a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h3.92a2 2 0 0 1 2 2v3.92a2 2 0 0 0 2 2c4 0 6 2 8 6a2 2 0 0 0 2 2v3.92a2 2 0 0 1 2 2Z"/>
    </svg>
);

const MapPinIcon = ({ className = 'size-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);

const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';

const ContactUs = () => {
    // State for form inputs
    const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        message: '',
    });

    const [status, setStatus] = React.useState('');

    const primaryColor = 'text-emerald-600';
    const primaryBg = 'bg-emerald-600';
    const primaryBgHover = 'hover:bg-emerald-700';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name || !formData.email || !formData.message) {
            //setStatus('Please fill in all fields.');
            //return;
            throw new Error('Please fill in all fields.');
        }

        //setStatus('Submitting...');

        try {
            const response = await fetch(`${API_BASE_URL}/api/contact`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData)
            });


            const data = await response.json();

            if (data.success) {
                setStatus('Thank you! Your message has been sent successfully.');
                setFormData({ name: '', email: '', message: '' });
                return data; // Clear form
            } else {
                console.error("Submission error:", data);
                //setStatus(`Failed to send message: ${data.message || 'Unknown error'}`);
                throw new error(data.message || 'Failed to send message.');
            }
        } catch (error) {
            console.error("Network error:", error);
            //setStatus('An error occurred while sending the message.');
            throw error
        }
        
        // Mock API call simulation
        /*setTimeout(() => {
            console.log("Form Submitted:", formData);
            setStatus('Thank you! Your message has been sent successfully.');
            setFormData({ name: '', email: '', message: '' }); // Clear form
        }, 1500);*/
    };

    const contactImageUrl = assets.contact;

    return (
        <div id='contact-us' className='flex flex-col items-center py-20 bg-white min-h-[600px] font-poppins px-4'>
            
            {/* Main Title Section */}
            <div className="text-center mb-16 max-w-2xl">
                <h2 className={`text-sm font-semibold tracking-widest uppercase ${primaryColor} mb-2`}>
                    GET IN TOUCH
                </h2>
                <p className="text-4xl sm:text-5xl font-extrabold text-slate-900">
                    We're Here to Help
                </p>
                <p className="mt-4 text-lg text-slate-600">
                    Have questions about your resume, templates, or anything else? Send us a message!
                </p>
            </div>

            {/* Contact Card: Two-column layout on desktop, stacked on mobile */}
            <div className="flex flex-col lg:flex-row w-full max-w-5xl bg-gray-50 rounded-2xl shadow-xl overflow-hidden">
                

                    {/* 👈 Left Side: Image Content - THIS IS THE MODIFIED SECTION */}
                <div className="lg:w-1/3 p-0 rounded-t-2xl lg:rounded-tr-none lg:rounded-l-2xl overflow-hidden hidden sm:block">
                    <img 
                        src={contactImageUrl} // රූපයේ URL/path එක මෙතැනට
                        alt="Contact us image"
                        className="w-full h-full object-cover" // Full width and height, covering the div
                    />
                </div>

                    {/*<h3 className="text-3xl font-bold mb-4">Contact Information</h3>
                    
                    <div className="flex items-start gap-4">
                        <MailIcon className="size-6 mt-1 shrink-0" />
                        <div>
                            <p className="font-semibold">Email Us</p>
                            <a href="mailto:pradha@resumebuilder.com" className="text-purple-100 hover:underline">raptorcv@gmail.com</a>
                        </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                        <PhoneIcon className="size-6 mt-1 shrink-0" />
                        <div>
                            <p className="font-semibold">Call Us</p>
                            <a href="tel:+1234567890" className="text-purple-100 hover:underline">+94 (705) 089-955</a>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <MapPinIcon className="size-6 mt-1 shrink-0" />
                        <div>
                            <p className="font-semibold">Location</p>
                            <p className="text-purple-100">Sri lanka</p>
                        </div>
                    </div>*/}


                {/* Right Side: Contact Form */}
                <div className="lg:w-2/3 p-8 md:p-12 bg-white rounded-b-2xl lg:rounded-bl-none lg:rounded-r-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        
                        {/* Name Input */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition"
                                placeholder="Your Name"
                                required
                            />
                        </div>

                        {/* Email Input */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition"
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        {/* Message Textarea */}
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                            <textarea
                                id="message"
                                name="message"
                                rows="4"
                                value={formData.message}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition resize-none"
                                placeholder="How can we help you?"
                                required
                            ></textarea>
                        </div>

                        {/* Status Message */}
                        {status && (
                            <p className={`text-sm font-medium ${status.includes('successfully') ? 'text-emerald-600' : 'text-red-600'}`}>
                                {status}
                            </p>
                        )}

                        {/* Submit Button */}
                        <button
                            onClick={(e) => {
                                e.preventDefault(); // Default submit නවත්වන්න

                                // handleSubmit() ශ්‍රිතය call කර toast.promise එකට දෙන්න
                                toast.promise(handleSubmit(e), { 
                                    loading: 'Sending Message...', // 👈 Loading පණිවිඩය
                                    success: (data) => data.message || 'Message sent successfully!', // API එකෙන් ලැබෙන message
                                    error: (error) => error.message || 'An unexpected error occurred.', // throw කරපු error එක
                                });
                            }}
                            type="submit"
                            className={`w-full py-3 px-6 text-lg font-semibold rounded-lg text-white transition-colors ${primaryBg} ${primaryBgHover} shadow-md shadow-purple-300/50 active:scale-[0.98]`}
                            //disabled={status === 'Submitting...'}
                        >
                            {status === 'Submitting...' ? 'Sending...' : 'Send Message'}
                        </button>

                    </form>
                </div>
            </div>

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

export default ContactUs;