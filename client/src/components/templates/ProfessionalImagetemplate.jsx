import React from 'react';
import { Mail, Phone, MapPin, Linkedin, Globe } from "lucide-react";

// --- Helper Components ---

// Language Proficiency Bar 
const LanguageBar = ({ level, accentColor }) => {
    // Assuming level is a number from 0 to 5 or a percentage that maps to 5 segments
    const widthPercent = (level / 5) * 100;

    return (
        <div className="w-full bg-gray-200 h-2 rounded-full mt-1">
            <div 
                className="h-full rounded-full" 
                style={{ 
                    width: `${widthPercent}%`, 
                    backgroundColor: accentColor 
                }}
            ></div>
        </div>
    );
};

// Skill Pill/Tag 
const SkillPill = ({ skill, accentColor }) => (
    <div 
        className="text-xs font-semibold px-2 py-1 rounded-full text-white inline-block mb-1 mr-1 print:text-white! print:break-all" 
        style={{ backgroundColor: accentColor }}
    >
        {skill}
    </div>
);

// Sidebar Section Header
const SidebarHeader = ({ title }) => (
    <h3 
        className="uppercase text-sm font-bold pt-4 pb-1 mb-2 tracking-wider text-gray-800"
        style={{ borderBottom: '2px solid #ccc' }} // Using a light gray border
    >
        {title}
    </h3>
);

// Main Content Section Header
const MainHeader = ({ title, accentColor }) => (
    <h3 
        className="uppercase text-lg font-bold pt-4 mb-2 tracking-widest border-b border-gray-300 pb-1"
        style={{ color: accentColor }}
    >
        {title}
    </h3>
);


// --- Main Template Component ---

const ModernSidebarTemplate = ({ data, accentColor }) => {
    
    // Helper function to format dates
    const formatDate = (dateStr) => {
        if (!dateStr || dateStr.toLowerCase() === 'current') return 'Present';
        
        // Assuming dateStr is in "YYYY-MM" format
        const [year, month] = dateStr.split("-");
        
        let date;
        if (year && month) {
            date = new Date(year, month - 1);
        } else {
            date = new Date(dateStr);
        }

        if (isNaN(date)) return dateStr; 

        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short"
        });
    };


    return (
        // Main container: 
        // 1. max-w-full on print for better full-page print
        // 2. flex-col on mobile (default), md:flex-row (desktop/tablet), print:flex-row (print)
        <div className="max-w-6xl mx-auto bg-white shadow-xl flex flex-col md:flex-row print:flex-row font-sans print:max-w-full">
            
            {/* Right Main Content (Wide Column - Dark Header) is first in JSX on mobile using order-first/order-none logic */}
            {/* The logic for mobile responsiveness is achieved by making <aside> order-last */}
            
            {/* Left Sidebar (Narrow Column - Light Background) */}
            <aside 
                className="w-full md:w-[250px] print:w-1/3 print:min-w-0 p-6 text-gray-800 shrink-0 **order-last md:order-none**" // *** Responsive Fix: Forces sidebar to the bottom on mobile (default order-last) and resets on desktop (md:order-none) ***
                style={{ backgroundColor: '#f9f9f9' }} // Very light background
            >
                
                {/* Image */}
                {data.personal_info?.image && (
                    <div className="mb-4">
                        <img 
                            src={data.personal_info.image} 
                            alt="Profile" 
                            className="w-32 h-32 object-cover rounded-full border-4 border-white shadow-md" 
                        />
                    </div>
                )}

                {/* Contact */}
                <section className="mb-6">
                    <SidebarHeader title="Contact" />
                    <div className="space-y-3 text-sm font-medium">
                        {data.personal_info?.email && (
                            <div className="flex items-center gap-2">
                                <Mail size={16}  />
                                <span className="break-all">{data.personal_info.email}</span>
                            </div>
                        )}
                        {data.personal_info?.phone && (
                            <div className="flex items-center gap-2">
                                <Phone size={16}  />
                                <span>{data.personal_info.phone}</span>
                            </div>
                        )}
                        {data.personal_info?.location && (
                            <div className="flex items-start gap-2">
                                <MapPin size={16}  />
                                <span>{data.personal_info.location}</span>
                            </div>
                        )}
                        {data.personal_info?.linkedin && (
                            <div className="flex items-center gap-2">
                                <Linkedin size={16} />
                                <a 
                                    href={data.personal_info.linkedin} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="hover:underline text-gray-700 break-all"
                                >
                                   LinkedIn
                                </a>
                            </div>
                        )}
                        {data.personal_info?.website && (
                            <div className="flex items-center gap-2">
                                <Globe size={16} />
                                <a 
                                    href={data.personal_info.website} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="hover:underline text-gray-700 break-all"
                                >
                                    Portfolio
                                </a>
                            </div>
                        )}
                    </div>
                </section>
                
                {/* Skills - Rendered as Pills/Tags */}
                {data.skills && data.skills.length > 0 && (
                    <section className="mb-6">
                        <SidebarHeader title="Skills" />
                        <div className="flex flex-wrap gap-1 mt-2">
                            {data.skills.map((skill, index) => (
                                <SkillPill key={index} skill={skill} accentColor={accentColor} />
                            ))}
                        </div>
                    </section>
                )}
                
                {/* Certificates */}
                {data.certificates && data.certificates.length > 0 && (
                    <section className="mb-6">
                        <SidebarHeader title="Certificates" />
                        <div className="space-y-2 text-sm text-gray-700">
                            {data.certificates.map((cert, index) => (
                                <div key={index}>
                                    <p className="font-semibold">{cert.name}</p>
                                    <p className="text-xs italic">{cert.institution} - {cert.year}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Languages */}
                {data.languages && data.languages.length > 0 && (
                    <section className="mb-6">
                        <SidebarHeader title="Languages" />
                        <div className="space-y-3 text-sm text-gray-700">
                            {data.languages.map((lang, index) => (
                                <div key={index}>
                                    <p className="text-sm text-gray-700 mb-1">
                                        <span className="font-semibold">{lang.language}</span> - {lang.level}
                                    </p>
                                    {/* Optional: Add Language Bar if level is numeric */}
                                    {!isNaN(parseInt(lang.level)) && <LanguageBar level={parseInt(lang.level)} accentColor={accentColor} />}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* References */}
                {data.references && data.references.length > 0 && (
                    <section className="mb-6">
                        <SidebarHeader title="References" />
                        <div className="space-y-3 text-xs text-gray-700">
                            {data.references.map((ref, index) => (
                                <div key={index}>
                                    <p className="font-bold">{ref.name} ({ref.title})</p>
                                    <p>{ref.company}</p>
                                    <p>Contact: {ref.contact}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

            </aside>

            {/* Right Main Content (Wide Column - Dark Header) */}
            {/* This will appear above the <aside> on mobile because <aside> is now order-last */}
            <main className="grow w-full md:w-auto print:w-2/3">
                
                {/* Dark Blue Full-Width Header Block */}
                <header 
                    className="p-8 text-white print:text-black" // Print color changed to black for contrast
                    style={{ backgroundColor: accentColor }}
                >
                    <h1 className="text-4xl font-extrabold uppercase tracking-wide mb-1">
                        {data.personal_info?.full_name || "EMMA SMITH"}
                    </h1>
                    <h2 className="text-xl font-semibold mb-3">
                        {data.personal_info?.profession || ""}
                    </h2>
                    {data.professional_summary && (
                        <p className="text-sm leading-relaxed">
                            {data.professional_summary}
                        </p>
                    )}
                </header>

                <div className="p-8 pt-4">
                    
                    {/* Work Experience */}
                    {data.experience && data.experience.length > 0 && (
                        <section className="mb-6">
                            <MainHeader title="Work Experience" accentColor={accentColor} />
                            <div className="space-y-5">
                                {data.experience.map((exp, index) => (
                                    <div key={index} className="pb-1">
                                        <div className="flex flex-col sm:flex-row print:flex-row justify-between items-start sm:items-baseline print:items-baseline text-sm mb-1">
                                            <h4 className="font-bold text-gray-900">{exp.position}</h4>
                                            <span className="font-medium text-gray-600 sm:mt-0 print:mt-0 mt-1">
                                                {formatDate(exp.start_date)} - {exp.is_current ? "Present" : formatDate(exp.end_date)}
                                            </span>
                                        </div>
                                        <p className="text-sm italic text-gray-700 mb-2">{exp.company}</p>
                                        {exp.description && (
                                            <ul className="list-disc list-inside text-sm text-gray-700 ml-4 space-y-1">
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

                    {/* Achievements (The image has a separate section for this) */}
                    {data.achievements && data.achievements.length > 0 && (
                        <section className="mb-6">
                            <MainHeader title="Achievements" accentColor={accentColor} />
                            <div className="space-y-2 text-sm text-gray-700">
                                {data.achievements.map((ach, index) => (
                                    <div key={index} className="flex flex-col sm:flex-row print:flex-row justify-between items-start sm:items-baseline print:items-baseline">
                                        <p className="font-medium">{ach.title} - {ach.company}</p>
                                        <span className="text-gray-600 sm:mt-0 print:mt-0 mt-1">{ach.year}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Education */}
                    {data.education && data.education.length > 0 && (
                        <section className="mb-6">
                            <MainHeader title="Education" accentColor={accentColor} />
                            <div className="space-y-4">
                                {data.education.map((edu, index) => (
                                    <div key={index} className="pb-1">
                                        <div className="flex flex-col sm:flex-row print:flex-row justify-between items-start sm:items-baseline print:items-baseline text-sm font-bold text-gray-900 mb-1">
                                            <h4>{edu.degree} {edu.field && `in ${edu.field}`}</h4>
                                            <span className="font-medium text-gray-600 sm:mt-0 print:mt-0 mt-1">
                                                {formatDate(edu.graduation_date, true)}
                                            </span>
                                        </div>
                                        <p className="text-sm italic text-gray-700">
                                            {edu.institution}
                                        </p>
                                        {edu.gpa && <p className="text-sm text-gray-600">Grade: {edu.gpa}</p>}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* project Experience */}
                    {data.project && data.project.length > 0 && (
                        <section className="mb-6">
                            <MainHeader title="Project Experience" accentColor={accentColor} />
                            <div className="space-y-5">
                                {data.project.map((p, index) => (
                                    <div key={index} className="pb-1">
                                        <div className="flex flex-col sm:flex-row print:flex-row justify-between items-start sm:items-baseline print:items-baseline text-sm mb-1">
                                            <h4 className="font-bold text-gray-900">{p.name}</h4>
                                            <span className="font-medium text-gray-600 sm:mt-0 print:mt-0 mt-1">
                                                ({p.type})
                                            </span>
                                        </div>
                                        {p.description && (
                                            <ul className="list-disc list-inside text-sm text-gray-700 ml-4 space-y-1">
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

                </div>
            </main>
        </div>
    );
}

export default ModernSidebarTemplate;