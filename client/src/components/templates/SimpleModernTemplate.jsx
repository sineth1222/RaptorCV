import { Mail, Phone, MapPin } from "lucide-react";


// Helper function to format dates as "Month Year" (e.g., "May 2017" or "May 2019 - Current")
    const formatDate = ({dateStr}) => {
        if (!dateStr || dateStr.toLowerCase() === 'current') return 'Current';
        
        // Assuming dateStr is in "YYYY-MM" format
        const [year, month] = dateStr.split("-");
        
        let date;
        if (year && month) {
            // month is 0-indexed in JS Date
            date = new Date(year, month - 1);
        } else {
            // Fallback for non-standard dates if needed
            date = new Date(dateStr);
        }

        if (isNaN(date)) return dateStr; 

        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
        });
    };

    // This section header closely mimics the font-weight, size, and underline style of the image.
    const SectionHeader = ({ title, accentColor }) => (
        <h2 
            className="uppercase text-lg font-bold pt-6 pb-1 mb-2 border-b-2 tracking-wide" 
            style={{ borderColor: accentColor }}
        >
            {title}
        </h2>
    );

    // This renders the main contact line below the name, separated by pipes |
    const renderHeaderContact = ({data}) => {
    const contactItems = [];

    // 1. Add Location
    if (data.personal_info?.location) {
        contactItems.push(data.personal_info.location);
    }

    // 2. Add Phone
    if (data.personal_info?.phone) {
        contactItems.push(data.personal_info.phone);
    }

    // 3. Add Email
    if (data.personal_info?.email) {
        contactItems.push(data.personal_info.email);
    }

    // 4. Add LinkedIn Link (as a clickable React element)
    if (data.personal_info?.linkedin) {
        contactItems.push(
            <a 
                key="linkedin-link" 
                target="_blank" 
                href={data.personal_info.linkedin} 
                className="text-gray-700 hover:text-blue-600 hover:underline font-medium" 
                rel="noopener noreferrer" 
            >
                LinkedIn
            </a>
        );
    }

    // 5. Add Website Link
    if (data.personal_info?.website) {
        contactItems.push(
            <a 
                key="website-link" 
                target="_blank" 
                href={data.personal_info.website} 
                className="text-gray-700 hover:text-blue-600 hover:underline font-medium" 
                rel="noopener noreferrer"
            >
                Portfolio
            </a>
        );
    }


    // Function to correctly render the items separated by the slash (/)
    const renderSeparatedItems = () => {
        return contactItems.map((item, index) => (
            <span key={index} className="inline-flex items-center">
                {item}
                {/* Check if it's NOT the last item before adding the separator */}
                {index < contactItems.length - 1 && <span className="mx-2 font-light text-gray-500"> | </span>}
            </span>
        ));
    };

    return (
        <div className="text-sm text-gray-700">
            {renderSeparatedItems()}
        </div>
    );
};


const SimpleModernTemplate = ({ data, accentColor }) => {   
    
    return (
        <div className="max-w-4xl mx-auto p-8 bg-white text-gray-800 font-sans shadow-lg">
            
            {/* Header: Name and Contact Info */}
            <header className="mb-4">
                <h1 className="text-3xl font-extrabold uppercase tracking-wide mb-1">
                    {data.personal_info?.full_name || "STELLA WALKER"}
                </h1>
                <h2 className="text-base font-semibold uppercase mb-2" style={{ color: accentColor }}>
                    {data.personal_info?.profession || ""}
                </h2>
                {renderHeaderContact()}
            </header>

            {/* Professional Summary */}
            {data.professional_summary && (
                <section>
                    <SectionHeader title="Professional Summary" />
                    <p className="text-sm text-gray-700 leading-relaxed py-1">
                        {data.professional_summary}
                    </p>
                </section>
            )}

            {/* Education */}
            {data.education && data.education.length > 0 && (
                <section>
                    <SectionHeader title="Education" />
                    <div className="space-y-3">
                        {data.education.map((edu, index) => (
                            <div key={index} className="pt-2">
                                <div className="flex justify-between items-start text-sm">
                                    <h3 className="font-bold text-gray-900">
                                        {edu.degree} {edu.field && ` - ${edu.field}`}
                                    </h3>
                                    <span className="text-sm text-gray-600 font-medium">
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


            {/* Experience */}
            {data.experience && data.experience.length > 0 && (
                <section>
                    <SectionHeader title="Experience" />
                    <div className="space-y-6">
                        {data.experience.map((exp, index) => (
                            <div key={index} className="pt-2">
                                <div className="flex justify-between items-start text-sm">
                                    <h3 className="font-bold text-gray-900">
                                        {exp.position}
                                    </h3>
                                    <span className="text-sm text-gray-600 font-medium">
                                        {formatDate(exp.start_date)} -{" "}
                                        {exp.is_current ? "Present" : formatDate(exp.end_date)}
                                    </span>
                                </div>
                                <p className="text-sm italic text-gray-700 mb-1">
                                    {exp.company} 
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

            {/* projects */}
            {data.project && data.project.length > 0 && (
                <section>
                    <SectionHeader title="Projects" />
                    <div className="space-y-1 pt-2">
                        {data.project.map((p, index) => (
                            <div key={index} className="pt-2">
                                <div className="flex justify-between items-start text-sm">
                                    <h3 className="font-bold text-gray-900">
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

            {/* Skills - Rendered in a grid/columns */}
            {data.skills && data.skills.length > 0 && (
                <section>
                    <SectionHeader title="Skills" />
                    <div className="grid grid-cols-3 gap-y-1 gap-x-4 text-sm text-gray-700 leading-relaxed py-1">
                        {data.skills.map((skill, index) => (
                            <div key={index} className="flex items-center">
                                <span className="font-semibold"> {skill}</span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Languages */}
                {data.languages && data.languages.length > 0 && (
                    <section>
                        <SectionHeader title="Languages" />
                        {/* 5. Languages: සිරස් අතට (flex-col) සකස් කරනු ලැබේ */}
                        <div className="space-y-1 pt-2 flex flex-wrap gap-x-6 gap-y-2 items-start">
                            {data.languages.map((lang, index) => (
                                <p key={index} className="text-sm text-gray-700 min-w-[45%]"> {/* min-w-[45%] helps with column layout on mobile */}
                                    • <span className="font-semibold">{lang.language}</span> - {lang.level}
                                </p>
                            ))}
                        </div>
                    </section>
                )}


            {/* References */}
            {data.references && data.references.length > 0 && (
                <section className="mb-6">
                    <SectionHeader title="References" />

                    {/* 6. References: Mobile වලදී සිරස් (flex-col), Desktop/Print වලදී තිරස් (md:flex-row print:flex-row), අයිතම 2කට සමාන පළල (w-1/2) */}
                    <div className="flex flex-col sm:flex-row print:flex-row justify-between items-start gap-6 sm:gap-8 text-sm text-gray-700 space-y-4 sm:space-y-0 print:space-y-0">
                        {data.references.map((ref, index) => (
                            <div key={index} className="w-full sm:w-[48%] print:w-[48%]">
                                <p className="font-bold">{ref.name}</p>
                                <p className="text-sm">{ref.title}</p>
                                <p className="text-sm">{ref.company}</p>
                                <p className="text-sm">{ref.contact}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}
            
        </div>
    );
}

export default SimpleModernTemplate;
