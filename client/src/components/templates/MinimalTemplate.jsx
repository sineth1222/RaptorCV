import { Mail, Phone, MapPin, Linkedin, Globe } from "lucide-react";

const MinimalTemplate = ({ data, accentColor }) => {
    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const [year, month] = dateStr.split("-");
        // දෝෂයක් ඇත්නම්, මුල් string එකම ආපසු ලබා දෙයි
        if (!year || !month) return dateStr;
        
        return new Date(year, month - 1).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short"
        });
    };

    return (
        // 1. Container padding: Mobile සඳහා අඩු padding (p-4), Desktop සඳහා වැඩි padding (sm:p-8)
        <div className="max-w-4xl mx-auto p-4 sm:p-8 bg-white text-gray-900 font-light">
            {/* Header */}
            <header className="mb-8 sm:mb-10">
                <h1 className="text-3xl sm:text-4xl font-thin mb-2 tracking-wide flex justify-center items-center text-center">
                    {data.personal_info?.full_name || "Your Name"}
                </h1>
                <p className="uppercase text-zinc-600 font-medium text-sm tracking-widest mb-4 flex justify-center items-center text-center">
                    {data?.personal_info?.profession || ""}
                </p>

                {/* Contact Info: Mobile වලදී අවශ්‍ය නම් wrap වේ, නමුත් මධ්‍යගතව පෙන්වයි */}
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs sm:text-sm text-gray-600">
                    {data.personal_info?.email && (
                        <div className="flex items-center gap-1">
                            <Mail className="size-3 sm:size-4" />
                            <span>{data.personal_info.email}</span>
                        </div>
                    )}
                    {data.personal_info?.phone && (
                        <div className="flex items-center gap-1">
                            <Phone className="size-3 sm:size-4" />
                            <span>{data.personal_info.phone}</span>
                        </div>
                    )}
                    {data.personal_info?.location && (
                        <div className="flex items-center gap-1">
                            <MapPin className="size-3 sm:size-4" />
                            <span>{data.personal_info.location}</span>
                        </div>
                    )}
                    {data.personal_info?.linkedin && (
                        <a target="_blank" href={data.personal_info?.linkedin} className="flex items-center gap-1">
                            <Linkedin className="size-3 sm:size-4" />
                            LinkedIn
                        </a>
                    )}
                    {data.personal_info?.website && (
                        <a target="_blank" href={data.personal_info?.website} className="flex items-center gap-1">
                            <Globe className="size-3 sm:size-4" />
                            Portfolio
                        </a>
                    )}
                </div>
            </header>

            {/* Professional Summary */}
            {data.professional_summary && (
                <section className="mb-8 sm:mb-10">
                    <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                        {data.professional_summary}
                    </p>
                </section>
            )}

            {/* Experience */}
            {data.experience && data.experience.length > 0 && (
                <section className="mb-8 sm:mb-10">
                    <h2 className="text-sm uppercase tracking-widest mb-4 font-medium border-b pb-1" style={{ color: accentColor, borderColor: accentColor }}>
                        Experience
                    </h2>

                    <div className="space-y-6">
                        {data.experience.map((exp, index) => (
                            <div key={index}>
                                {/* 2. Experience: Mobile වලදී සිරස් (flex-col), Desktop/Print වලදී තිරස් (md:flex-row print:flex-row) */}
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-baseline mb-1">
                                    <h3 className="text-base font-medium">{exp.position}</h3>
                                    <span className="text-xs sm:text-sm text-gray-500 shrink-0">
                                        {formatDate(exp.start_date)} - {exp.is_current ? "Present" : formatDate(exp.end_date)}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-1">{exp.company}</p>
                                {exp.description && (
                                    <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
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
                <section className="mb-8 sm:mb-10">
                    <h2 className="text-sm uppercase tracking-widest mb-4 font-medium border-b pb-1" style={{ color: accentColor, borderColor: accentColor }}>
                        Projects
                    </h2>

                    <div className="space-y-4">
                        {data.project.map((proj, index) => (
                            <div key={index}>
                                {/* 3. Projects: Mobile වලදී සිරස් (flex-col) */}
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                                    <h3 className="text-base font-medium grow">{proj.name}</h3>
                                    <div className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded shrink-0">
                                        {proj.type}
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{proj.description}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Education */}
            {data.education && data.education.length > 0 && (
                <section className="mb-8 sm:mb-10">
                    <h2 className="text-sm uppercase tracking-widest mb-4 font-medium border-b pb-1" style={{ color: accentColor, borderColor: accentColor }}>
                        Education
                    </h2>

                    <div className="space-y-4">
                        {data.education.map((edu, index) => (
                            <div key={index}>
                                {/* Education: Mobile වලදී සිරස් (flex-col) */}
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-baseline">
                                    <h3 className="font-medium text-base">
                                        {edu.degree} {edu.field && `in ${edu.field}`}
                                    </h3>
                                    <span className="text-xs sm:text-sm text-gray-500 shrink-0">
                                        {formatDate(edu.graduation_date)}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600">{edu.institution}</p>
                                {edu.gpa && <p className="text-xs text-gray-500">GPA: {edu.gpa}</p>}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Skills & Languages - තීරු දෙකේ Layout එකක් සඳහා Grid එකක් හෝ Flex container එකක් යොදනු ලැබේ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-8 mb-8 sm:mb-10">

                {/* Skills */}
                {data.skills && data.skills.length > 0 && (
                    <section>
                        <h2 className="text-sm uppercase tracking-widest mb-4 font-medium border-b pb-1" style={{ color: accentColor, borderColor: accentColor }}>
                            Skills
                        </h2>
                        {/* 4. Skills: Mobile වලදී ගැලපෙන පරිදි කුඩා gap (gap-x-4) */}
                        <div className="text-sm text-gray-700 flex flex-wrap gap-x-4 gap-y-1">
                            {data.skills.map((skill, index) => (
                                <span key={index} className="whitespace-nowrap">
                                    {index > 0 && '• '} {skill}
                                </span>
                            ))}
                        </div>
                    </section>
                )}

                {/* Languages */}
                {data.languages && data.languages.length > 0 && (
                    <section>
                        <h2 className="text-sm uppercase tracking-widest mb-4 font-medium border-b pb-1" style={{ color: accentColor, borderColor: accentColor }}>
                            Languages
                        </h2>
                        {/* 5. Languages: සිරස් අතට (flex-col) සකස් කරනු ලැබේ */}
                        <div className="space-y-1 pt-1 flex flex-col">
                            {data.languages.map((lang, index) => (
                                <p key={index} className="text-sm text-gray-700">
                                    • <span className="font-semibold">{lang.language}</span> - {lang.level}
                                </p>
                            ))}
                        </div>
                    </section>
                )}
            </div>


            {/* References */}
            {data.references && data.references.length > 0 && (
                <section className="mb-6">
                    <h2 className="text-sm uppercase tracking-widest mb-4 font-medium border-b pb-1" style={{ color: accentColor, borderColor: accentColor }}>
                        REFERENCES
                    </h2>

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

export default MinimalTemplate;