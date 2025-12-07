import { Mail, Phone, MapPin } from "lucide-react";

const TraditionalResumeTempalte = ({ data, accentColor }) => {
    
    // ... formatDate, RightSectionHeader, LeftSectionHeader Helper Functions ... (No changes needed here)

    const formatDate = (dateStr) => {
        if (!dateStr || dateStr.toLowerCase() === 'current') return 'Present';
        
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
            month: "short",
        });
    };

    const RightSectionHeader = ({ title }) => (
        <h2 
            className="uppercase text-lg sm:text-xl font-bold pt-0 mb-3" 
            style={{ color: accentColor }} 
        >
            {title}
        </h2>
    );
    
    const LeftSectionHeader = ({ title }) => (
        <h2 
            className="uppercase text-lg sm:text-xl font-bold pt-0 mb-3" 
            style={{ color: accentColor }} 
        >
            {title}
        </h2>
    );


    return (
        <div className="max-w-5xl mx-auto p-4 sm:p-8 bg-white text-gray-800 font-serif">
            {/* Header Section remains the same */}
            <section 
                className="pt-4 pb-4 mb-4 border-t border-b mx-auto sm:mx-8 print:mx-8"
                style={{ 
                    borderColor: accentColor,
                    borderTopWidth: '2px',
                    borderBottomWidth: '2px' 
                }}
            >
                <header className="text-center mb-4">
                    <h1 className="text-3xl sm:text-4xl font-normal uppercase tracking-wider mb-2">
                        {data.personal_info?.full_name || "SINETH MASHENKA"}
                    </h1>
                    <h2 className="text-base sm:text-lg font-semibold uppercase mb-3" style={{ color: accentColor }}>
                        {data.personal_info?.profession || "UNDERGRADUATE"}
                    </h2>
                    
                    <div className="text-xs sm:text-sm text-gray-700 flex flex-wrap justify-center gap-x-3 gap-y-1 
                                    md:[&>span:not(:last-child)]:after:content-['|'] md:[&>span:not(:last-child)]:after:mx-2 
                                    print:[&>span:not(:last-child)]:after:content-['|'] print:[&>span:not(:last-child)]:after:mx-2">
                        {data.personal_info?.phone && <span className="whitespace-nowrap">{data.personal_info.phone}</span>}
                        {data.personal_info?.email && <span className="whitespace-nowrap">{data.personal_info.email}</span>}
                        {data.personal_info?.location && <span className="whitespace-nowrap">{data.personal_info.location}</span>}
                        {data.personal_info?.linkedin && (
                            <a 
                                target="_blank" 
                                href={data.personal_info.linkedin} 
                                className="hover:text-blue-600 hover:underline whitespace-nowrap"
                            >
                                <span>{data.personal_info.linkedin.replace(/(^\w+:|^)\/\//, '').replace(/\/$/, '') || 'LinkedIn'}</span>
                            </a>
                        )}
                        {data.personal_info?.website && (
                            <a 
                                target="_blank" 
                                href={data.personal_info.website} 
                                className="hover:text-blue-600 hover:underline whitespace-nowrap"
                            >
                                <span>{data.personal_info.website.replace(/(^\w+:|^)\/\//, '').replace(/\/$/, '') || 'Protfolio'}</span>
                            </a>
                        )}
                    </div>
                    
                </header>
            </section>

            {/* Main Content: Two-Column Layout (Skills වම් තීරුව ලෙස) */}
            <div className="grid grid-cols-1 md:grid-cols-12 print:grid-cols-12 gap-6 md:gap-8 print:gap-8">
                
                {/* 1. Left Column: Skills, Languages, References - 4/12 width */}
                {/* Mobile වලදී Skills කොටස Summary සහ Experience වලට පසුව පෙන්වීමට order-3 භාවිතා කෙරේ */}
                <aside className="col-span-12 md:col-span-4 print:col-span-4 md:pr-4 print:pr-4 order-3 md:order-0 print:order-0">
                    
                    {/* Skills */}
                    {data.skills && data.skills.length > 0 && (
                        <section className="mb-6">
                            <LeftSectionHeader title="Core Skills" /> 
                            <ul className="space-y-1 text-sm text-gray-700 list-none">
                                {data.skills.map((skill, index) => (
                                    <li key={index} className="pl-1 before:content-['•_'] before:font-bold before:text-gray-900">{skill}</li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {/* Languages */}
                    {data.languages && data.languages.length > 0 && (
                        <section className="mb-6">
                            <LeftSectionHeader title="Languages" />
                            <div className="space-y-1 pt-1">
                                {data.languages.map((lang, index) => (
                                    <p key={index} className="text-sm text-gray-700">
                                        <span className="font-semibold">{lang.language}</span> - {lang.level}
                                    </p>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* References */}
                    {data.references && data.references.length > 0 && (
                        <section className="mb-6">
                            <LeftSectionHeader title="References" />
                            <div className="flex flex-col gap-4 text-sm text-gray-700">
                                {data.references.map((ref, index) => (
                                    <div key={index} className="w-full md:w-full print:w-full">
                                        <p className="font-bold">{ref.name}</p>
                                        <p className="text-sm">{ref.title}</p>
                                        <p className="text-sm">{ref.company}</p>
                                        <p className="text-sm">{ref.contact}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                </aside>

                {/* 2. Right Column: Summary, Experience, Education, Projects - 8/12 width 
                   - මෙහිදී border-l සහ pl-8 යොදනු ලබන්නේ MD සහ Print වලදී පමණි.
                   - Mobile වලදී Summary මුලින්ම පෙන්වීමට order-2 භාවිතා කෙරේ.
                */}
                <main className="col-span-12 md:col-span-8 print:col-span-8 
                                md:border-l md:border-gray-300 md:pl-8 
                                print:border-l print:border-gray-300 print:pl-8 
                                order-2 md:order-0 print:order-0">
                    
                    {/* Professional Summary */}
                    {data.professional_summary && (
                        <section className="mb-6">
                            <RightSectionHeader title="Professional Summary" />
                            <p className="text-sm text-gray-700 leading-relaxed">
                                {data.professional_summary}
                            </p>
                        </section>
                    )}
                    
                    {/* Experience */}
                    {data.experience && data.experience.length > 0 && (
                        <section className="mb-6">
                            <RightSectionHeader title="Experience" />
                            <div className="space-y-4">
                                {data.experience.map((exp, index) => (
                                    <div key={index} className="pb-1">
                                        <div className="flex flex-col sm:flex-row justify-between items-start text-sm mb-1">
                                            <h3 className="font-semibold text-gray-900 mb-0.5 sm:mb-0">
                                                {exp.position} 
                                            </h3>
                                            <span className="text-xs sm:text-sm text-gray-600 font-medium shrink-0">
                                                {formatDate(exp.start_date)} -{" "}
                                                {exp.is_current ? "Present" : formatDate(exp.end_date)}
                                            </span>
                                        </div>
                                        <p className="text-sm italic text-gray-700 mb-2">
                                            {exp.company}, {exp.location}
                                        </p>
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
                    
                    {/* Education */}
                    {data.education && data.education.length > 0 && (
                        <section className="mb-6">
                            <RightSectionHeader title="Education" />
                            <div className="space-y-3">
                                {data.education.map((edu, index) => (
                                    <div key={index} className="pb-1">
                                        <div className="flex flex-col sm:flex-row justify-between items-start text-sm">
                                            <h3 className="font-semibold text-gray-900 mb-0.5 sm:mb-0">
                                                {edu.degree} {edu.field && `: ${edu.field}`}
                                            </h3>
                                            <span className="text-xs sm:text-sm text-gray-600 font-medium shrink-0">
                                                {formatDate(edu.graduation_date)}
                                            </span>
                                        </div>
                                        <p className="text-sm italic text-gray-700">
                                            {edu.institution}, {edu.location}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Project */}
                    {data.project && data.project.length > 0 && (
                        <section className="mb-6">
                            <RightSectionHeader title="Projects Experience" />
                            <div className="space-y-4">
                                {data.project.map((p, index) => (
                                    <div key={index} className="pb-1">
                                        <div className="flex flex-col sm:flex-row justify-between items-start text-sm mb-1">
                                            <h3 className="font-semibold text-gray-900 mb-0.5 sm:mb-0">
                                                {p.name} - <span className="text-sm text-gray-600 font-medium">
                                                    ({p.type})
                                                </span>
                                            </h3>
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

                </main>
            </div>
        </div>
    );
}

export default TraditionalResumeTempalte;