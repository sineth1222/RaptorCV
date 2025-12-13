import { Mail, Phone, MapPin, Linkedin, Globe } from "lucide-react";

const MinimalImageTemplate = ({ data, accentColor }) => {
    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const [year, month] = dateStr.split("-");
        if (!year || !month) return dateStr; 

        return new Date(year, month - 1).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
        });
    };

    return (
        <div className="max-w-5xl mx-auto bg-white text-zinc-800 shadow-lg">
            
            {/* 1. ප්‍රධාන Grid එක: Display, Mobile, සහ PRINT සඳහා තීරු 3ක් යොදන්න */}
            {/* 'print:grid-cols-3' එකතු කර ඇත */}
            <div className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3">

                {/* Header/Image/Name Section - දැන් එය තීරු 3ම පුරා විහිදී ඇත */}
                {/* 'print:col-span-3' එකතු කර ඇත */}
                <div className="md:col-span-3 print:col-span-3 bg-white p-6 sm:p-10 border-b border-zinc-200">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                        {/* Image */}
                        {data.personal_info?.image && (
                            <div className="shrink-0 mx-auto sm:mx-0">
                                <img 
                                    src={
                                        typeof data.personal_info.image === 'string'
                                            ? data.personal_info.image
                                            : URL.createObjectURL(data.personal_info.image)
                                    } 
                                    alt="Profile" 
                                    className="w-28 h-28 sm:w-32 sm:h-32 object-cover rounded-full" 
                                    style={{ border: `4px solid ${accentColor}70` }} 
                                />
                            </div>
                        )}

                        {/* Name + Title */}
                        <div className="text-center sm:text-left">
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-700 tracking-wider mb-1">
                                {data.personal_info?.full_name || "Your Name"}
                            </h1>
                            <p className="uppercase text-zinc-600 font-medium text-sm sm:text-base tracking-widest">
                                {data?.personal_info?.profession || ""}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. Left Sidebar (Contact, Education, Skills, Languages) */}
                {/* 'print:col-span-1' සහ 'print:border-r' එකතු කර ඇත. order-2 Mobile First බැවින් Print View එකේදීත් Order එක නිවැරදි කිරීමට order-none තබයි. */}
                <aside className="md:col-span-1 border-r-0 md:border-r border-zinc-400 p-6 sm:p-8 bg-zinc-50 order-2 md:order-0 print:col-span-1 print:border-r print:order-0">
                    <div className="space-y-8">
                        
                        {/* Contact */}
                        <section>
                            <h2 className="text-sm font-semibold tracking-widest text-zinc-600 mb-3 border-b-2" style={{ borderColor: accentColor }}>
                                CONTACT
                            </h2>
                            <div className="space-y-2 text-sm">
                                {/* Contact Links/Details */}
                                {data.personal_info?.phone && (
                                    <div className="flex items-center gap-2">
                                        <Phone size={14} style={{ color: accentColor }} />
                                        <span>{data.personal_info.phone}</span>
                                    </div>
                                )}
                                {data.personal_info?.email && (
                                    <div className="flex items-center gap-2">
                                        <Mail size={14} style={{ color: accentColor }} />
                                        <span>{data.personal_info.email}</span>
                                    </div>
                                )}
                                {data.personal_info?.location && (
                                    <div className="flex items-center gap-2">
                                        <MapPin size={14} style={{ color: accentColor }} />
                                        <span>{data.personal_info.location}</span>
                                    </div>
                                )}
                                {data.personal_info?.linkedin && (
                                    <a 
                                        target="_blank" 
                                        href={data.personal_info.linkedin} 
                                        className="hover:text-blue-600 hover:underline flex items-center gap-2" 
                                    >
                                        <Linkedin size={14} style={{ color: accentColor }} />
                                        LinkedIn
                                    </a>
                                )}
                                {data.personal_info?.website && (
                                    <a target="_blank" href={data.personal_info?.website} className="flex items-center gap-2 hover:text-blue-600 hover:underline">
                                        <Globe size={14} style={{ color: accentColor }} />
                                        Portfolio
                                    </a>
                                )}
                            </div>
                        </section>

                        {/* Education */}
                        {data.education && data.education.length > 0 && (
                            <section>
                                <h2 className="text-sm font-semibold tracking-widest text-zinc-600 mb-3 border-b-2" style={{ borderColor: accentColor }}>
                                    EDUCATION
                                </h2>
                                <div className="space-y-4 text-sm">
                                    {data.education.map((edu, index) => (
                                        <div key={index}>
                                            <p className="font-semibold uppercase">{edu.degree}</p>
                                            <p className="text-zinc-600">{edu.institution}</p>
                                            <p className="text-xs text-zinc-500">
                                                {formatDate(edu.graduation_date)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Skills */}
                        {data.skills && data.skills.length > 0 && (
                            <section>
                                <h2 className="text-sm font-semibold tracking-widest text-zinc-600 mb-3 border-b-2" style={{ borderColor: accentColor }}>
                                    SKILLS
                                </h2>
                                <div className="flex flex-wrap gap-2 text-sm">
                                    {data.skills.map((skill, index) => (
                                        <span key={index} className="px-2 py-0.5 border border-zinc-300 rounded-md bg-white">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Languages */}
                        {data.languages && data.languages.length > 0 && (
                            <section>
                                <h2 className="text-sm font-semibold tracking-widest text-zinc-600 mb-3 border-b-2" style={{ borderColor: accentColor }}>
                                    LANGUAGES 
                                </h2>
                                <div className="space-y-1 pt-2">
                                    {data.languages.map((lang, index) => (
                                        <p key={index} className="text-sm text-gray-700">
                                            • <span className="font-semibold">{lang.language}</span> - {lang.level}
                                        </p>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                </aside>

                {/* 3. Right Content (Summary, Experience, Projects, References) */}
                {/* 'print:col-span-2' එකතු කර ඇත. order-1 Mobile First බැවින් Print View එකේදීත් Order එක නිවැරදි කිරීමට order-none තබයි. */}
                <main className="md:col-span-2 p-6 sm:p-8 order-1 md:order-0 print:col-span-2 print:order-0">

                    {/* Summary */}
                    {data.professional_summary && (
                        <section className="mb-8">
                            <h2 className="text-sm font-semibold tracking-widest mb-3 border-b" style={{ color: accentColor, borderColor: accentColor }}>
                                SUMMARY
                            </h2>
                            <p className="text-zinc-700 leading-relaxed text-sm">
                                {data.professional_summary}
                            </p>
                        </section>
                    )}

                    {/* Experience */}
                    {data.experience && data.experience.length > 0 && (
                        <section className="mb-8">
                            <h2 className="text-sm font-semibold tracking-widest mb-4 border-b" style={{ color: accentColor, borderColor: accentColor }}>
                                EXPERIENCE
                            </h2>
                            <div className="space-y-6 mb-8">
                                {data.experience.map((exp, index) => (
                                    <div key={index}>
                                        <div className="flex flex-col sm:flex-row justify-between items-start">
                                            <h3 className="font-semibold text-zinc-900 leading-tight">
                                                {exp.position}
                                            </h3>
                                            <span className="text-xs text-zinc-500 shrink-0 mt-1 sm:mt-0">
                                                {formatDate(exp.start_date)} -{" "}
                                                {exp.is_current ? "Present" : formatDate(exp.end_date)}
                                            </span>
                                        </div>
                                        <p className="text-sm mb-2" style={{ color: accentColor }} >
                                            {exp.company}
                                        </p>
                                        {exp.description && (
                                            <ul className="list-disc list-inside text-sm text-zinc-700 leading-relaxed space-y-1 ml-4">
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

                    {/* Projects */}
                    {data.project && data.project.length > 0 && (
                        <section className="mb-8">
                            <h2 className="text-sm uppercase tracking-widest font-semibold mb-4 border-b" style={{ color: accentColor, borderColor: accentColor }}>
                                PROJECTS
                            </h2>
                            <div className="space-y-6">
                                {data.project.map((project, index) => (
                                    <div key={index}>
                                        <h3 className="text-md font-semibold text-zinc-800 leading-tight">{project.name}</h3>
                                        <p className="text-sm mb-1" style={{ color: accentColor }} >
                                            {project.type}
                                        </p>
                                        {project.description && (
                                            <ul className="list-disc list-inside text-sm text-zinc-700 space-y-1 ml-4">
                                                {project.description.split("\n").map((line, i) => (
                                                    <li key={i}>{line}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* References */}
                    {data.references && data.references.length > 0 && (
                        <section className="mb-6">
                            <h2 className="text-sm uppercase tracking-widest font-semibold mb-4 border-b" style={{ color: accentColor, borderColor: accentColor }}>
                                REFERENCES
                            </h2>

                            <div className="flex flex-col sm:flex-row flex-wrap justify-between items-start gap-6 text-sm text-gray-700">
                                {data.references.map((ref, index) => (
                                    <div key={index} className="w-full sm:w-1/2 md:w-5/12">
                                        <p className="font-bold">{ref.name}</p>
                                        <p className="text-sm">{ref.title}</p>
                                        <p className="text-sm">{ref.company}</p>
                                        <p className="text-sm">{ref.contact}</p>
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

export default MinimalImageTemplate;