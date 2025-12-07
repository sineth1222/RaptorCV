import React from 'react';
import { Mail, Phone, MapPin } from "lucide-react";

const ClassicTwoColumnTemplate = ({ data, accentColor }) => {
    
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


    // 1. Full-Width Dark Header Bar and Centered Info
    const renderHeader = () => (
        <header 
            className="text-center p-6 text-white" 
            // Inline style for background color to maximize print visibility
            style={{ backgroundColor: accentColor }}
        >
            {/* Name */}
            <h1 className="text-3xl font-extrabold uppercase tracking-widest mb-1">
                {data.personal_info?.full_name || "EMMA SMITH"}
            </h1>
            
            {/* Title/Profession */}
            <h2 className="text-base font-medium uppercase mb-3">
                {data.personal_info?.profession || "BANK TELLER"}
            </h2>
            
            {/* Contact Line - uses flex-wrap for mobile responsiveness */}
            <div className="text-sm font-light flex flex-wrap justify-center items-center gap-x-3 gap-y-1">
                {data.personal_info?.location && <span className="whitespace-nowrap">{data.personal_info.location} | </span>}
                {data.personal_info?.phone && <span className="whitespace-nowrap">{data.personal_info.phone} | </span>}
                {data.personal_info?.email && <span className="whitespace-nowrap">{data.personal_info.email} | </span>}
                {data.personal_info?.linkedin && (
                    <a 
                        target="_blank" 
                        href={data.personal_info.linkedin} 
                        className="hover:underline whitespace-nowrap"
                    >
                        <span>{data.personal_info.linkedin.replace(/(^\w+:|^)\/\//, '').replace(/\/$/, '') || 'LinkedIn'} <span className="text-white"> | </span></span>
                    </a>
                )}
                {data.personal_info?.website && (
                    <a 
                        target="_blank" 
                        href={data.personal_info.website} 
                        className="hover:underline whitespace-nowrap"
                    >
                        <span>{data.personal_info.website.replace(/(^\w+:|^)\/\//, '').replace(/\/$/, '') || 'Protfolio'}</span> 
                    </a>
                )}
            </div>
        </header>
    );

    // 2. Section Header
    const SectionHeader = ({ title }) => (
        <h2 
            className="uppercase text-sm font-extrabold pt-1 mb-2 tracking-wider text-gray-800"
        >
            {title}
        </h2>
    );

    // 3. Content Block - Now responsive: Single column on mobile, two columns on medium screens AND print
    const ContentBlock = ({ title, children, isFirst = false }) => (
        <div 
            // Default to 1 column, switch to 12 columns on medium screens (md) AND when printing (print)
            className="grid grid-cols-1 md:grid-cols-12 print:grid-cols-12 gap-6" 
            style={{ marginTop: isFirst ? 0 : '1.5rem' }}
        >
            {/* Title: Default to 12 columns, switch to 3 columns on medium screens AND print */}
            <div className="col-span-12 md:col-span-3 print:col-span-3 pt-1">
                <SectionHeader title={title} />
            </div>
            {/* Content: Default to 12 columns, switch to 9 columns on medium screens AND print */}
            <div className="col-span-12 md:col-span-9 print:col-span-9">
                {children}
            </div>
        </div>
    );


    return (
        // Added max-w-full on print for better full-page print
        <div className="max-w-5xl mx-auto bg-white text-gray-800 font-serif shadow-xl print:max-w-full">
            
            {renderHeader()}
            
            {/* Professional Summary Section */}
            {data.professional_summary && (
                <section className="p-8 pb-4">
                    <p className="text-sm text-gray-700 leading-relaxed text-left"> 
                        {data.professional_summary}
                    </p>
                </section>
            )}

            {/* Main Content Area */}
            <div className="px-8 pb-8 pt-4">

                {/* Education */}
                {data.education && data.education.length > 0 && (
                    <ContentBlock title="Education">
                        <div className="space-y-4">
                            {data.education.map((edu, index) => (
                                <div key={index} className="pb-1">
                                    {/* Responsive flex for details: column on default, row on sm screens and print */}
                                    <div className="flex flex-col sm:flex-row print:flex-row justify-between items-start text-sm font-bold text-gray-900 mb-1">
                                        <h3>{edu.degree} {edu.field && ` in ${edu.field}`}</h3>
                                        {/* Added mt-1 for spacing on mobile, reset on sm/print */}
                                        <span className="font-normal text-sm mt-1 sm:mt-0 print:mt-0">{formatDate(edu.graduation_date, true)}</span>
                                    </div>
                                    <p className="text-sm italic text-gray-700">{edu.institution}</p>
                                    {edu.gpa && <p className="text-sm text-gray-600">Grade: {edu.gpa}</p>}
                                </div>
                            ))}
                        </div>
                    </ContentBlock>
                )}

                {/* Work Experience */}
                {data.experience && data.experience.length > 0 && (
                    <ContentBlock title="Work Experience">
                        <div className="space-y-4">
                            {data.experience.map((exp, index) => (
                                <div key={index} className="pb-1">
                                    {/* Responsive flex for details: column on default, row on sm screens and print */}
                                    <div className="flex flex-col sm:flex-row print:flex-row justify-between items-start text-sm font-bold text-gray-900 mb-1">
                                        <h3>{exp.position}</h3>
                                        {/* Added mt-1 for spacing on mobile, reset on sm/print */}
                                        <span className="font-normal text-sm mt-1 sm:mt-0 print:mt-0">{formatDate(exp.start_date)} - {exp.is_current ? "Present" : formatDate(exp.end_date)}</span>
                                    </div>
                                    <p className="text-sm italic text-gray-700 mb-1">{exp.company}</p>
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
                    </ContentBlock>
                )}

                {/* project Experience */}
                {data.project && data.project.length > 0 && (
                    <ContentBlock title="Project Experience">
                        <div className="space-y-4">
                            {data.project.map((p, index) => (
                                <div key={index} className="pb-1">
                                    <div className="flex justify-between items-start text-sm font-bold text-gray-900 mb-2">
                                        <h3>{p.name}</h3> <span className="text-sm text-gray-600 font-medium">
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
                    </ContentBlock>
                )}
                
                {/* Relevant Skills */}
                {data.skills && data.skills.length > 0 && (
                    <ContentBlock title="Relevant Skills" isFirst={true}>
                        <ul className="flex flex-wrap gap-2 mt-2">
                            {data.skills.map((skill, index) => (
                                <span
                                    key={index}
                                    // Forces text color to white during print for contrast (relying on inline style for background)
                                    className="px-3 py-1 text-sm text-white rounded-full print:text-white!"
                                    style={{ backgroundColor: accentColor }}
                                >
                                    {skill}
                                </span>
                            ))}
                        </ul>
                    </ContentBlock>
                )}

                
                {/* References */}
                {data.references && data.references.length > 0 && (
                    <ContentBlock title="References">
                        {/* Responsive flex for references: column on default, row on sm screens and print */}
                        <div className="flex flex-col sm:flex-row print:flex-row gap-4 sm:gap-8 text-sm text-gray-700">
                            {data.references.map((ref, index) => (
                                <div key={index}>
                                    <p className="font-bold">{ref.name}</p>
                                    <p className="text-sm">{ref.title}</p>
                                    <p className="text-sm">{ref.company}</p>
                                    <p className="text-sm">{ref.contact}</p>
                                </div>
                            ))}
                        </div>
                    </ContentBlock>
                )}

            </div>
            
        </div>
    );
}

export default ClassicTwoColumnTemplate;