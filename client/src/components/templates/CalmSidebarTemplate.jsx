import React from 'react';
import { Mail, Phone, MapPin, Linkedin, Globe } from "lucide-react";

// --- Helper Components ---

// Skill Pill/Tag 
const SkillPill = ({ skill, accentColor }) => (
    <div 
        // Ensure no unnatural breaks
        className="text-xs font-semibold px-2 py-1 rounded-sm inline-block mb-1 mr-1"
        style={{ 
            backgroundColor: 'transparent',
            color: '#333', 
            border: `1px solid ${accentColor}`,
        }}
    >
        {skill}
    </div>
);

// Sidebar Section Header
const SidebarHeader = ({ title, accentColor }) => (
    <h3 
        // Prevents header from being separated from content
        className="uppercase text-sm font-bold pt-4 pb-1 mb-2 tracking-wider print:break-after-avoid print:break-before-avoid"
        style={{ color: accentColor, borderBottom: `2px solid ${accentColor}` }}
    >
        {title}
    </h3>
);

// Main Content Section Header
const MainHeader = ({ title, accentColor }) => (
    <h3 
        // Prevents header from being separated from content
        className="uppercase text-lg font-bold pt-4 mb-2 tracking-widest text-gray-800 print:break-after-avoid"
        style={{ borderBottom: `2px solid ${accentColor}`, paddingBottom: '4px' }}
    >
        {title}
    </h3>
);


// --- Main Template Component ---

const CalmSidebarTemplate = ({ data, accentColor }) => {
    
    // Helper function to format dates
    const formatDate = (dateStr) => {
        if (!dateStr || dateStr.toLowerCase() === 'present') return 'Present';
        
        const [year, month] = dateStr.split("-");

        if (year && month) {
            const date = new Date(year, parseInt(month, 10) - 1);
            return date.toLocaleString('en-us', { month: 'short', year: 'numeric' });
        }
        if (year) return year;
        return dateStr;
    };


    return (
        // FIX 1: Explicitly set print dimensions and force flex-nowrap to keep columns side-by-side.
        // Also removed mx-auto and shadow for a clean print look.
        <div className="max-w-6xl mx-auto bg-white shadow-xl flex flex-col md:flex-row print:flex-row print:flex-nowrap font-sans print:max-w-[8.5in] print:w-full print:shadow-none print:p-0">
            
            {/* Left Sidebar (Narrow Column) */}
            <aside 
                // FIX 2: Locked width in print and added shrink/grow preventions to ensure column size is preserved.
                // Adjusted padding for print margins (px-4 for narrow padding, pt-6 for top)
                className="w-full md:w-[280px] print:w-[250px] print:min-w-[250px] p-6 text-gray-800 shrink-0 print:shrink-0 print:grow-0 print:px-4 print:pt-6" 
                style={{ backgroundColor: '#f3f2f7' }} 
            >
                
                {/* Image (Circular) - Assuming image data is present, otherwise omit */}
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
                <section className="mb-6 print:break-inside-avoid">
                    <SidebarHeader title="Contact" accentColor={accentColor} />
                    <div className="space-y-3 text-sm font-medium text-gray-700">
                        {data.personal_info?.email && (
                            // FIX 3: break-words to prevent email overflow
                            <div className="flex items-start gap-2">
                                <Mail size={16} className="text-gray-500 shrink-0" style={{ marginTop: '2px' }} />
                                <span className="wrap-break-word">{data.personal_info.email}</span>
                            </div>
                        )}
                        {data.personal_info?.phone && (
                            <div className="flex items-center gap-2">
                                <Phone size={16} className="text-gray-500 shrink-0" />
                                <span>{data.personal_info.phone}</span>
                            </div>
                        )}
                        {data.personal_info?.location && (
                            <div className="flex items-start gap-2">
                                <MapPin size={16} className="text-gray-500 shrink-0" style={{ marginTop: '2px' }} />
                                <span>{data.personal_info.location}</span>
                            </div>
                        )}
                        {data.personal_info?.linkedin && (
                            // FIX 4: break-words on link
                            <div className="flex items-start gap-2">
                                <Linkedin size={16} className="text-gray-500 shrink-0" style={{ marginTop: '2px' }} />
                                <a 
                                    href={data.personal_info.linkedin} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="hover:underline text-gray-700 wrap-break-word"
                                >
                                    LinkedIn
                                </a>
                            </div>
                        )}
                        {data.personal_info?.website && (
                            // FIX 5: break-words on link
                            <div className="flex items-start gap-2">
                                <Globe size={16} className="text-gray-500 shrink-0" style={{ marginTop: '2px' }} />
                                <a 
                                    href={data.personal_info.website} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="hover:underline text-gray-700 wrap-break-word"
                                >
                                    Protfolio
                                </a>
                            </div>
                        )}
                    </div>
                </section>
                
                {/* Skills - Rendered as Pills/Tags */}
                {data.skills && data.skills.length > 0 && (
                    <section className="mb-6 print:break-inside-avoid">
                        <SidebarHeader title="Skills" accentColor={accentColor} />
                        <div className="flex flex-wrap mt-2">
                            {Array.isArray(data.skills) && data.skills.map((skill, index) => (
                                <SkillPill key={index} skill={skill} accentColor={accentColor} />
                            ))}
                        </div>
                    </section>
                )}
                
                {/* Languages */}
                {data.languages && data.languages.length > 0 && (
                    <section className="mb-6 print:break-inside-avoid">
                        <SidebarHeader title="Languages" accentColor={accentColor} />
                        <div className="space-y-3 text-sm text-gray-700">
                            {data.languages.map((lang, index) => (
                                <div key={index}>
                                    <p className="text-sm text-gray-700 mb-1">
                                        <span className="font-semibold">{lang.language}</span> - {lang.level}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* References */}
                {data.references && data.references.length > 0 && (
                    <section className="mb-6 print:break-inside-avoid print:mb-0">
                        <SidebarHeader title="References" accentColor={accentColor} />
                        <div className="space-y-3 text-xs text-gray-700">
                            {data.references.map((ref, index) => (
                                <div key={index}>
                                    <p className="font-bold mb-1" style={{ color: accentColor }}>{ref.name}</p>
                                    <p className="text-gray-700">{ref.title}</p>
                                    <p className="text-gray-700">{ref.company}</p>
                                    {/* FIX 6: break-words on contact email/phone */}
                                    <p className="text-xs italic mt-1 wrap-break-word">{ref.contact}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

            </aside>

            {/* Right Main Content (Wide Column) */}
            {/* FIX 7: Used print:flex-auto and added print padding for margins */}
            <main className="grow w-full md:w-auto print:flex-auto p-6 pt-8 print:px-6 print:pt-6">
                
                {/* Header Block: Name, Profession, and Summary */}
                <header className="mb-6 print:break-inside-avoid print:break-after-avoid">
                    <h1 className="text-3xl font-extrabold uppercase tracking-wide mb-1" style={{ color: accentColor }}>
                        {data.personal_info?.full_name || ""}
                    </h1>
                    <h2 className="text-xl font-semibold mb-3 text-gray-700">
                        {data.personal_info?.profession || ""}
                    </h2>
                    {data.professional_summary && (
                        <p className="text-sm leading-relaxed text-gray-700 mt-3">
                            {data.professional_summary}
                        </p>
                    )}
                </header>

                {/* EDUCATION */}
                {data.education && data.education.length > 0 && (
                    <section className="mb-6 print:break-inside-avoid print:mb-4"> 
                        <MainHeader title="Educational Background" accentColor={accentColor} />
                        <div className="space-y-4">
                            {data.education.map((edu, index) => (
                                <div key={index} className="pb-4 print:pb-2 print:break-inside-avoid print:break-after-auto"> 
                                    <div className="flex flex-col sm:flex-row print:flex-row justify-between items-start sm:items-baseline print:items-baseline text-sm font-bold text-gray-900 mb-1">
                                        <h4 style={{ color: accentColor }}>{edu.degree} {edu.field && `in ${edu.field}`}</h4>
                                        <span className="font-medium text-gray-600 sm:mt-0 print:mt-0 mt-1 print:whitespace-nowrap">
                                            {formatDate(edu.start_date)} - {formatDate(edu.graduation_date)}
                                        </span>
                                    </div>
                                    <p className="text-sm italic text-gray-700">
                                        {edu.institution}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
                
                {/* WORK EXPERIENCE */}
                {data.experience && data.experience.length > 0 && (
                    <section className="mb-6 print:break-inside-avoid print:mb-4">
                        <MainHeader title="Work Experience" accentColor={accentColor} />
                        <div className="space-y-5">
                            {data.experience.map((exp, index) => (
                                <div key={index} className="pb-4 print:pb-2 print:break-inside-avoid print:break-after-auto"> 
                                    <div className="flex flex-col sm:flex-row print:flex-row justify-between items-start sm:items-baseline print:items-baseline text-sm mb-1">
                                        <h4 className="font-bold text-gray-900">{exp.position}</h4>
                                        <span className="font-medium text-gray-600 sm:mt-0 print:mt-0 mt-1 print:whitespace-nowrap">
                                            {formatDate(exp.start_date)} - {exp.is_current ? "Present" : formatDate(exp.end_date)}
                                        </span>
                                    </div>
                                    <p className="text-sm italic text-gray-700 mb-2">{exp.company}</p>
                                    {exp.description && (
                                        <ul className="list-disc list-inside text-sm text-gray-700 ml-4 space-y-1">
                                            {exp.description.split("\n").map((line, i) => (
                                                // FIX 8: break-words on list items to prevent overflow
                                                <li key={i} className="wrap-break-word">{line}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* PROJECT EXPERIENCE */}
                {data.project && data.project.length > 0 && (
                    <section className="mb-6 print:break-inside-avoid print:mb-0">
                        <MainHeader title="Projects Experience" accentColor={accentColor} />
                        <div className="space-y-5">
                            {data.project.map((p, index) => (
                                <div key={index} className="pb-4 print:pb-2 print:break-inside-avoid print:break-after-auto"> 
                                    <div className="flex flex-col sm:flex-row print:flex-row justify-between items-start sm:items-baseline print:items-baseline text-sm mb-1">
                                        <h4 className="font-bold text-gray-900">{p.name} - ({p.type})</h4>
                                    </div>
                                    {p.description && (
                                        <ul className="list-disc list-inside text-sm text-gray-700 ml-4 space-y-1">
                                            {p.description.split("\n").map((line, i) => (
                                                // FIX 9: break-words on list items to prevent overflow
                                                <li key={i} className="wrap-break-word">{line}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}

export default CalmSidebarTemplate;