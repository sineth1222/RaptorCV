/* eslint-disable react-hooks/static-components */
/* eslint-disable no-irregular-whitespace */
import { Mail, Phone, MapPin, Linkedin, Globe } from "lucide-react";




const NaturalTemplate = ({ data, accentColor }) => {

    // Helper function to format dates
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
            month: "short"
        });
    };

    // Helper for rendering section headers for the main (right) column
    const RightSectionHeader = ({ title }) => (
        <h2
            className="uppercase text-xl font-bold pt-4 mb-3 tracking-wider border-b border-gray-300"
        >
            {title}
        </h2>
    );

    // Helper for rendering section headers for the left sidebar
    const LeftSectionHeader = ({ title }) => (
        <h3
            className="uppercase text-lg font-bold pt-6 mb-3 tracking-wider text-gray-800"
        >
            {title}
        </h3>
    );

    return (
        // 1. ප්‍රධාන Container එකේ පළල 'max-w-4xl' ලෙස සකස් කර ඇත.
        // මෙය A4 පිටුවක පෙනුමට වඩාත් ගැලපෙන අතර, print කිරීමේ ගැටළු අඩු කරයි.
        // 'print:max-w-full' මගින් print කරන විට සම්පූර්ණ පළල ලබා දෙයි.
        <div className="max-w-4xl mx-auto bg-white shadow-lg font-sans print:max-w-full">

            {/* 2. Header: Mobile වලදී image, name, profession, summary පිළිවෙලින් එකක් යටින් එකක් පෙන්වීමට වෙනස් කර ඇත. */}
            {/* Background color එක 'accentColor' භාවිතයෙන් header එකට එකතු කර ඇත. */}
            <header
                // ****************** මෙතන වෙනස්කම් කර ඇත ******************
                className="p-8 pb-4 flex flex-col items-center text-center gap-4 md:flex-row md:items-center md:text-left md:gap-6" 
                style={{
                    backgroundColor: accentColor + '30',
                    WebkitPrintColorAdjust: 'exact',
                    colorAdjust: 'exact'
                }}
            >
                {/* Image (Mobile වලදී උඩින්, Desktop වලදී වම් පැත්තේ) */}
                {data.personal_info?.image && (
                    <div className="shrink-0 mb-4 md:mb-0"> {/* Mobile වලදී පහලට පොඩි ඉඩක් එකතු කර ඇත */}
                        <img
                            src={data.personal_info.image}
                            alt="Profile"
                            className="w-28 h-28 object-cover rounded-full border-4 border-white shadow-md"
                        />
                    </div>
                )}

                {/* Full Name & Profession & Summary (Mobile වලදී Image එක යටින්, Desktop වලදී දකුණු පැත්තේ) */}
                <div className="grow">
                    <h1 className="text-4xl font-extrabold uppercase tracking-wide mb-1">
                        {data.personal_info?.full_name || ""}
                    </h1>
                    <p className="uppercase text-zinc-800 font-medium text-lg tracking-widest" style={{ color: accentColor }}>
                        {data?.personal_info?.profession || ""}
                    </p>
                    {/* Professional Summary එක header එක යටතට ගෙන ඒම */}
                    <p className="text-sm text-gray-700 leading-relaxed pt-3">
                        {data.professional_summary || "Highly motivated Software Engineer passionate about developing robust and scalable software solutions..."}
                    </p>
                </div>
            </header>

            {/* 3. Responsive Two-Column Layout සඳහා Grid භාවිතය */}
            {/* Mobile: 1 Column | Desktop (md+): 3 Columns (1/3 for aside, 2/3 for main) */}
            {/* Header එකේ background color එක ඉවත් කළ නිසා, aside එකේ color එකත් ඉවත් කර ඇත. */}
            <div className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3">

                {/* Left Sidebar (aside) - Mobile වලදී දෙවනුව පෙන්වයි, 1/3 පළල Desktop වලදී */}
                <aside
                    className="col-span-1 p-8 text-gray-800 order-2 md:order-0 print:order-0"
                    // පසුබිම් වර්ණය Header එකට ගෙන ගිය නිසා, මෙහි එය ඉවත් කර ඇත.
                    // එසේම, CV එකේ වම් පැත්තේ කොටස් වම් පැත්තේ පවතින පරිදි කේතය වෙනස් කර ඇත.
                    style={{
                        backgroundColor: '#f8f8f8', // සුළු අළු පැහැයක් sidebar එකට දමනු ලැබේ
                        WebkitPrintColorAdjust: 'exact',
                        colorAdjust: 'exact'
                    }}
                >

                    {/* Contact */}
                    <section className="mb-6 mt-0"> {/* mt-0 එකතු කර ඇත */}
                        <LeftSectionHeader title="Contact" />
                        <div className="space-y-3 text-sm font-medium">
                            {data.personal_info?.email && (
                                <div className="flex items-center gap-2">
                                    <Mail size={16} style={{ color: accentColor }} />
                                    <span className="break-all">{data.personal_info.email}</span>
                                </div>
                            )}
                            {data.personal_info?.phone && (
                                <div className="flex items-center gap-2">
                                    <Phone size={16} style={{ color: accentColor }} />
                                    <span>{data.personal_info.phone}</span>
                                </div>
                            )}
                            {data.personal_info?.location && (
                                <div className="flex items-start gap-2">
                                    <MapPin size={16} style={{ color: accentColor, marginTop: '2px' }} />
                                    <span>{data.personal_info.location}</span>
                                </div>
                            )}
                            {data.personal_info?.linkedin && (
                                <a
                                target="_blank"
                                href={data.personal_info.linkedin}
                                className="hover:text-blue-600 hover:underline flex items-center gap-2"
                                >
                                    <Linkedin size={16} style={{ color: accentColor, marginTop: '2px' }} />
                                    LinkedIn
                                </a>
                            )}
                            {data.personal_info?.website && (
                                <a target="_blank" href={data.personal_info?.website} className="flex items-center gap-2 hover:text-blue-600 hover:underline">
                                    <Globe size={16} style={{ color: accentColor, marginTop: '2px' }} />
                                    Protfolio
                                </a>
                            )}
                        </div>
                    </section>
                    
                    {/* Education - sidebar එකට ගෙන ඒම */}
                    {data.education && data.education.length > 0 && (
                        <section className="mb-6">
                            <LeftSectionHeader title="Education" />
                            <div className="space-y-4">
                                {data.education.map((edu, index) => (
                                    <div key={index} className="pb-1">
                                        <h3 className="font-bold text-gray-900 text-sm">
                                            {edu.degree} {edu.field && `in ${edu.field}`}
                                        </h3>
                                        <div className="text-xs text-gray-700">
                                            <p className="italic">{edu.institution}</p>
                                            <span className="font-medium">
                                                {formatDate(edu.start_date)} - {formatDate(edu.graduation_date)}
                                            </span>
                                        </div>
                                        {edu.gpa && <p className="text-xs text-gray-600">Grade: {edu.gpa}</p>}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}


                    {/* Skills */}
                    {data.skills && data.skills.length > 0 && (
                        <section className="mb-6">
                            <LeftSectionHeader title="Skills" />
                            {/* Skills Tag ආකාරයට පෙන්වීමට වෙනස් කර ඇත */}
                            <div className="flex flex-wrap gap-2 pt-2">
                                {data.skills.map((skill, index) => (
                                    <span key={index} className="px-3 py-1 text-xs font-semibold rounded-full bg-white shadow-sm border" style={{ borderColor: accentColor, color: accentColor }}>{skill}</span>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Languages */}
                    {data.languages && data.languages.length > 0 && (
                        <section>
                            <LeftSectionHeader title="Languages" />
                            <div className="space-y-1 pt-2 flex flex-wrap gap-x-6 gap-y-2 items-start">
                                {data.languages.map((lang, index) => (
                                    <p key={index} className="text-sm text-gray-700 min-w-[45%]">
                                        • <span className="font-semibold">{lang.language}</span> - {lang.level}
                                    </p>
                                ))}
                            </div>
                        </section>
                    )}
                    
                    {/* References */}
                    {data.references && data.references.length > 0 && (
                        <section className="mb-6">
                            <LeftSectionHeader title="References" />
                            <div className="space-y-4 text-sm text-gray-800">
                                {data.references.map((ref, index) => (
                                    <div key={index}>
                                        <p className="font-bold">{ref.name}</p>
                                        <p className="text-xs">{ref.title} - {ref.company}</p>
                                        <p className="text-xs">{ref.contact}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}


                </aside>

                {/* Right Content (main) - Mobile වලදී පළමුව පෙන්වයි, 2/3 පළල Desktop වලදී */}
                <main className="col-span-1 md:col-span-2 p-8 pt-4 order-1 md:order-0 print:order-0 print:col-span-2">

                    {/* Work Experience */}
                    {data.experience && data.experience.length > 0 && (
                        <section className="mb-6">
                            <RightSectionHeader title="Work Experience" />
                            <div className="space-y-6">
                                {data.experience.map((exp, index) => (
                                    <div key={index} className="pb-1">
                                        <div className="flex justify-between items-start text-sm mb-1">
                                            <h3 className="font-bold text-gray-900">
                                                {exp.position}
                                            </h3>
                                            <span className="text-sm text-gray-600 font-medium shrink-0 ml-4">
                                                {formatDate(exp.start_date)} - {exp.is_current ? "Present" : formatDate(exp.end_date)}
                                            </span>
                                        </div>
                                        <p className="text-sm italic text-gray-700 mb-2">
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

                    {/* project Experience */}
                    {data.project && data.project.length > 0 && (
                        <section className="mb-6">
                            <RightSectionHeader title="Projects" /> {/* 'Projects Experience' වෙනුවට 'Projects' යොදන්න */}
                            <div className="space-y-6">
                                {data.project.map((p, index) => (
                                    <div key={index} className="pb-1">
                                        <div className="flex justify-between items-start text-sm mb-1">
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


                </main>
            </div>
        </div>
    );
}

export default NaturalTemplate;