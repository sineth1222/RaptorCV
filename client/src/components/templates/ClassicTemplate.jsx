import { Mail, Phone, MapPin, Linkedin, Globe } from "lucide-react";

const ClassicTemplate = ({ data, accentColor }) => {
    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const [year, month] = dateStr.split("-");
        return new Date(year, month - 1).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short"
        });
    };

    return (
        <div className="max-w-4xl mx-auto p-8 bg-white text-gray-800 leading-relaxed">
            {/* Header */}
            <header className="text-center mb-8 pb-6 border-b-2" style={{ borderColor: accentColor }}>
                <h1 className="text-3xl font-bold mb-1" style={{ color: accentColor }}>
                    {data.personal_info?.full_name || "Your Name"}
                </h1>
                <p className="uppercase text-zinc-600 font-medium text-lg tracking-widest mb-3">
                        {data?.personal_info?.profession || ""}
                </p>

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

            {/* Professional Summary */}
            {data.professional_summary && (
                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-3" style={{ color: accentColor }}>
                        PROFESSIONAL SUMMARY
                    </h2>
                    <p className="text-gray-700 leading-relaxed">{data.professional_summary}</p>
                </section>
            )}

            {/* Experience */}
            {data.experience && data.experience.length > 0 && (
                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-4" style={{ color: accentColor }}>
                        PROFESSIONAL EXPERIENCE
                    </h2>

                    <div className="space-y-4">
                        {data.experience.map((exp, index) => (
                            <div key={index} className="border-l-3 pl-4" style={{ borderColor: accentColor }}>
                                <div className="flex flex-col md:flex-row justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{exp.position}</h3>
                                        <p className="text-gray-700 font-medium">{exp.company}</p>
                                    </div>
                                    <div className="text-left md:text-right text-sm text-gray-600 mt-1 md:mt-0">
                                        <p>{formatDate(exp.start_date)} - {exp.is_current ? "Present" : formatDate(exp.end_date)}</p>
                                    </div>
                                </div>
                                {exp.description && (
                                    <div className="text-gray-700 leading-relaxed whitespace-pre-line">
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
                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-4" style={{ color: accentColor }}>
                        PROJECTS
                    </h2>

                    <ul className="space-y-3 ">
                        {data.project.map((proj, index) => (
                            <div key={index} className="flex justify-between items-start border-l-3 border-gray-300 pl-6">
                                <div>
                                    <div className="flex flex-col sm:flex-row justify-start items-start gap-2">
                                        <li className="font-semibold text-gray-800 ">{proj.name}</li>
                                        <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded">
                                            {proj.type}
                                        </div>
                                    </div>
                                    <p className="text-gray-600">{proj.description}</p>
                                </div>
                            </div>
                        ))}
                    </ul>
                </section>
            )}

            {/* Education */}
            {data.education && data.education.length > 0 && (
                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-4" style={{ color: accentColor }}>
                        EDUCATION
                    </h2>

                    <div className="space-y-3">
                        {data.education.map((edu, index) => (
                            <div key={index} className="flex flex-col md:flex-row justify-between items-start">
                                <div>
                                    <h3 className="font-semibold text-gray-900">
                                        {edu.degree} {edu.field && `in ${edu.field}`}
                                    </h3>
                                    <p className="text-gray-700">{edu.institution}</p>
                                    {edu.gpa && <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>}
                                </div>
                                <div className="text-left md:text-right text-sm text-gray-600 mt-1 md:mt-0">
                                    <p>{formatDate(edu.graduation_date)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start gap-8">

            {/* Skills */}
            {data.skills && data.skills.length > 0 && (
                <section className="mb-6 w-full md:w-1/2">
                    <h2 className="text-xl font-semibold mb-4" style={{ color: accentColor }}>
                        CORE SKILLS
                    </h2>

                    <div className="flex gap-4 flex-wrap">
                        {data.skills.map((skill, index) => (
                            <div key={index} className="text-gray-700">
                                • {skill}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Lanuges */}
            {data.languages && data.languages.length > 0 && (
                <section className="mb-6 w-full md:w-1/2">
                    <h2 className="text-xl font-semibold mb-4" style={{ color: accentColor }}>
                        LANGUAGES    
                    </h2>

                    <div className="space-y-1 pt-2">
                                {data.languages.map((lang, index) => (
                                    <p key={index} className="text-sm text-gray-700">
                                        <span className="font-semibold">{lang.language}</span> - {lang.level}
                                    </p>
                                ))}
                            </div>
                </section>
            )}

            </div>

            {/* References */}
            {data.references && data.references.length > 0 && (
                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-4" style={{ color: accentColor }}>
                        REFERENCES
                    </h2>

                    <div className="flex flex-col md:flex-row print:flex-row justify-between items-start gap-8 text-sm text-gray-700 space-y-4 md:space-y-0 print:space-y-0">
                            {data.references.map((ref, index) => (
                                <div key={index} className="w-full md:w-[45%] print:w-[45%]">
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

export default ClassicTemplate;