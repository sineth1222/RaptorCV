import React from 'react';
import { Mail, Phone, MapPin, Linkedin, Globe } from "lucide-react";

// --- Helper Components ---

// Skill Pill/Tag (Purple background as seen in the image)
const SkillPill = ({ skill, accentColor }) => (
    <div 
        className="text-xs font-semibold px-2 py-1 rounded-md inline-block mb-1 mr-2 print:break-all"
        style={{ 
            backgroundColor: accentColor, 
            color: 'white' // White text for maximum contrast on the accent color
        }}
    >
        {skill}
    </div>
);

// Main Content Section Header
const MainHeader = ({ title, accentColor }) => (
    <h3 
        className="uppercase text-lg font-bold pt-6 mb-3 tracking-wider text-gray-800"
        style={{ borderBottom: `2px solid ${accentColor}` }} // Underline with accent color
    >
        {title}
    </h3>
);

// --- Main Template Component ---

const ImageAccurateTemplate = ({ data, accentColor }) => {
    
    // Helper function to format dates
    const formatDate = (dateStr) => {
        if (!dateStr || dateStr.toLowerCase() === 'present') return 'Present';
        
        const [year, month] = dateStr.split("-");

        if (year && month) {
            // Using MMM YYYY format
            const date = new Date(year, parseInt(month, 10) - 1);
            return date.toLocaleString('en-us', { month: 'short', year: 'numeric' });
        }
        // If only year is provided, just return the year
        if (year) return year;
        return dateStr;
    };


    return (
        // Main container: Centered, standard width for professional look
        <div className="max-w-4xl mx-auto bg-white shadow-xl p-8 md:p-12 print:p-0 print:shadow-none font-sans text-gray-800">
            
            {/* Header Block: Name and Profession */}
            <header className="mb-4 pb-2 text-center">
                <h1 className="text-4xl font-extrabold uppercase tracking-widest mb-1" style={{ color: accentColor }}>
                    {data.personal_info?.full_name || "SINETH MASHENKA"}
                </h1>
                <h2 className="text-xl font-semibold mb-3 text-gray-700">
                    {data.personal_info?.profession || "UNDERGRADUATE"}
                </h2>
                
                {/* Contact Info (Inline/Top Bar Style as seen in the image) */}
                <div className="flex flex-wrap justify-center items-center text-sm text-gray-600 space-x-3 mt-4 print:space-x-1">
                    {/* The image uses icons next to the text, we'll keep it simple/clean */}
                    {data.personal_info?.email && (
                        <div className="flex items-center gap-1">
                            <Mail size={14} className="text-gray-500 hidden sm:inline" />
                            <span className="break-all">{data.personal_info.email}</span>
                            <span className="mx-1 font-bold text-gray-400">|</span>
                        </div>
                    )}
                    {data.personal_info?.phone && (
                        <div className="flex items-center gap-1">
                            <Phone size={14} className="text-gray-500 hidden sm:inline" />
                            <span className="break-all">{data.personal_info.phone}</span>
                            <span className="mx-1 font-bold text-gray-400">|</span>
                        </div>
                    )}
                    {data.personal_info?.location && (
                        <div className="flex items-center gap-1">
                            <MapPin size={14} className="text-gray-500 hidden sm:inline" />
                            <span className="break-all">{data.personal_info.location}</span>
                            <span className="mx-1 font-bold text-gray-400">|</span>
                        </div>
                    )}
                    {data.personal_info?.linkedin && (
                        <a 
                            href={data.personal_info.linkedin} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:underline text-gray-600"
                        >
                            <Linkedin size={14} className="text-gray-500 hidden sm:inline" />
                            {data.personal_info.linkedin.replace(/(^\w+:|^)\/\//, '').replace(/\/$/, '') || 'LinkedIn'}
                            <span className="mx-1 font-bold text-gray-400">|</span>
                        </a>
                    )}
                    {data.personal_info?.website && (
                        <a 
                            href={data.personal_info.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:underline text-gray-600"
                        >
                            <Globe size={14} className="text-gray-500 hidden sm:inline" />
                            {data.personal_info.website.replace(/(^\w+:|^)\/\//, '').replace(/\/$/, '') || 'Protfolio'}
                        </a>
                    )}
                </div>
            </header>
            
            {/* Horizontal Line under Contact Section */}
            <hr className="mt-2" style={{ borderColor: accentColor }}/>
            
            {/* PROFESSIONAL SUMMARY */}
            {data.professional_summary && (
                <section className="mb-4">
                    <MainHeader title="Professional Summary" accentColor={accentColor} />
                    <p className="text-sm leading-relaxed text-gray-700">
                        {data.professional_summary}
                    </p>
                </section>
            )}

            {/* PROFESSIONAL EXPERIENCE */}
            {data.experience && data.experience.length > 0 && (
                <section className="mb-4">
                    <MainHeader title="Professional Experience" accentColor={accentColor} />
                    <div className="space-y-6">
                        {data.experience.map((exp, index) => (
                            <div key={index} className="pb-1">
                                {/* Title and Date on the right */}
                                <div className="flex flex-col sm:flex-row print:flex-row justify-between items-start sm:items-baseline print:items-baseline text-sm mb-1">
                                    <h4 className="font-bold text-gray-900">{exp.position}</h4>
                                    <span className="font-medium text-gray-600 sm:mt-0 print:mt-0 mt-1 shrink-0 ml-4">
                                        {formatDate(exp.start_date)} - {exp.is_current ? "Present" : formatDate(exp.end_date)}
                                    </span>
                                </div>
                                {/* Company/Location line */}
                                <p className="text-sm italic text-gray-700 mb-2">{exp.company}</p>

                                {/* Description (Bulleted) */}
                                {exp.description && (
                                    <ul className="list-disc text-sm text-gray-700 ml-5 space-y-1">
                                        {exp.description.split("\n").map((line, i) => (
                                            <li key={i}>{line}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* PROJECTS */}
            {data.project && data.project.length > 0 && (
                <section className="mb-4">
                    <MainHeader title="Projects" accentColor={accentColor} />
                    <div className="space-y-5">
                        {data.project.map((p, index) => (
                            <div key={index} className="pb-1">
                                {/* Project Name and Type on the right */}
                                <div className="flex flex-col sm:flex-row print:flex-row justify-between items-start sm:items-baseline print:items-baseline text-sm mb-1">
                                    <h4 className="font-bold text-gray-900">{p.name}</h4>
                                    <span className="font-medium text-gray-600 sm:mt-0 print:mt-0 mt-1 shrink-0 ml-4">
                                        ({p.type})
                                    </span>
                                </div>
                                {/* Description (Bulleted) */}
                                {p.description && (
                                    <ul className="list-disc text-sm text-gray-700 ml-5 space-y-1">
                                        {p.description.split("\n").map((line, i) => (
                                            <li key={i}>{line}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}
            
            {/* EDUCATION */}
            {data.education && data.education.length > 0 && (
                <section className="mb-4">
                    <MainHeader title="Education" accentColor={accentColor} />
                    <div className="space-y-4">
                        {data.education.map((edu, index) => (
                            <div key={index} className="pb-1">
                                {/* Degree/Field and Date on the right */}
                                <div className="flex flex-col sm:flex-row print:flex-row justify-between items-start sm:items-baseline print:items-baseline text-sm font-bold text-gray-900 mb-1">
                                    <h4 className="font-bold text-gray-900">{edu.degree} {edu.field && `in ${edu.field}`}</h4>
                                    <span className="font-medium text-gray-600 sm:mt-0 print:mt-0 mt-1 shrink-0 ml-4">
                                        {formatDate(edu.start_date)} - {formatDate(edu.graduation_date)}
                                    </span>
                                </div>
                                {/* Institution line */}
                                <p className="text-sm italic text-gray-700">
                                    {edu.institution}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            )}
            
            {/* SKILLS, LANGUAGES, AND REFERENCES (2-Column Layout) */}
            <div className="flex flex-col md:flex-row print:flex-row gap-8">
                
                {/* LEFT COLUMN - SKILLS (Wider) */}
                <section className="w-full md:w-2/3">
                    {data.skills && data.skills.length > 0 && (
                        <>
                            <MainHeader title="Core Skills" accentColor={accentColor} />
                            <div className="flex flex-wrap pt-1">
                                {/* Render skills as colored tags/pills */}
                                {data.skills.map((skill, index) => (
                                    <SkillPill key={index} skill={skill} accentColor={accentColor} />
                                ))}
                            </div>
                        </>
                    )}
                    
                    {/* References - Place on the left column in the main image structure */}
                    {data.references && data.references.length > 0 && (
                        <>
                            <MainHeader title="References" accentColor={accentColor} />
                            <div className="grid grid-cols-1 gap-x-8 gap-y-4 text-sm text-gray-700 pt-1">
                                {data.references.map((ref, index) => (
                                    <div key={index} className="space-y-1">
                                        <p className="font-bold text-gray-900">{ref.name}</p>
                                        <p>{ref.title} of {ref.company}</p>
                                        <p className="italic text-gray-600">{ref.contact}</p>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </section>
                
                {/* RIGHT COLUMN - LANGUAGES (Narrower) */}
                {data.languages && data.languages.length > 0 && (
                    <section className="w-full md:w-1/3">
                        <MainHeader title="Languages" accentColor={accentColor} />
                        <div className="space-y-1 text-sm text-gray-700 pt-1">
                            {data.languages.map((lang, index) => (
                                <p key={index}>
                                    <span className="font-semibold">{lang.language}</span> - {lang.level}
                                </p>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}

export default ImageAccurateTemplate;