/* eslint-disable react-hooks/static-components */
import { Mail, Phone, MapPin } from "lucide-react";


const StrongTemplate = ({ data, accentColor }) => {


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

    // Main Header - Name, Profession, and Contact Info
    const renderHeader = ({data}) => (
        <header className="mb-4 text-center">
            <h1 className="text-3xl font-extrabold uppercase tracking-wide mb-1 text-gray-900">
                {data.personal_info?.full_name || ""}
            </h1>
            <h2 className="text-base font-semibold uppercase mb-2" style={{ color: accentColor }}>
                {data.personal_info?.profession || ""}
            </h2>
            {/* Contact Line - uses flex-wrap to handle overflow on small screens */}
            <div className="text-sm text-gray-700 flex flex-wrap justify-center items-center gap-x-3 gap-y-1">
                {/* Each item uses whitespace-nowrap and a subtle separator */}
                {data.personal_info?.phone && <span className="whitespace-nowrap">{data.personal_info.phone} <span className="text-gray-400">|</span> </span>}
                {data.personal_info?.email && <span className="whitespace-nowrap">{data.personal_info.email} <span className="text-gray-400">|</span> </span>}
                {data.personal_info?.location && <span className="whitespace-nowrap">{data.personal_info.location} <span className="text-gray-400">|</span> </span>}
                {data.personal_info?.linkedin && (
                    <a 
                        target="_blank" 
                        href={data.personal_info.linkedin} 
                        className="hover:text-blue-600 hover:underline whitespace-nowrap"
                    >
                        <span>LinkedIn <span className="text-gray-400"> | </span></span>
                    </a>
                )}
                {data.personal_info?.website && (
                    <a 
                        target="_blank" 
                        href={data.personal_info.website} 
                        className="hover:text-blue-600 hover:underline whitespace-nowrap"
                    >
                        <span>Portfolio</span> 
                    </a>
                )}
            </div>
        </header>
    );

    // Section Header
    const SectionHeader = ({ title }) => (
        <h2 
            className="uppercase text-lg font-bold py-1 pl-4 tracking-wider border-l-4"
            style={{ color: accentColor, borderLeftColor: accentColor }}
        >
            {title}
        </h2>
    );

    // Component to hold the header and its content
    const WorkExperienceContent = ({data}) => (
        <section id="work-experience-content" className="space-y-6">
            {data.experience.map((exp, index) => (
                <div key={index} className="pb-1">
                    {/* flex-col on mobile, flex-row on medium screens AND print */}
                    <div className="flex flex-col md:flex-row print:flex-row justify-between items-start text-sm mb-1">
                        <div>
                            <h3 className="font-bold text-gray-900">
                                {exp.position} 
                            </h3>
                            <p className="text-sm italic text-gray-700">
                                {exp.company}
                            </p>
                        </div>
                        {/* mt-1 on mobile, mt-0 on medium screens AND print */}
                        <span className="text-sm text-gray-600 font-medium shrink-0 mt-1 md:mt-0 print:mt-0">
                            {formatDate(exp.start_date)} -{" "}
                            {exp.is_current ? "Present" : formatDate(exp.end_date)}
                        </span>
                    </div>
                    {exp.description && (
                        <ul className="list-disc list-inside text-sm text-gray-700 ml-4 space-y-1 mt-2">
                            {exp.description.split("\n").map((line, i) => (
                                <li key={i}>{line}</li>
                            ))}
                        </ul>
                    )}
                </div>
            ))}
        </section>
    );

    const EducationContent = ({data}) => (
        <section id="education-content" className="space-y-4">
            {data.education.map((edu, index) => (
                <div key={index} className="pb-1">
                    {/* flex-col on mobile, flex-row on medium screens AND print */}
                    <div className="flex flex-col md:flex-row print:flex-row justify-between items-start text-sm">
                        <div>
                            <h3 className="font-bold text-gray-900">
                                {edu.degree} {edu.field && ` in ${edu.field}`}
                            </h3>
                            <p className="text-sm italic text-gray-700">
                                {edu.institution}
                            </p>
                            {edu.gpa && <p className="text-sm text-gray-600">Grade: {edu.gpa}</p>}
                        </div>
                        {/* mt-1 on mobile, mt-0 on medium screens AND print */}
                        <span className="text-sm text-gray-600 font-medium shrink-0 mt-1 md:mt-0 print:mt-0">
                            {formatDate(edu.graduation_date)}
                        </span>
                    </div>
                </div>
            ))}
        </section>
    );

    const ProjectExperienceContent = ({data}) => (
        <section id="project-experience-content" className="space-y-6">
            {data.project.map((p, index) => (
                <div key={index} className="pb-1">
                    <div className="flex flex-col justify-between items-start text-sm mb-1">
                        <div>
                            <h3 className="font-bold text-gray-900">
                                {p.name} - <span className="text-sm text-gray-600 font-medium">
                                    ({p.type})
                                </span>
                            </h3>
                        </div>
                    </div>
                    {p.description && (
                        <ul className="list-disc list-inside text-sm text-gray-700 ml-4 space-y-1 mt-2">
                            {p.description.split("\n").map((line, i) => (
                                <li key={i}>{line}</li>
                            ))}
                        </ul>
                    )}
                </div>
            ))}
        </section>
    );

    // Combining the title and content for better alignment
    const ContentBlock = ({ title, children }) => (
        // Forces grid-cols-12 for print, matching the 'md:' layout
        <div className="grid grid-cols-1 md:grid-cols-12 print:grid-cols-12 gap-4 md:gap-8 print:gap-8 mb-8">
            
            {/* Title takes full width on mobile, 3 columns on medium screens AND print */}
            <div className="col-span-1 md:col-span-3 print:col-span-3">
                <SectionHeader title={title} />
            </div>
            
            {/* Content takes full width on mobile, 9 columns on medium screens AND print */}
            <div className="col-span-1 md:col-span-9 md:pt-1 print:col-span-9 print:pt-1">
                {children}
            </div>
        </div>
    );


    return (
        // Main container
        <div className="max-w-5xl mx-auto bg-white text-gray-800 font-sans shadow-lg border-t-8" style={{ borderTopColor: accentColor }}>
            
            <div className="p-4 sm:p-8">
                {renderHeader()}
            </div>
            
            {/* Professional Summary Section */}
            {data.professional_summary && (
                <section 
                    className="pt-4 pb-4 mb-4 mx-4 sm:mx-8 border-t border-b"
                    style={{ 
                        borderColor: accentColor,
                        borderTopWidth: '2px',
                        borderBottomWidth: '2px' 
                    }}
                >
                    <p className="text-sm text-gray-700 leading-relaxed text-center"> 
                        {data.professional_summary}
                    </p>
                </section>
            )}


            {/* Main Content Area */}
            <div className="p-4 sm:p-8 pt-0">

                {/* Education */}
                {data.education && data.education.length > 0 && (
                    <ContentBlock title="Education">
                        <EducationContent />
                    </ContentBlock>
                )}

                {/* Work Experience */}
                {data.experience && data.experience.length > 0 && (
                    <ContentBlock title="Work Experience">
                        <WorkExperienceContent />
                    </ContentBlock>
                )}


                {/* project Experience */}
                {data.project && data.project.length > 0 && (
                    <ContentBlock title="Project Experience">
                        <ProjectExperienceContent />
                    </ContentBlock>
                )}

                {/* Relevant Skills */}
                {data.skills && data.skills.length > 0 && (
                    <ContentBlock title="Relevant Skills">
                        {/* Forces 2 columns for print, matching the 'sm:' layout */}
                        <ul className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-x-6 text-sm text-gray-700 list-disc list-inside">
                            {data.skills.map((skill, index) => (
                                <li key={index} className="pl-1">{skill}</li>
                            ))}
                        </ul>
                    </ContentBlock>
                )}


                {/* Lanuages */}
                {data.languages && data.languages.length > 0 && (
                    <ContentBlock title="Languages">
                        <div className="space-y-1 pt-2 flex flex-wrap gap-x-6 gap-y-2 items-start">
                            {data.languages.map((lang, index) => (
                                <p key={index} className="text-sm text-gray-700 min-w-[45%]">
                                    • <span className="font-semibold">{lang.language}</span> - {lang.level}
                                </p>
                            ))}
                        </div>
                    </ContentBlock>
                )}
                
                {/* References (If applicable) */}
                {data.references && data.references.length > 0 && (
                    <ContentBlock title="References">
                        {/* Forces flex-row for print, matching the 'sm:' layout */}
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

export default StrongTemplate;