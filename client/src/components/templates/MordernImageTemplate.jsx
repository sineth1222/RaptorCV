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
    // Note: The image uses accentColor for background, but the new template uses a white background for better contrast/printing.
    <div 
        className="text-xs font-semibold px-2 py-1 rounded-full inline-block mb-1 mr-1 print:break-all"
        style={{ 
            backgroundColor: '#ffffff', // Always white background for skills in the sidebar area
            color: '#333', // Dark text color
            border: `1px solid ${accentColor}` // Border with accent color for definition
        }}
    >
        {skill}
    </div>
);

// Sidebar Section Header
const SidebarHeader = ({ title, accentColor }) => (
    <h3 
        className="uppercase text-sm font-bold pt-4 pb-1 mb-2 tracking-wider"
        style={{ color: accentColor, borderBottom: `1px solid ${accentColor}` }} // Using accent color for header and border
    >
        {title}
    </h3>
);

// Main Content Section Header
const MainHeader = ({ title }) => (
    <h3 
        className="uppercase text-lg font-bold pt-4 mb-2 tracking-widest border-b border-gray-300 pb-1 text-gray-800"
    >
        {title}
    </h3>
);


// --- Main Template Component ---

const MordernImageTemplate = ({ data, accentColor }) => {
    
    // Helper function to format dates
    const formatDate = (dateStr, justYear = false) => {
        if (!dateStr || dateStr.toLowerCase() === 'present') return 'Present';
        
        const [year, month] = dateStr.split("-");

        if (justYear && year) {
            return year;
        }
        
        if (year && month) {
            // Using MMM YYYY format
            const date = new Date(year, parseInt(month, 10) - 1);
            return date.toLocaleString('en-us', { month: 'short' }) + ` ${year}`;
        }
        return dateStr;
    };


    return (
        // Main container: Mobile column stack, Desktop/Print row layout
        <div className="max-w-6xl mx-auto bg-white shadow-xl flex flex-col md:flex-row print:flex-row font-sans print:max-w-full print:shadow-none">
            
            {/* Left Sidebar (Narrow Column - Light Background) */}
            {/* order-last on mobile to put Main Content first, md:order-none to revert on desktop */}
            <aside 
                className="w-full md:w-[280px] print:w-[35%] p-6 text-gray-800 shrink-0 **order-last md:order-none**" 
                style={{ backgroundColor: '#f5f5f5' }} // Light gray background
            >
                
                {/* Image */}
                {data.personal_info?.image && (
                    <div className="mb-6 flex justify-center md:justify-start">
                        <img 
                            src={data.personal_info.image} 
                            alt="Profile" 
                            className="w-32 h-32 object-cover rounded-full border-4 shadow-md" 
                            style={{ borderColor: accentColor }}
                        />
                    </div>
                )}

                {/* Contact */}
                <section className="mb-6">
                    <SidebarHeader title="Contact" accentColor={accentColor} />
                    <div className="space-y-3 text-sm font-medium text-gray-700">
                        {data.personal_info?.email && (
                            <div className="flex items-center gap-2">
                                <Mail size={16} className="text-gray-500" />
                                <span className="break-all">{data.personal_info.email}</span>
                            </div>
                        )}
                        {data.personal_info?.phone && (
                            <div className="flex items-center gap-2">
                                <Phone size={16} className="text-gray-500" />
                                <span>{data.personal_info.phone}</span>
                            </div>
                        )}
                        {data.personal_info?.location && (
                            <div className="flex items-start gap-2">
                                <MapPin size={16} className="text-gray-500" style={{ marginTop: '2px' }} />
                                <span>{data.personal_info.location}</span>
                            </div>
                        )}
                        {data.personal_info?.linkedin && (
                            <div className="flex items-start gap-2"> 
                                <Linkedin size={16} className="text-gray-500 shrink-0" style={{ marginTop: '2px' }} />
                                <div className="flex flex-col min-w-0"> 
                                    {/* 1. ප්‍රදර්ශනය සඳහා: LinkedIn */}
                                    <a 
                                        href={data.personal_info.linkedin} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="hover:underline text-gray-700 break-words font-semibold"
                                    >
                                        LinkedIn
                                    </a>
                                </div>
                            </div>
                        )}
                        {data.personal_info?.website && (
                            <div className="flex items-start gap-2">
                                <Globe size={16} className="text-gray-500 shrink-0" style={{ marginTop: '2px' }} />
                                <div className="flex flex-col min-w-0">
                                    {/* 1. Display Name/Handle */}
                                    <a 
                                        href={data.personal_info.website} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        // Changed break-all to break-words and added font-semibold
                                        className="hover:underline text-gray-700 break-words font-semibold"
                                    >
                                        Portfolio
                                    </a>
                                    
                                </div>
                            </div>
                        )}
                    </div>
                </section>
                
                {/* Skills - Rendered as Pills/Tags */}
                {data.skills && data.skills.length > 0 && (
                    <section className="mb-6">
                        <SidebarHeader title="Relevant Skills" accentColor={accentColor} />
                        <div className="flex flex-wrap gap-2 mt-2">
                            {data.skills.map((skill, index) => (
                                <SkillPill key={index} skill={skill} accentColor={accentColor} />
                            ))}
                        </div>
                    </section>
                )}
                
                {/* Languages */}
                {data.languages && data.languages.length > 0 && (
                    <section className="mb-6">
                        <SidebarHeader title="Languages" accentColor={accentColor} />
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
                        <SidebarHeader title="References" accentColor={accentColor} />
                        <div className="space-y-3 text-xs text-gray-700">
                            {data.references.map((ref, index) => (
                                <div key={index}>
                                    <p className="font-bold mb-1" style={{ color: accentColor }}>{ref.name}</p>
                                    <p className="text-gray-700">{ref.title}</p>
                                    <p className="text-gray-700">{ref.company}</p>
                                    <p className="text-xs italic mt-1">{ref.contact}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
                
                {/* Certificates (Moved to sidebar if present) */}
                {data.certificates && data.certificates.length > 0 && (
                    <section className="mb-6">
                        <SidebarHeader title="Certificates" accentColor={accentColor} />
                        <div className="space-y-2 text-sm text-gray-700">
                            {data.certificates.map((cert, index) => (
                                <div key={index}>
                                    <p className="font-semibold" style={{ color: accentColor }}>{cert.name}</p>
                                    <p className="text-xs italic">{cert.institution} - {cert.year}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

            </aside>

            {/* Right Main Content (Wide Column) */}
            <main className="grow w-full md:w-auto print:w-[65%] p-6 pt-8">
                
                {/* Header Block: Name, Profession, and Summary */}
                <header className="mb-6">
                    <h1 className="text-3xl font-extrabold uppercase tracking-wide mb-1" style={{ color: accentColor }}>
                        {data.personal_info?.full_name || ""}
                    </h1>
                    <h2 className="text-xl font-semibold mb-3 text-gray-700">
                        {data.personal_info?.profession || ""}
                    </h2>
                    {data.professional_summary && (
                        <p className="text-sm leading-relaxed text-gray-700 border-t pt-3 mt-3 border-gray-200">
                            {data.professional_summary}
                        </p>
                    )}
                </header>

                {/* Education */}
                {data.education && data.education.length > 0 && (
                    <section className="mb-6">
                        <MainHeader title="Educational Background" />
                        <div className="space-y-4">
                            {data.education.map((edu, index) => (
                                <div key={index} className="pb-1">
                                    <div className="flex flex-col sm:flex-row print:flex-row justify-between items-start sm:items-baseline print:items-baseline text-sm font-bold text-gray-900 mb-1">
                                        <h4 style={{ color: accentColor }}>{edu.degree} {edu.field && `in ${edu.field}`}</h4>
                                        <span className="font-medium text-gray-600 sm:mt-0 print:mt-0 mt-1">
                                            {formatDate(edu.start_date, true)} - {formatDate(edu.graduation_date, true)}
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
                
                {/* Work Experience */}
                {data.experience && data.experience.length > 0 && (
                    <section className="mb-6">
                        <MainHeader title="Work Experience" />
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

                {/* project Experience */}
                {data.project && data.project.length > 0 && (
                    <section className="mb-6">
                        <MainHeader title="Projects Experience" />
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

                {/* Achievements (Optional - if data exists) */}
                {data.achievements && data.achievements.length > 0 && (
                    <section className="mb-6">
                        <MainHeader title="Achievements" />
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
            </main>
        </div>
    );
}

export default MordernImageTemplate;