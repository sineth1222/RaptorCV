import { Mail, Phone, MapPin, Linkedin, Globe } from "lucide-react";

const ModernTemplate = ({ data, accentColor }) => {
    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const [year, month] = dateStr.split("-");
        // Check for valid date parts before creating Date object
        if (!year || !month) return dateStr; 

        return new Date(year, month - 1).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short"
        });
    };

    return (
        <div className="max-w-4xl mx-auto bg-white text-gray-800 leading-relaxed">
            {/* Header */}
            <header className="text-center pb-6 border-t-4 border-b-2 m-4 p-4" style={{ borderColor: accentColor }}>
                <h1 className="text-3xl font-bold mb-1" style={{ color: accentColor }}>
                    {data.personal_info?.full_name || "Your Name"}
                </h1>
                <p className="uppercase text-zinc-600 font-medium text-lg tracking-widest mb-3">
                    {data?.personal_info?.profession || ""}
                </p>

                {/* Contact Info - Responsive wrapping is already generally good here */}
                <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
                    {data.personal_info?.email && (
                        <div className="flex items-center gap-1">
                            <Mail className="size-4" />
                            <span>{data.personal_info.email}</span>
                        </div>
                    )}
                    {data.personal_info?.phone && (
                        <div className="flex items-center gap-1">
                            <Phone className="size-4" />
                            <span>{data.personal_info.phone}</span>
                        </div>
                    )}
                    {data.personal_info?.location && (
                        <div className="flex items-center gap-1">
                            <MapPin className="size-4" />
                            <span>{data.personal_info.location}</span>
                        </div>
                    )}
                    {data.personal_info?.linkedin && (
                        <a target="_blank" href={data.personal_info?.linkedin} className="flex items-center gap-1">
                            <Linkedin className="size-4" />
                            {data.personal_info.linkedin.replace(/(^\w+:|^)\/\//, '').replace(/\/$/, '') || 'LinkedIn'}
                        </a>
                    )}
                    {data.personal_info?.website && (
                        <a target="_blank" href={data.personal_info?.website} className="flex items-center gap-1">
                            <Globe className="size-4" />
                            {data.personal_info.website.replace(/(^\w+:|^)\/\//, '').replace(/\/$/, '') || 'Portfolio'}
                        </a>
                    )}
                </div>
            </header>

            <div className="p-4 sm:p-8"> {/* Mobile padding adjusted to p-4, sm:p-8 for better spacing */}
                {/* Professional Summary */}
                {data.professional_summary && (
                    <section className="mb-8">
                        <h2 className="text-2xl font-light mb-4 pb-2 border-b border-gray-200">
                            Professional Summary
                        </h2>
                        <p className="text-gray-700 ">{data.professional_summary}</p>
                    </section>
                )}

                {/* Experience */}
                {data.experience && data.experience.length > 0 && (
                    <section className="mb-8">
                        <h2 className="text-2xl font-light mb-6 pb-2 border-b border-gray-200">
                            Experience
                        </h2>

                        <div className="space-y-6">
                            {data.experience.map((exp, index) => (
                                <div key={index} className="relative pl-6 border-l border-gray-200">

                                    {/* 🌟 FIX 1: Use flex-col on mobile, flex-row on larger screens */}
                                    <div className="flex flex-col md:flex-row justify-between items-start mb-2">
                                        <div>
                                            <h3 className="text-xl font-medium text-gray-900">{exp.position}</h3>
                                            <p className="font-medium" style={{ color: accentColor }}>{exp.company}</p>
                                        </div>
                                        {/* Date/Duration container - pushes to the right on desktop, stays aligned left on mobile */}
                                        <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded mt-1 md:mt-0">
                                            {formatDate(exp.start_date)} - {exp.is_current ? "Present" : formatDate(exp.end_date)}
                                        </div>
                                    </div>

                                    {exp.description && (
                                        <div className="text-gray-700 leading-relaxed mt-3 whitespace-pre-line">
                                            {exp.description}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Projects */}
                {data.project && data.project.length > 0 && (
                    <section className="mb-8">
                        <h2 className="text-2xl font-light mb-4 pb-2 border-b border-gray-200">
                            Projects
                        </h2>

                        <div className="space-y-6">
                            {data.project.map((p, index) => (
                                <div key={index} className="relative pl-6 border-l border-gray-200" style={{borderLeftColor: accentColor}}>

                                    {/* 🌟 FIX 2: Use flex-col on mobile for title and type, if title is long */}
                                    <div className="flex flex-col sm:flex-row justify-between items-start">
                                        <div className="mb-1 sm:mb-0">
                                            <h3 className="text-lg font-medium text-gray-900">{p.name}</h3>
                                        </div>
                                        <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded">
                                            {p.type}
                                        </div>
                                    </div>

                                    {p.description && (
                                        <div className="text-gray-700 leading-relaxed text-sm mt-3">
                                            {p.description}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Grid for Education/Skills - Already uses sm:grid-cols-2 for tablet/desktop */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {/* Education */}
                    {data.education && data.education.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-light mb-4 pb-2 border-b border-gray-200">
                                Education
                            </h2>

                            <div className="space-y-4">
                                {data.education.map((edu, index) => (
                                    <div key={index}>
                                        <h3 className="font-semibold text-gray-900">
                                            {edu.degree} {edu.field && `in ${edu.field}`}
                                        </h3>
                                        <p style={{ color: accentColor }}>{edu.institution}</p>
                                        
                                        {/* 🌟 FIX 3: GPA and Date can wrap on extremely small screens but use flex for alignment */}
                                        <div className="flex justify-between items-center text-sm text-gray-600 flex-wrap">
                                            <span>{formatDate(edu.graduation_date)}</span>
                                            {edu.gpa && <span>GPA: {edu.gpa}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Skills */}
                    {data.skills && data.skills.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-light mb-4 pb-2 border-b border-gray-200">
                                Skills
                            </h2>

                            <div className="flex flex-wrap gap-2">
                                {data.skills.map((skill, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 text-sm text-white rounded-full"
                                        style={{ backgroundColor: accentColor }}
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </section>
                    )}
                </div>


                {/* Languages */}
                {data.languages && data.languages.length > 0 && (
                    <section className="mb-6">
                        <h2 className="text-2xl font-light mb-4 pb-2 border-b border-gray-200">
                            Languages  
                        </h2>

                        {/* 🌟 FIX 4: Use flex-wrap and add gap to ensure languages wrap and don't overlap */}
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
                        <h2 className="text-2xl font-light mb-4 pb-2 border-b border-gray-200">
                            References
                        </h2>

                        {/* 🌟 FIX 5: Use flex-col on mobile, flex-row on larger screens, add vertical spacing */}
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-8 text-sm text-gray-700 space-y-4 sm:space-y-0">
                            {data.references.map((ref, index) => (
                                <div key={index}>
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
        </div>
    );
}

export default ModernTemplate;