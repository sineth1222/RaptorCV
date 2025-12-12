import imagekit from "../configs/imageKit.js";
import Resume from "../models/Resume.js";
import fs from "fs"
//import puppeteer from 'puppeteer';
import puppeteer from 'puppeteer-core'; // <-- puppeteer-core භාවිතා කරන්න
import chromium from '@sparticuz/chromium';



// controller for creating new resum
//POST : /api/resumes/create
export const createResume = async (req, res) => {
    try {
        const userId = req.userId;

        const {title} = req.body;

        //create new resume
        const newResume = await Resume.create({userId: userId, title: title})

        //return success massage
        return res.status(201).json({message: 'Resume created successfully', resume: newResume})

    } catch (error) {
        return res.status(400).json({message: error.message})
    }
}



//deletresume
//DELETE: /api/resumes/delete
export const deleteResume = async (req, res) => {
    try {
        const userId = req.userId;

        const {resumeId} = req.params;

        await Resume.findOneAndDelete({userId, _id: resumeId})
        return res.status(200).json({message: 'Resume deleted successfully'})

    } catch (error) {
        return res.status(400).json({message: error.message})
    }
}


//get user resume by id
//GET: /api/resumes/get
export const getResumeById = async (req, res) => {
    try {
        const userId = req.userId;
        const {resumeId} = req.params;

        const resume = await Resume.findOne({userId, _id: resumeId})

        if(!resume){
            return res.status(404).json({message: 'Resume not found'})
        }

        resume.__v = undefined;
        resume.createdAt = undefined;
        resume.updatedAt = undefined;

        return res.status(200).json({resume})

    } catch (error) {
        return res.status(400).json({message: error.message})
    }
}



//get resume by id public
//GET: /api/resumes/public
export const getPublicResumeById = async (req, res) => {
    try {
        const { resumeId } = req.params;
        const resume = await Resume.findOne({public: true, _id: resumeId})

        if(!resume){
            return res.status(404).json({message: 'Resume not found'})
        }

        return res.status(200).json({resume})

    } catch (error) {
        return res.status(400).json({message: error.message})
    }
}



//update resume
//PUT: /api/resumes/update
export const updateResume = async (req, res) => {
    try {
        const userId = req.userId;
        const {resumeId, resumeData, removeBackground} = req.body
        const image = req.file;

        //let resumeDataCopy = JSON.parse(JSON.stringify(resumeData));

        let resumeDataCopy;
        if (typeof resumeData === 'string'){
            resumeDataCopy = await JSON.parse(resumeData)
        } else {
            resumeDataCopy = structuredClone(resumeData)
        }

        if(image){
            const imageBufferData = fs.createReadStream(image.path)
            const response = await imagekit.files.upload({
            file: imageBufferData,
            fileName: 'resume.png',
            folder: 'user-resumes',
            transformation: {
                pre: 'w-300,h-300,fo-face,z-0.75' + (removeBackground === 'yes' ? ',e-bgremove' : '')
            }
            });

            resumeDataCopy.personal_info.image = response.url
        }

        const resume = await Resume.findByIdAndUpdate({userId: userId, _id: resumeId}, resumeDataCopy, {new: true})

        if(!resume) {
        // Resume එක සොයා ගැනීමට හෝ update කිරීමට නොහැකි නම්, 404 Response එකක් යවන්න
        return res.status(404).json({message: 'Resume not found or unauthorized to update.'});
        }

        return res.status(200).json({message: 'Saved successfully', resume})

        
    } catch (error) {
    // 🛑 CRITICAL FIX: දෝෂයක් ඇත්නම්, Response එක ආපසු යවන්න
    console.error("Update Resume Error:", error);
    return res.status(500).json({message: 'Failed to update resume due to a server error.'});

    } finally {
        // 🧹 තාවකාලික ගොනුව මකන්න (දෝෂයක් තිබුණත් නැතත්)
        const image = req.file; // image variable එක නැවතත් define කර ගන්න (හෝ function එකේ ඉහළින්ම define කරන්න)
        if (image && image.path) {
            fs.unlink(image.path, (err) => {
                if (err) console.error("Error deleting temp file:", err);
            });
        }
    } 
}




// GET: /api/resumes/download/:resumeId
export const downloadResume = async (req, res) => {
    let browser = null;

    try {
        const userId = req.userId;
        const { resumeId } = req.params;

        // 1. Resume දත්ත ලබා ගැනීම
        const resume = await Resume.findOne({ userId, _id: resumeId });

        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }
        
        const resumeData = resume.toObject();
        
        const htmlContent = generateResumeHtml(resumeData);
        // 

        // 3. Puppeteer භාවිතයෙන් PDF ජනනය කිරීම
        browser = await puppeteer.launch({ 
            // Vercel මත අවශ්‍ය වන නිවැරදි Arguments සැකසීම
            args: [
                ...chromium.args, // @sparticuz/chromium හි recommended args
                '--single-process', // Memory භාවිතය අඩු කිරීමට
                '--no-sandbox', // Cloud environments සඳහා අනිවාර්යය
                '--disable-setuid-sandbox'
            ],
            // Chromium binary එකේ path එක ගතිකව (dynamically) ලබා ගනී
            executablePath: await chromium.executablePath(),
            headless: chromium.headless, // true ලෙස සැකසීම
        }); // Production servers සඳහා 'args' වැදගත් වේ
        const page = await browser.newPage();
        
        // HTML එක Load කරන්න
        await page.setContent(htmlContent, {
            waitUntil: 'networkidle0', // සියලුම images/fonts load වනතුරු රැඳී සිටින්න
        });
        
        // PDF ගොනුව Buffer එකකට ජනනය කරන්න
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true, // Background colors/images print කිරීමට
            margin: {
                top: '0mm',
                right: '0mm',
                bottom: '0mm',
                left: '0mm',
            }
        });

        // 4. Client-Side එකට PDF ගොනුව යැවීම
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${resumeData.title || 'Resume'}.pdf"`);
        // පිටපත් කළ හැකි පෙළ සහිත PDF එක මේ හරහා Client වෙත යවනු ලැබේ
        return res.send(pdfBuffer);

    } catch (error) {
        console.error("Download Resume Error:", error);
        return res.status(500).json({ message: 'Failed to generate PDF due to a server error.' });
    } finally {
        // 5. Browser එක වසන්න
        if (browser !== null) {
            await browser.close();
        }
    }
};


// =================================================================
// 📢 උපකාරක ශ්‍රිතය (Helper Function) - Back-End File
// =================================================================

/**
 * Resume දත්ත JSON Object එකක් ලබාගෙන, එය HTML string එකක් ලෙස ආපසු ලබා දේ.
 * මෙහිදී තෝරාගත් Template එකට අදාළ HTML සහ Styles ජනනය කළ යුතුය.
 * * @param {object} data - MongoDB එකෙන් ලබා ගත් සම්පූර්ණ Resume දත්ත
 * @returns {string} - සම්පූර්ණ HTML Document එක (Styles සහිතව)
 */
const generateResumeHtml = (data) => {
    
    // Resume දත්ත නිස්සාරණය
    const templateId = data.template;
    const accentColor = data.accent_color || '#3B82F6'; 
    
    let resumeBodyHtml = ''; // Template එකේ ප්‍රධාන HTML අන්තර්ගතය
    let templateStyles = ''; // Template එකට විශේෂ වූ CSS Styles
    
    // Front-End එකේ ResumePreview.jsx හි ඇති Logic එකට අනුව Template එක තෝරා ගැනීම
    switch (templateId) {
        case "modern":
            // 🛑 මෙහිදී ModernTemplate.jsx හි JSX කේතය HTML බවට පරිවර්තනය කර ඇතුළත් කළ යුතුය.
            // Modern Template හි HTML/CSS/දත්ත-බන්ධන Logic මෙහි ඇතුළත් කරන්න.
            resumeBodyHtml = getModernTemplateHtml(data, accentColor);
            break;
            
        case "minimal":
            // 🛑 MinimalTemplate.jsx හි HTML/CSS/දත්ත-බන්ධන Logic මෙහි ඇතුළත් කරන්න.
            resumeBodyHtml = getMinimalTemplateHtml(data, accentColor);
            break;
            
        case "minimal-image":
            // 🛑 MinimalImageTemplate.jsx හි HTML/CSS/දත්ත-බන්ධන Logic මෙහි ඇතුළත් කරන්න.
            resumeBodyHtml = getMinimalImageTemplateHtml(data, accentColor);
            break;

        case "simple-modern":
             // 🛑 SimpleModernTemplate.jsx හි HTML/CSS/දත්ත-බන්ධන Logic මෙහි ඇතුළත් කරන්න.
            resumeBodyHtml = getSimpleModernTemplateHtml(data, accentColor);
            break;

        case "traditional":
            // 🛑 TraditionalResumeTempalte.jsx හි HTML/CSS/දත්ත-බන්ධන Logic මෙහි ඇතුළත් කරන්න.
            resumeBodyHtml = getTraditionalTemplateHtml(data, accentColor);
            break;
            
        case "natural":
            // 🛑 NaturalTemplate.jsx හි HTML/CSS/දත්ත-බන්ධන Logic මෙහි ඇතුළත් කරන්න.
            resumeBodyHtml = getNaturalTemplateHtml(data, accentColor);
            break;
            
        case "strong":
            // 🛑 StrongTemplate.jsx හි HTML/CSS/දත්ත-බන්ධන Logic මෙහි ඇතුළත් කරන්න.
            resumeBodyHtml = getStrongTemplateHtml(data, accentColor);
            break;
            
        case "professional":
            // 🛑 ProfetionalTemplate.jsx හි HTML/CSS/දත්ත-බන්ධන Logic මෙහි ඇතුළත් කරන්න.
            resumeBodyHtml = getProfessionalTemplateHtml(data, accentColor);
            break;
            
        case "official": // Front-End එකේ ModernSidebarTemplate එකට mapping වේ
             // 🛑 ProfessionalImagetemplate.jsx හි HTML/CSS/දත්ත-බන්ධන Logic මෙහි ඇතුළත් කරන්න.
            resumeBodyHtml = getOfficialTemplateHtml(data, accentColor);
            break;
            
        case "mordern-image":
            // 🛑 MordernImageTemplate.jsx හි HTML/CSS/දත්ත-බන්ධන Logic මෙහි ඇතුළත් කරන්න.
            resumeBodyHtml = getMordernImageTemplateHtml(data, accentColor);
            break;
            
        case "mordern-image-new": // Front-End එකේ ImageAccurateTemplate එකට mapping වේ
            // 🛑 MordernImageNewTemplate.jsx හි HTML/CSS/දත්ත-බන්ධන Logic මෙහි ඇතුළත් කරන්න.
            resumeBodyHtml = getImageAccurateTemplateHtml(data, accentColor);
            break;
            
        case "calm-sidebar":
            // 🛑 CalmSidebarTemplate.jsx හි HTML/CSS/දත්ත-බන්ධන Logic මෙහි ඇතුළත් කරන්න.
            resumeBodyHtml = getCalmSidebarTemplateHtml(data, accentColor);
            break;

        case "classic":
        default:
            // 🛑 ClassicTemplate.jsx හි HTML/CSS/දත්ත-බන්ධන Logic මෙහි ඇතුළත් කරන්න.
            resumeBodyHtml = getClassicTemplateHtml(data, accentColor);
            break;
    }
    
    // 🌐 Base Styles (සියලු Templates සඳහා පොදු වන)
    const baseStyle = `
        <style>
            /* Reset සහ පොදු Styles */
            body { 
                font-family: Arial, sans-serif; 
                margin: 0; 
                padding: 0; 
                color: #333;
                font-size: 10pt; /* Small font size for a professional look */
            }
            .container { 
                max-width: 8.5in; /* Letter size width */
                min-height: 11in; /* Letter size height */
                margin: 0 auto;
                background: white;
            }
            /* Puppeteer මගින් A4/Letter ප්‍රමාණයට හරවන නිසා, ඔබගේ template එකේ ඇති
            සියලුම Tailwind පන්ති වලට අදාළ CSS Styles මෙහි අනිවාර්යයෙන්ම ඇතුළත් කරන්න! */
            /* උදාහරණ: */
            .text-xl { font-size: 1.25rem; }
            .font-bold { font-weight: 700; }
            .mb-4 { margin-bottom: 1rem; }
            .p-8 { padding: 2rem; }
            /*... අනෙකුත් සියලුම Tailwind CSS Classes මෙහි අතින් හෝ Script එකක් මගින් ජනනය කර ඇතුලත් කළ යුතුය. ...*/
            
            /* Print Media Query - PDF Generation සඳහා අදාළ නොවේ, නමුත් අත්‍යවශ්‍ය නම් එක් කරන්න. */
        </style>
    `;

    // සම්පූර්ණ HTML Document එක ආපසු ලබා දීම
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${data.title || 'Resume'}</title>
            ${baseStyle}
            ${templateStyles} </head>
        <body>
            <div class="container">
                ${resumeBodyHtml}
            </div>
        </body>
        </html>
    `;
};


// Back-End Controller File එකේදී:

// =================================================================
// 📢 Helper Functions (Assistants for generateResumeHtml)
// =================================================================



/**
 * Classic Template සඳහා HTML අන්තර්ගතය ජනනය කරයි.
 * @param {object} data - සම්පූර්ණ Resume දත්ත වස්තුව
 * @param {string} accentColor - තෝරාගත් වර්ණය (e.g., '#3b82f6')
 * @returns {string} - Styled HTML string
 */
const getClassicTemplateHtml = (data, accentColor) => {

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const [year, month] = dateStr.split("-");
        return new Date(year, month - 1).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short"
        });
    };


    const personalInfo = data.personal_info || {};
    const summary = data.professional_summary;
    const experience = data.experience || [];
    const projects = data.project || [];
    const education = data.education || [];
    const skills = data.skills || [];
    const languages = data.languages || [];
    const references = data.references || [];
    
    // =================================================================
    // 🛠️ HTML Markup Generation Sections
    // =================================================================

    // 1. Header Section
    const headerHtml = `
        <header style="text-align: center; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 2px solid; border-color: ${accentColor};">
            <h1 style="font-size: 2.25rem; font-weight: 700; margin-bottom: 4px; color: ${accentColor};">
                ${personalInfo.full_name || "Your Name"}
            </h1>
            <p style="text-transform: uppercase; color: #525252; font-weight: 500; font-size: 1.125rem; letter-spacing: 0.1em; margin-bottom: 12px;">
                ${personalInfo.profession || ""}
            </p>

            <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 16px; font-size: 0.875rem; color: #525252; margin-top: 12px;">
                
                ${personalInfo.email ? `
                    <div style="display: flex; align-items: center; gap: 4px;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#525252" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: -2px;">
                            <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.83 1.83 0 0 1-2.06 0L2 7" />
                        </svg>
                        <span>${personalInfo.email}</span>
                    </div>
                ` : ''}
                
                ${personalInfo.phone ? `
                    <div style="display: flex; align-items: center; gap: 4px;">
                        <img width="16" height="16" src="https://img.icons8.com/ios/50/phone--v1.png" alt="phone--v1"/>
                        <span>${personalInfo.phone}</span>
                    </div>
                ` : ''}
                
                ${personalInfo.location ? `
                    <div style="display: flex; align-items: center; gap: 4px;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#525252" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: -2px;">
                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
                        </svg>
                        <span>${personalInfo.location}</span>
                    </div>
                ` : ''}
                
                ${personalInfo.linkedin ? `
                    <a target="_blank" href="${personalInfo.linkedin}" style="display: flex; align-items: center; gap: 4px; color: inherit; text-decoration: none; word-break: break-all;">
                        <img width="16" height="16" src="https://img.icons8.com/ios/50/linkedin.png" alt="linkedin"/>
                        <span style="word-break: break-all;">LinkedIn</span>
                    </a>
                ` : ''}
                
                ${personalInfo.website ? `
                    <a target="_blank" href="${personalInfo.website}" style="display: flex; align-items: center; gap: 4px; color: inherit; text-decoration: none; word-break: break-all;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#525252" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: -2px;">
                            <circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" />
                        </svg>
                        <span style="word-break: break-all;">Portfolio</span>
                    </a>
                ` : ''}
            </div>
        </header>
    `;

    // 2. Summary Section
    const summaryHtml = summary ? `
        <section style="margin-bottom: 24px;">
            <h2 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 12px; color: ${accentColor}; border-bottom: 1px solid #ccc; padding-bottom: 4px;">
                PROFESSIONAL SUMMARY
            </h2>
            <p style="color: #4b5563; line-height: 1.6;">${summary}</p>
        </section>
    ` : '';

    // 3. Experience Section
    const experienceHtml = experience.length > 0 ? `
        <section style="margin-bottom: 24px;">
            <h2 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 16px; color: ${accentColor}; border-bottom: 1px solid #ccc; padding-bottom: 4px;">
                PROFESSIONAL EXPERIENCE
            </h2>

            <div style="display: flex; flex-direction: column; gap: 16px;">
                ${experience.map(exp => `
                    <div style="border-left: 3px solid; padding-left: 16px; border-color: ${accentColor};">
                        <div style="display: flex; flex-direction: column; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                            <div style="width: 100%;">
                                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                                    <h3 style="font-weight: 600; color: #1f2937; margin: 0; font-size: 1rem;">${exp.position}</h3>
                                    <div style="text-align: right; font-size: 0.875rem; color: #52525b;">
                                        <p style="margin: 0;">${formatDate(exp.start_date)} - ${exp.is_current ? "Present" : formatDate(exp.end_date)}</p>
                                    </div>
                                </div>
                                <p style="color: #4b5563; font-weight: 500; margin: 0; font-size: 0.9375rem;">${exp.company}</p>
                            </div>
                        </div>
                        ${exp.description ? `
                            <div style="color: #4b5563; line-height: 1.6; white-space: pre-line; margin-top: 4px; font-size: 0.9375rem;">
                                ${exp.description}
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        </section>
    ` : '';

    // 4. Projects Section
    const projectsHtml = projects.length > 0 ? `
        <section style="margin-bottom: 24px;">
            <h2 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 16px; color: ${accentColor}; border-bottom: 1px solid #ccc; padding-bottom: 4px;">
                PROJECTS
            </h2>

            <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px;">
                ${projects.map(proj => `
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; border-left: 3px solid #d1d5db; padding-left: 16px;">
                        <div>
                            <div style="display: flex; flex-direction: row; justify-content: flex-start; align-items: center; gap: 8px;">
                                <li style="font-weight: 600; color: #1f2937; margin: 0; font-size: 1rem;">${proj.name}</li>
                                <div style="font-size: 0.8125rem; color: #52525b; background-color: #f3f4f6; padding: 2px 8px; border-radius: 4px;">
                                    ${proj.type}
                                </div>
                            </div>
                            <p style="color: #4b5563; margin-top: 4px; font-size: 0.9375rem;">${proj.description}</p>
                        </div>
                    </div>
                `).join('')}
            </ul>
        </section>
    ` : '';

    // 5. Education Section
    const educationHtml = education.length > 0 ? `
        <section style="margin-bottom: 24px;">
            <h2 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 16px; color: ${accentColor}; border-bottom: 1px solid #ccc; padding-bottom: 4px;">
                EDUCATION
            </h2>

            <div style="display: flex; flex-direction: column; gap: 12px;">
                ${education.map(edu => `
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div>
                            <h3 style="font-weight: 600; color: #1f2937; margin: 0; font-size: 1rem;">
                                ${edu.degree} ${edu.field ? `in ${edu.field}` : ''}
                            </h3>
                            <p style="color: #4b5563; margin: 0; font-size: 0.9375rem;">${edu.institution}</p>
                            ${edu.gpa ? `<p style="font-size: 0.875rem; color: #52525b; margin: 0;">GPA: ${edu.gpa}</p>` : ''}
                        </div>
                        <div style="text-align: right; font-size: 0.875rem; color: #52525b;">
                            <p style="margin: 0;">${formatDate(edu.graduation_date)}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        </section>
    ` : '';

    // 6 & 7. Skills and Languages Section (Side-by-side layout)
    const skillsAndLanguagesHtml = (skills.length > 0 || languages.length > 0) ? `
        <div style="display: flex; flex-direction: row; justify-content: space-between; align-items: flex-start; gap: 32px;">

            ${skills.length > 0 ? `
                <section style="margin-bottom: 24px; width: 50%;">
                    <h2 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 16px; color: ${accentColor}; border-bottom: 1px solid #ccc; padding-bottom: 4px;">
                        CORE SKILLS
                    </h2>

                    <div style="display: flex; gap: 16px; flex-wrap: wrap; margin-top: 8px; font-size: 0.9375rem;">
                        ${skills.map(skill => `
                            <div style="color: #4b5563;">
                                • ${skill}
                            </div>
                        `).join('')}
                    </div>
                </section>
            ` : ''}

            ${languages.length > 0 ? `
                <section style="margin-bottom: 24px; width: 50%;">
                    <h2 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 16px; color: ${accentColor}; border-bottom: 1px solid #ccc; padding-bottom: 4px;">
                        LANGUAGES
                    </h2>

                    <div style="display: flex; flex-direction: column; gap: 4px; padding-top: 8px;">
                        ${languages.map(lang => `
                            <p style="font-size: 0.9375rem; color: #4b5563; margin: 0;">
                                <span style="font-weight: 600;">${lang.language}</span> - ${lang.level}
                            </p>
                        `).join('')}
                    </div>
                </section>
            ` : ''}
        </div>
    ` : '';


    // 8. References Section
    const referencesHtml = references.length > 0 ? `
        <section style="margin-bottom: 24px;">
            <h2 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 16px; color: ${accentColor}; border-bottom: 1px solid #ccc; padding-bottom: 4px;">
                REFERENCES
            </h2>

            <div style="display: flex; flex-wrap: wrap; justify-content: flex-start; align-items: flex-start; gap: 32px; font-size: 0.875rem; color: #4b5563;">
                ${references.map(ref => `
                    <div style="width: 45%;">
                        <p style="font-weight: 700; margin: 0;">${ref.name}</p>
                        <p style="font-size: 0.875rem; margin: 0;">${ref.title}</p>
                        <p style="font-size: 0.875rem; margin: 0;">${ref.company}</p>
                        <p style="font-size: 0.875rem; margin: 0;">${ref.contact}</p>
                    </div>
                `).join('')}
            </div>
        </section>
    ` : '';

    // =================================================================
    // 📦 Final Template Structure
    // =================================================================

    return `
        <div style="max-width: 8.5in; margin: 0 auto; padding: 32px; background: white; color: #374151; line-height: 1.6; box-sizing: border-box;">
            ${headerHtml}
            ${summaryHtml}
            ${experienceHtml}
            ${projectsHtml}
            ${educationHtml}
            ${skillsAndLanguagesHtml}
            ${referencesHtml}
        </div>
    `;
};



/**
 * Calm Sidebar Template සඳහා HTML අන්තර්තය ජනනය කරයි.
 * @param {object} data - සම්පූර්ණ Resume දත්ත වස්තුව
 * @param {string} accentColor - තෝරාගත් වර්ණය (e.g., '#3b82f6')
 * @returns {string} - Styled HTML string
 */
const getCalmSidebarTemplateHtml = (data, accentColor) => {

    // 📅 Date Formatting Helper (JS Date objects වෙනුවට string manipulation)
    const formatDate = (dateStr) => {
        if (!dateStr || dateStr.toLowerCase() === 'present') return 'Present';
        
        const [year, month] = dateStr.split("-");

        if (year && month) {
            // Month number to short name map
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const monthName = months[parseInt(month, 10) - 1];
            return `${monthName} ${year}`;
        }
        if (year) return year;
        return dateStr;
    };

    // Skill Pill/Tag HTML
    const getSkillPillHtml = (skill, accentColor) => `
        <div 
            style="font-size: 0.75rem; font-weight: 600; padding: 1px 8px; border-radius: 2px; display: inline-block; margin-bottom: 4px; margin-right: 4px; background-color: transparent; color: #333; border: 1px solid ${accentColor};"
        >
            ${skill}
        </div>
    `;

    // Sidebar Section Header HTML
    const getSidebarHeaderHtml = (title, accentColor) => `
        <h3 
            style="text-transform: uppercase; font-size: 0.875rem; font-weight: 700; padding-top: 16px; padding-bottom: 4px; margin-bottom: 8px; letter-spacing: 0.05em; color: ${accentColor}; border-bottom: 2px solid ${accentColor};"
        >
            ${title}
        </h3>
    `;

    // Main Content Section Header HTML
    const getMainHeaderHtml = (title, accentColor) => `
        <h3 
            style="text-transform: uppercase; font-size: 1.125rem; font-weight: 700; padding-top: 16px; margin-bottom: 8px; letter-spacing: 0.1em; color: #1f2937; border-bottom: 2px solid ${accentColor}; padding-bottom: 4px;"
        >
            ${title}
        </h3>
    `;

    const personalInfo = data.personal_info || {};
    const summary = data.professional_summary;
    const experience = data.experience || [];
    const projects = data.project || [];
    const education = data.education || [];
    const skills = data.skills || [];
    const languages = data.languages || [];
    const references = data.references || [];
    
    // =================================================================
    // 🛠️ Left Sidebar Content
    // =================================================================

    // Image
    const imageHtml = personalInfo.image ? `
        <div style="margin-bottom: 24px; display: flex; justify-content: center;">
            <img 
                src="${personalInfo.image}" 
                alt="Profile" 
                style="width: 128px; height: 128px; object-fit: cover; border-radius: 50%; border: 4px solid ${accentColor}; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);"
            />
        </div>
    ` : '';
    
    const contactHtml = `
        <section style="margin-bottom: 24px;">
            ${getSidebarHeaderHtml("Contact", accentColor)}
            <div style="line-height: 1.5; font-size: 0.875rem; font-weight: 500; color: #4b5563; display: flex; flex-direction: column; gap: 8px;">
                ${personalInfo.email ? `
                    <div style="display: flex; align-items: flex-start; gap: 8px;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: 2px;">
                            <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.83 1.83 0 0 1-2.06 0L2 7" />
                        </svg>
                        <span style="word-break: break-all;">${personalInfo.email}</span>
                    </div>
                ` : ''}
                ${personalInfo.phone ? `
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <img width="16" height="16" src="https://img.icons8.com/ios/50/phone--v1.png" alt="phone--v1"/>
                        <span>${personalInfo.phone}</span>
                    </div>
                ` : ''}
                ${personalInfo.location ? `
                    <div style="display: flex; align-items: flex-start; gap: 8px;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: 2px;">
                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
                        </svg>
                        <span>${personalInfo.location}</span>
                    </div>
                ` : ''}
                ${personalInfo.linkedin ? `
                    <div style="display: flex; align-items: flex-start; gap: 8px;">
                        <img width="16" height="16" src="https://img.icons8.com/ios/50/linkedin.png" alt="linkedin"/>
                        <a href="${personalInfo.linkedin}" target="_blank" style="color: #4b5563; text-decoration: none; word-break: break-all;">
                            LinkedIn
                        </a>
                    </div>
                ` : ''}
                ${personalInfo.website ? `
                    <div style="display: flex; align-items: flex-start; gap: 8px;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: 2px;">
                            <circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" />
                        </svg>
                        <a href="${personalInfo.website}" target="_blank" style="color: #4b5563; text-decoration: none; word-break: break-all;">
                            Portfolio
                        </a>
                    </div>
                ` : ''}
            </div>
        </section>
    `;

    // Skills
    const skillsHtml = skills.length > 0 ? `
        <section style="margin-bottom: 24px;">
            ${getSidebarHeaderHtml("Skills", accentColor)}
            <div style="display: flex; flex-wrap: wrap; margin-top: 8px;">
                ${skills.map(skill => getSkillPillHtml(skill, accentColor)).join('')}
            </div>
        </section>
    ` : '';
    
    // Languages
    const languagesHtml = languages.length > 0 ? `
        <section style="margin-bottom: 24px;">
            ${getSidebarHeaderHtml("Languages", accentColor)}
            <div style="line-height: 1.5; font-size: 0.875rem; color: #4b5563; display: flex; flex-direction: column; gap: 8px; padding-top: 4px;">
                ${languages.map((lang, index) => `
                    <p style="margin: 0; font-size: 0.875rem; color: #4b5563;">
                        <span style="font-weight: 600;">${lang.language}</span> - ${lang.level}
                    </p>
                `).join('')}
            </div>
        </section>
    ` : '';

    // References
    const referencesHtml = references.length > 0 ? `
        <section style="margin-bottom: 24px;">
            ${getSidebarHeaderHtml("References", accentColor)}
            <div style="line-height: 1.4; font-size: 0.75rem; color: #4b5563; display: flex; flex-direction: column; gap: 12px; padding-top: 4px;">
                ${references.map((ref, index) => `
                    <div>
                        <p style="font-weight: 700; margin: 0; color: ${accentColor}; font-size: 0.875rem;">${ref.name}</p>
                        <p style="color: #4b5563; margin: 0; font-size: 0.8125rem;">${ref.title}</p>
                        <p style="color: #4b5563; margin: 0; font-size: 0.8125rem;">${ref.company}</p>
                        <p style="font-style: italic; margin-top: 4px; word-break: break-all; font-size: 0.75rem;">${ref.contact}</p>
                    </div>
                `).join('')}
            </div>
        </section>
    ` : '';


    // =================================================================
    // 🛠️ Right Main Content
    // =================================================================

    // Header Block (Name, Profession, Summary)
    const mainHeaderBlock = `
        <header style="margin-bottom: 24px;">
            <h1 style="font-size: 1.875rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; color: ${accentColor};">
                ${personalInfo.full_name || ""}
            </h1>
            <h2 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 12px; color: #4b5563;">
                ${personalInfo.profession || ""}
            </h2>
            ${summary ? `
                <p style="font-size: 0.875rem; line-height: 1.6; color: #4b5563; margin-top: 12px;">
                    ${summary}
                </p>
            ` : ''}
        </header>
    `;

    // Education
    const educationHtml = education.length > 0 ? `
        <section style="margin-bottom: 24px;"> 
            ${getMainHeaderHtml("Educational Background", accentColor)}
            <div style="display: flex; flex-direction: column; gap: 16px; padding-top: 8px;">
                ${education.map((edu, index) => `
                    <div style="padding-bottom: 8px;"> 
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; font-size: 0.875rem; font-weight: 700; color: #1f2937; margin-bottom: 4px;">
                            <h4 style="color: ${accentColor}; margin: 0; font-size: 0.9375rem;">${edu.degree} ${edu.field ? `in ${edu.field}` : ''}</h4>
                            <span style="font-weight: 500; color: #4b5563; white-space: nowrap; font-size: 0.8125rem;">
                                ${formatDate(edu.start_date)} - ${formatDate(edu.graduation_date)}
                            </span>
                        </div>
                        <p style="font-size: 0.875rem; font-style: italic; color: #4b5563; margin: 0;">
                            ${edu.institution}
                        </p>
                    </div>
                `).join('')}
            </div>
        </section>
    ` : '';
    
    // Work Experience
    const experienceHtml = experience.length > 0 ? `
        <section style="margin-bottom: 24px;">
            ${getMainHeaderHtml("Work Experience", accentColor)}
            <div style="display: flex; flex-direction: column; gap: 20px; padding-top: 8px;">
                ${experience.map((exp, index) => `
                    <div style="padding-bottom: 8px;"> 
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; font-size: 0.875rem; margin-bottom: 4px;">
                            <h4 style="font-weight: 700; color: #1f2937; margin: 0; font-size: 0.9375rem;">${exp.position}</h4>
                            <span style="font-weight: 500; color: #4b5563; white-space: nowrap; font-size: 0.8125rem;">
                                ${formatDate(exp.start_date)} - ${exp.is_current ? "Present" : formatDate(exp.end_date)}
                            </span>
                        </div>
                        <p style="font-size: 0.875rem; font-style: italic; color: #4b5563; margin: 0; margin-bottom: 8px;">${exp.company}</p>
                        ${exp.description ? `
                            <ul style="list-style-type: disc; padding-left: 20px; margin: 0; font-size: 0.875rem; color: #4b5563; line-height: 1.5;">
                                ${exp.description.split("\n").map((line, i) => `
                                    <li style="margin-bottom: 4px; word-break: break-word;">${line}</li>
                                `).join('')}
                            </ul>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        </section>
    ` : '';

    // Projects
    const projectsHtml = projects.length > 0 ? `
        <section style="margin-bottom: 24px;">
            ${getMainHeaderHtml("Projects Experience", accentColor)}
            <div style="display: flex; flex-direction: column; gap: 20px; padding-top: 8px;">
                ${projects.map((p, index) => `
                    <div style="padding-bottom: 8px;"> 
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; font-size: 0.875rem; margin-bottom: 4px;">
                            <h4 style="font-weight: 700; color: #1f2937; margin: 0; font-size: 0.9375rem;">${p.name} - (${p.type})</h4>
                        </div>
                        ${p.description ? `
                            <ul style="list-style-type: disc; padding-left: 20px; margin: 0; font-size: 0.875rem; color: #4b5563; line-height: 1.5;">
                                ${p.description.split("\n").map((line, i) => `
                                    <li style="margin-bottom: 4px; word-break: break-word;">${line}</li>
                                `).join('')}
                            </ul>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        </section>
    ` : '';


    // =================================================================
    // 📦 Final Template Structure (Combines Sidebar and Main Content)
    // =================================================================

    return `
        <div style="max-width: 8.5in; margin: 0 auto; background: white; color: #374151; font-family: Arial, sans-serif; display: flex; flex-direction: row; min-height: 11in; font-size: 10pt;">
            
            <aside 
                style="width: 250px; min-width: 250px; padding: 24px 16px; background-color: #f3f2f7; color: #1f2937; flex-shrink: 0; flex-grow: 0;" 
            >
                ${imageHtml}
                ${contactHtml}
                ${skillsHtml}
                ${languagesHtml}
                ${referencesHtml}
            </aside>

            <main style="flex-grow: 1; width: auto; padding: 24px; color: #1f2937;">
                ${mainHeaderBlock}
                ${educationHtml}
                ${experienceHtml}
                ${projectsHtml}
            </main>
        </div>
    `;
};



/**
 * Modern Resume Template එක JSX වලින් සෘජු HTML String එකක් බවට පරිවර්තනය කරයි.
 * මෙහිදී Tailwind Classes වෙනුවට Inline CSS styles භාවිතා කරන අතර, Icons සඳහා SVG කේත යොදනු ලැබේ.
 * * @param {object} data - Resume දත්ත අඩංගු object එක.
 * @param {string} accentColor - Resume එකේ ප්‍රධාන වර්ණය (e.g., '#0077b5').
 * @returns {string} - සම්පූර්ණ HTML String එක.
 */
function getModernTemplateHtml(data, accentColor) {

    // Helper function to format date (copied from JSX)
    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const [year, month] = dateStr.split("-");
        if (!year || !month) return dateStr;

        try {
            return new Date(year, month - 1).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short"
            });
        } catch (error) {
            return dateStr; // Return original if parsing fails
        }
    };

    // --- ICON SVGs ---
    // === ICON SVGs (colored with accentColor) ===
    const MailIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.83 1.83 0 0 1-2.06 0L2 7"/></svg>`;

    const PhoneIcon = `<img width="16" height="16" src="https://img.icons8.com/ios/50/phone--v1.png" alt="phone--v1"/>`;

    const MapPinIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;

    const LinkedinIcon = `<img width="16" height="16" src="https://img.icons8.com/ios/50/linkedin.png" alt="linkedin"/>`;

    const GlobeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>`;


    // --- TEMPLATE GENERATION ---

    const personalInfo = data.personal_info || {};
    const experience = data.experience || [];
    const project = data.project || [];
    const education = data.education || [];
    const skills = data.skills || [];
    const languages = data.languages || [];
    const references = data.references || [];

    const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${personalInfo.full_name || "Resume"}</title>
            <style>
                /* Basic Reset and Font Setup for Print/PDF */
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"; margin: 0; padding: 0; color: #333; line-height: 1.5; }
                .resume-container { max-width: 800px; margin: 0 auto; background-color: #ffffff; color: #1f2937; line-height: 1.6; }
                a { color: inherit; text-decoration: none; word-break: break-all; }
                .section-title { font-size: 1.5rem; font-weight: 300; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid #e5e7eb; }
                .date-badge { background-color: #f3f4f6; color: #6b7280; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.875rem; white-space: nowrap; }
                .skill-tag { color: #ffffff; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.875rem; display: inline-block; }
                /* Print specific styles for layout consistency */
                @media print {
                    .resume-container { box-shadow: none; }
                }
            </style>
        </head>
        <body>
            <div class="resume-container" style="max-width: 800px; margin: 0 auto; background-color: #ffffff; color: #1f2937; line-height: 1.6;">
                
                <header style="text-align: center; padding-bottom: 1.5rem; border-top: 4px solid; border-bottom: 2px solid; margin: 1rem; padding: 1rem; border-color: ${accentColor};">
                    <h1 style="font-size: 2.25rem; font-weight: 700; margin-bottom: 0.25rem; color: ${accentColor};">
                        ${personalInfo.full_name || "Your Name"}
                    </h1>
                    <p style="text-transform: uppercase; color: #525252; font-weight: 500; font-size: 1.125rem; letter-spacing: 0.1em; margin-bottom: 0.75rem;">
                        ${personalInfo.profession || ""}
                    </p>

                    <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 1rem; font-size: 0.875rem; color: #525252;">
                        
                        ${personalInfo.email ? `
                            <div style="display: flex; align-items: center; gap: 0.25rem;">
                                ${MailIcon}
                                <span>${personalInfo.email}</span>
                            </div>
                        ` : ''}
                        
                        ${personalInfo.phone ? `
                            <div style="display: flex; align-items: center; gap: 0.25rem;">
                                ${PhoneIcon}
                                <span>${personalInfo.phone}</span>
                            </div>
                        ` : ''}
                        
                        ${personalInfo.location ? `
                            <div style="display: flex; align-items: center; gap: 0.25rem;">
                                ${MapPinIcon}
                                <span>${personalInfo.location}</span>
                            </div>
                        ` : ''}
                        
                        ${personalInfo.linkedin ? `
                            <a target="_blank" href="${personalInfo.linkedin}" style="display: flex; align-items: center; gap: 0.25rem; color: inherit;">
                                ${LinkedinIcon}
                                <span style="word-break: break-all;">LinkedIn</span>
                            </a>
                        ` : ''}
                        
                        ${personalInfo.website ? `
                            <a target="_blank" href="${personalInfo.website}" style="display: flex; align-items: center; gap: 0.25rem; color: inherit;">
                                ${GlobeIcon}
                                <span style="word-break: break-all;">Portfolio</span>
                            </a>
                        ` : ''}
                    </div>
                </header>

                <div style="padding: 1rem 2rem;"> 
                    
                    ${data.professional_summary ? `
                        <section style="margin-bottom: 2rem;">
                            <h2 class="section-title">Professional Summary</h2>
                            <p style="color: #4b5563; font-size: 1rem;">${data.professional_summary}</p>
                        </section>
                    ` : ''}

                    ${experience.length > 0 ? `
                        <section style="margin-bottom: 2rem;">
                            <h2 class="section-title">Experience</h2>

                            <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                                ${experience.map((exp) => `
                                    <div style="position: relative; padding-left: 1.5rem; border-left: 1px solid #e5e7eb;">

                                        <div style="display: flex; flex-direction: row; align-items: flex-start; justify-content: space-between; margin-bottom: 0.5rem;">
                                            <div style="flex-grow: 1;">
                                                <h3 style="font-size: 1.25rem; font-weight: 500; color: #1f2937; margin: 0; padding: 0;">${exp.position}</h3>
                                                <p style="font-weight: 500; color: ${accentColor}; margin: 0; padding: 0;">${exp.company}</p>
                                            </div>
                                            <div class="date-badge" style="margin-top: 0.25rem;">
                                                ${formatDate(exp.start_date)} - ${exp.is_current ? "Present" : formatDate(exp.end_date)}
                                            </div>
                                        </div>

                                        ${exp.description ? `
                                            <div style="color: #4b5563; line-height: 1.6; margin-top: 0.75rem; white-space: pre-line;">
                                                ${exp.description}
                                            </div>
                                        ` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        </section>
                    ` : ''}

                    ${project.length > 0 ? `
                        <section style="margin-bottom: 2rem;">
                            <h2 class="section-title">Projects</h2>

                            <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                                ${project.map((p) => `
                                    <div style="position: relative; padding-left: 1.5rem; border-left: 2px solid ${accentColor};">

                                        <div style="display: flex; flex-direction: row; justify-content: space-between; margin-bottom: 0.25rem;">
                                            <div style="flex-grow: 1;">
                                                <h3 style="font-size: 1.125rem; font-weight: 500; color: #1f2937; margin: 0; padding: 0;">${p.name}</h3>
                                            </div>
                                            <div class="date-badge" style="color: #4b5563; background-color: #f3f4f6; margin-top: 0.25rem;">
                                                ${p.type}
                                            </div>
                                        </div>

                                        ${p.description ? `
                                            <div style="color: #4b5563; line-height: 1.6; font-size: 0.875rem; margin-top: 0.75rem;">
                                                ${p.description}
                                            </div>
                                        ` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        </section>
                    ` : ''}

                    <div style="display: grid; grid-template-columns: 2fr; gap: 2rem;">
                        
                        ${education.length > 0 ? `
                            <section style="break-inside: avoid;">
                                <h2 class="section-title">Education</h2>

                                <div style="display: flex; flex-direction: column; gap: 1rem;">
                                    ${education.map((edu) => `
                                        <div>
                                            <h3 style="font-weight: 600; color: #1f2937; margin: 0; padding: 0;">
                                                ${edu.degree} ${edu.field ? `in ${edu.field}` : ''}
                                            </h3>
                                            <p style="color: ${accentColor}; margin: 0; padding: 0; font-size: 0.95rem;">${edu.institution}</p>
                                            
                                            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.875rem; color: #6b7280; flex-wrap: wrap; margin-top: 0.25rem;">
                                                <span>${formatDate(edu.graduation_date)}</span>
                                                ${edu.gpa ? `<span>GPA: ${edu.gpa}</span>` : ''}
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </section>
                        ` : ''}

                        ${skills.length > 0 ? `
                            <section style="break-inside: avoid;">
                                <h2 class="section-title">Skills</h2>

                                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                                    ${skills.map((skill) => `
                                        <span class="skill-tag" style="background-color: ${accentColor};">
                                            ${skill}
                                        </span>
                                    `).join('')}
                                </div>
                            </section>
                        ` : ''}
                    </div>


                    ${languages.length > 0 ? `
                        <section style="margin-top: 2rem; margin-bottom: 2rem;">
                            <h2 class="section-title">Languages</h2> 

                            <div style="display: flex; flex-wrap: wrap; gap: 1.5rem;">
                                ${languages.map((lang) => `
                                    <p style="font-size: 0.875rem; color: #4b5563; min-width: 45%; margin: 0; padding: 0;">
                                        • <span style="font-weight: 600;">${lang.language}</span> - ${lang.level}
                                    </p>
                                `).join('')}
                            </div>
                        </section>
                    ` : ''}


                    ${references.length > 0 ? `
                        <section style="margin-bottom: 2rem;">
                            <h2 class="section-title">References</h2>

                            <div style="display: flex; flex-wrap: wrap; justify-content: space-between; gap: 1.5rem; font-size: 0.875rem; color: #4b5563;">
                                ${references.map((ref) => `
                                    <div style="flex-basis: calc(50% - 1rem); min-width: 250px;">
                                        <p style="font-weight: 700; margin: 0;">${ref.name}</p>
                                        <p style="font-size: 0.875rem; margin: 0;">${ref.title}</p>
                                        <p style="font-size: 0.875rem; margin: 0;">${ref.company}</p>
                                        <p style="font-size: 0.875rem; margin: 0;">${ref.contact}</p>
                                    </div>
                                `).join('')}
                            </div>
                        </section>
                    ` : ''}
                </div>
            </div>
        </body>
        </html>
    `;

    return htmlContent;
}



/**
 * Minimal Resume Template එක JSX වලින් සෘජු HTML String එකක් බවට පරිවර්තනය කරයි.
 * මෙහිදී Tailwind Classes වෙනුවට Inline CSS styles භාවිතා කරන අතර, Icons සඳහා විශ්වාසදායක SVG කේත යොදනු ලැබේ.
 * @param {object} data - Resume දත්ත අඩංගු object එක.
 * @param {string} accentColor - Resume එකේ ප්‍රධාන වර්ණය (e.g., '#0077b5').
 * @returns {string} - සම්පූර්ණ HTML String එක.
 */
function getMinimalTemplateHtml(data, accentColor) {

    // Helper function to format date (copied from JSX)
    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const [year, month] = dateStr.split("-");
        if (!year || !month) return dateStr;

        try {
            return new Date(year, month - 1).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short"
            });
        } catch (error) {
            return dateStr;
        }
    };

    // --- ICON SVGs ---
    // Note: Lucide-react icons (Mail, Phone, MapPin, Linkedin, Globe) are replaced with reliable SVG paths.
    
    // Mail Icon
    const MailIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: 2px;">
                            <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.83 1.83 0 0 1-2.06 0L2 7" />
                        </svg>`;
    
    // Phone Icon (Simple Handset - most reliable)
    const PhoneIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#525252" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: -2px;">	
                            <path d="M22 16.92v3a2 2 0 0 1-2 2h-3.92a2 2 0 0 1-2-2.16a2 2 0 0 0-2.3-2.3c-2.4 0-4.8-.48-7.2-1.44a15.8 15.8 0 0 1-3.48-1.78l-.34-.17a1 1 0 0 1 0-1.78l.34-.17A15.8 15.8 0 0 1 7.2 4.48a2 2 0 0 0 2.3-2.3a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3"/>	
                        </svg>`;

    // MapPin Icon (Location)
    const MapPinIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: 2px;">
                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
                        </svg>`;

    // Linkedin Icon (Classic 'in' Logo - simple path)
    const LinkedinIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#525252" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: -2px;">
                            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" fill="#525252" stroke="none"/>
                            <line x1="8.5" y1="11" x2="8.5" y2="18" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
                            <circle cx="8.5" cy="7.5" r="1.5" fill="white" stroke="none"/>
                            <path d="M12.5 18v-4a2.5 2.5 0 0 1 2.5-2.5h0a2.5 2.5 0 0 1 2.5 2.5V18" stroke="white" stroke-width="2.5" stroke-linecap="round" fill="none"/>
                        </svg>`;

    // Globe Icon (Website)
    const GlobeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: 2px;">
                            <circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" />
                        </svg>`;

    // --- TEMPLATE GENERATION ---

    const personalInfo = data.personal_info || {};
    const experience = data.experience || [];
    const project = data.project || [];
    const education = data.education || [];
    const skills = data.skills || [];
    const languages = data.languages || [];
    const references = data.references || [];

    const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${personalInfo.full_name || "Resume"}</title>
            <style>
                /* Basic Reset and Font Setup for Print/PDF */
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"; margin: 0; padding: 0; color: #1f2937; line-height: 1.5; font-weight: 300; }
                .resume-container { max-width: 800px; margin: 0 auto; background-color: #ffffff; padding: 1rem; }
                a { color: inherit; text-decoration: none; word-break: break-all; }
                .section-title { font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 1rem; font-weight: 500; border-bottom: 1px solid; padding-bottom: 0.25rem; }
                
                /* Responsive adjustments for print/desktop (sm:p-8) */
                @media screen and (min-width: 640px) {
                     .resume-container { padding: 2rem; }
                }
                @media print {
                    .resume-container { padding: 2rem; box-shadow: none; }
                    /* Force grid for print */
                    .grid-2-col { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 2rem; }
                    .ref-item { width: 48%; }
                }
            </style>
        </head>
        <body>
            <div class="resume-container" style="max-width: 800px; margin: 0 auto; background-color: #ffffff; color: #1f2937; font-weight: 300; line-height: 1.6;">
                
                <header style="margin-bottom: 2rem;">
                    <h1 style="font-size: 2.25rem; font-weight: 200; margin-bottom: 0.5rem; letter-spacing: 0.05em; text-align: center;">
                        ${personalInfo.full_name || "Your Name"}
                    </h1>
                    <p style="text-transform: uppercase; color: #525252; font-weight: 500; font-size: 0.875rem; letter-spacing: 0.2em; margin-bottom: 1rem; text-align: center;">
                        ${personalInfo.profession || ""}
                    </p>

                    <div style="display: flex; flex-wrap: wrap; justify-content: center; column-gap: 1rem; row-gap: 0.5rem; font-size: 0.875rem; color: #6b7280;">
                        
                        ${personalInfo.email ? `
                            <div style="display: flex; align-items: center; gap: 0.25rem;">
                                ${MailIcon}
                                <span>${personalInfo.email}</span>
                            </div>
                        ` : ''}
                        
                        ${personalInfo.phone ? `
                            <div style="display: flex; align-items: center; gap: 0.25rem;">
                                ${PhoneIcon}
                                <span>${personalInfo.phone}</span>
                            </div>
                        ` : ''}
                        
                        ${personalInfo.location ? `
                            <div style="display: flex; align-items: center; gap: 0.25rem;">
                                ${MapPinIcon}
                                <span>${personalInfo.location}</span>
                            </div>
                        ` : ''}
                        
                        ${personalInfo.linkedin ? `
                            <a target="_blank" href="${personalInfo.linkedin}" style="display: flex; align-items: center; gap: 0.25rem; color: inherit;">
                                ${LinkedinIcon}
                                <span style="word-break: break-all;">${personalInfo.linkedin.replace(/(^\w+:|^)\/\//, '').replace(/\/$/, '') || 'LinkedIn'}</span>
                            </a>
                        ` : ''}
                        
                        ${personalInfo.website ? `
                            <a target="_blank" href="${personalInfo.website}" style="display: flex; align-items: center; gap: 0.25rem; color: inherit;">
                                ${GlobeIcon}
                                <span style="word-break: break-all;">${personalInfo.website.replace(/(^\w+:|^)\/\//, '').replace(/\/$/, '') || 'Portfolio'}</span>
                            </a>
                        ` : ''}
                    </div>
                </header>

                
                ${data.professional_summary ? `
                    <section style="margin-bottom: 2rem;">
                        <p style="color: #4b5563; font-size: 1rem; line-height: 1.6;">
                            ${data.professional_summary}
                        </p>
                    </section>
                ` : ''}

                ${experience.length > 0 ? `
                    <section style="margin-bottom: 2rem; break-inside: avoid;">
                        <h2 class="section-title" style="color: ${accentColor}; border-color: ${accentColor};">
                            Experience
                        </h2>

                        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                            ${experience.map((exp) => `
                                <div>
                                    <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.25rem; flex-wrap: wrap;">
                                        <h3 style="font-size: 1rem; font-weight: 500; margin: 0; flex-grow: 1;">${exp.position}</h3>
                                        <span style="font-size: 0.75rem; color: #6b7280; flex-shrink: 0;">
                                            ${formatDate(exp.start_date)} - ${exp.is_current ? "Present" : formatDate(exp.end_date)}
                                        </span>
                                    </div>
                                    <p style="font-size: 0.875rem; color: #4b5563; margin: 0 0 0.25rem 0;">${exp.company}</p>
                                    ${exp.description ? `
                                        <div style="font-size: 0.875rem; color: #4b5563; line-height: 1.6; white-space: pre-line; margin-top: 0.25rem;">
                                            ${exp.description}
                                        </div>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </section>
                ` : ''}

                ${project.length > 0 ? `
                    <section style="margin-bottom: 2rem; break-inside: avoid;">
                        <h2 class="section-title" style="color: ${accentColor}; border-color: ${accentColor};">
                            Projects
                        </h2>

                        <div style="display: flex; flex-direction: column; gap: 1rem;">
                            ${project.map((proj) => `
                                <div>
                                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; flex-wrap: wrap;">
                                        <h3 style="font-size: 1rem; font-weight: 500; margin: 0; flex-grow: 1;">${proj.name}</h3>
                                        <div style="font-size: 0.75rem; color: #4b5563; background-color: #f3f4f6; padding: 0 0.5rem; border-radius: 4px; flex-shrink: 0;">
                                            ${proj.type}
                                        </div>
                                    </div>
                                    <p style="font-size: 0.875rem; color: #4b5563; margin: 0.25rem 0 0 0;">${proj.description}</p>
                                </div>
                            `).join('')}
                        </div>
                    </section>
                ` : ''}

                <div class="grid-2-col" style="display: grid; grid-template-columns: 1fr; gap: 2rem;">
                    
                    ${education.length > 0 ? `
                        <section style="break-inside: avoid;">
                            <h2 class="section-title" style="color: ${accentColor}; border-color: ${accentColor};">
                                Education
                            </h2>

                            <div style="display: flex; flex-direction: column; gap: 1rem;">
                                ${education.map((edu) => `
                                    <div>
                                        <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap;">
                                            <h3 style="font-weight: 500; font-size: 1rem; margin: 0;">
                                                ${edu.degree} ${edu.field ? `in ${edu.field}` : ''}
                                            </h3>
                                            <span style="font-size: 0.75rem; color: #6b7280; flex-shrink: 0;">
                                                ${formatDate(edu.graduation_date)}
                                            </span>
                                        </div>
                                        <p style="font-size: 0.875rem; color: #4b5563; margin: 0;">${edu.institution}</p>
                                        ${edu.gpa ? `<p style="font-size: 0.75rem; color: #6b7280; margin: 0;">GPA: ${edu.gpa}</p>` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        </section>
                    ` : ''}

                    <div style="display: flex; flex-direction: column; gap: 2rem;">

                        ${skills.length > 0 ? `
                            <section style="break-inside: avoid;">
                                <h2 class="section-title" style="color: ${accentColor}; border-color: ${accentColor};">
                                    Skills
                                </h2>
                                <div style="font-size: 0.875rem; color: #4b5563; display: flex; flex-wrap: wrap; column-gap: 1rem; row-gap: 0.25rem;">
                                    ${skills.map((skill, index) => `
                                        <span style="white-space: nowrap;">
                                            ${index > 0 ? '• ' : ''} ${skill}
                                        </span>
                                    `).join('')}
                                </div>
                            </section>
                        ` : ''}

                        ${languages.length > 0 ? `
                            <section style="break-inside: avoid;">
                                <h2 class="section-title" style="color: ${accentColor}; border-color: ${accentColor};">
                                    Languages
                                </h2>
                                <div style="display: flex; flex-direction: column; gap: 0.25rem; padding-top: 0.25rem;">
                                    ${languages.map((lang) => `
                                        <p style="font-size: 0.875rem; color: #4b5563; margin: 0;">
                                            • <span style="font-weight: 600;">${lang.language}</span> - ${lang.level}
                                        </p>
                                    `).join('')}
                                </div>
                            </section>
                        ` : ''}
                    </div>
                </div>

                ${references.length > 0 ? `
                    <section style="margin-top: 2rem; margin-bottom: 1.5rem; break-inside: avoid;">
                        <h2 class="section-title" style="color: ${accentColor}; border-color: ${accentColor};">
                            REFERENCES
                        </h2>

                        <div style="display: flex; flex-wrap: wrap; justify-content: space-between; gap: 1rem; font-size: 0.875rem; color: #4b5563;">
                            ${references.map((ref) => `
                                <div class="ref-item" style="width: 100%; max-width: 48%;">
                                    <p style="font-weight: 700; margin: 0;">${ref.name}</p>
                                    <p style="font-size: 0.875rem; margin: 0;">${ref.title}</p>
                                    <p style="font-size: 0.875rem; margin: 0;">${ref.company}</p>
                                    <p style="font-size: 0.875rem; margin: 0;">${ref.contact}</p>
                                </div>
                            `).join('')}
                        </div>
                    </section>
                ` : ''}

            </div>
        </body>
        </html>
    `;

    return htmlContent;
}


/**
 * Minimal Image Resume Template (with photo) → Pure HTML + Inline CSS
 * @param {object} data - Resume data
 * @param {string} accentColor - e.g., "#e63946" or "#1d4ed8"
 * @returns {string} Full standalone HTML string (perfect for PDF generation)
 */
function getMinimalImageTemplateHtml(data, accentColor) {

    // Helper: Format YYYY-MM → "Jan 2024"
    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const [year, month] = dateStr.split("-");
        if (!year || !month) return dateStr;
        try {
            return new Date(year, month - 1).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
            });
        } catch {
            return dateStr;
        }
    };

    const p = data.personal_info || {};
    const imgSrc = p.image
        ? typeof p.image === "string"
            ? p.image
            : URL.createObjectURL(p.image) // works in browser only; for server use base64
        : "";

    // === ICON SVGs (same reliable ones as before, adjusted size/color) ===
    const PhoneIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${accentColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2 2h-3.92a2 2 0 0 1-2-2.16 2 2 0 0 0-2.3-2.3c-2.4 0-4.8-.48-7.2-1.44a15.8 15.8 0 0 1-3.48-1.78l-.34-.17a1 1 0 0 1 0-1.78l.34-.17A15.8 15.8 0 0 1 7.2 4.48a2 2 0 0 0 2.3-2.3 2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3"/></svg>`;

    const MailIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${accentColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.83 1.83 0 0 1-2.06 0L2 7"/></svg>`;

    const MapPinIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${accentColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;

    const LinkedinIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="${accentColor}" stroke="white" stroke-width="2"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><circle cx="8" cy="8" r="2"/><path d="M8 11v7M8 11V11"/><path d="M16 11v7M12 15v2"/></svg>`;

    const GlobeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${accentColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0 0-20"/><path d="M2 12h20"/></svg>`;

    const experience = data.experience || [];
    const project = data.project || [];
    const education = data.education || [];
    const skills = data.skills || [];
    const languages = data.languages || [];
    const references = data.references || [];

    const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${p.full_name || "Resume"} - Resume</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background: #f9fafb; color: #27272a; line-height: 1.5; }
                .container { max-width: 1000px; margin: 0 auto; background: white; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
                .grid { display: grid; grid-cols-1; }
                .header { grid-column: 1 / -1; padding: 2.5rem 1.5rem; border-bottom: 1px solid #e4e4e7; background: white; }
                .sidebar { padding: 2rem 1.5rem; background: #f4f4f5; }
                .main { padding: 2rem 1.5rem; }
                .section-title { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 2px solid ${accentColor}; padding-bottom: 0.4rem; margin-bottom: 1rem; color: #525252; }
                .accent { color: ${accentColor}; }
                .tag { display: inline-block; padding: 0.25rem 0.5rem; border: 1px solid #d4d4d8; border-radius: 0.375rem; background: white; font-size: 0.875rem; margin-right: 0.5rem; margin-bottom: 0.5rem; }
                ul { padding-left: 1.25rem; }
                li { margin-bottom: 0.35rem; }

                @media (min-width: 768px) {
                    .grid { grid-template-columns: 1fr 2fr; }
                    .header { padding: 3rem; }
                    .sidebar { padding: 3rem; border-right: 1px solid #e4e4e7; }
                    .main { padding: 3rem; }
                }
                @media print {
                    body { background: white; }
                    .container { box-shadow: none; }
                    .grid { grid-template-columns: repeat(3, auto) / 1fr 1fr 1fr; }
                    .header { grid-column: 1 / 4; padding: 3rem; }
                    .sidebar { grid-column: 1 / 2; padding: 3rem; border-right: 1px solid #e4e4e7; }
                    .main { grid-column: 2 / 4; padding: 3rem; }
                    /*.no-print-break { break-inside: avoid; }*/
                    
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="grid">

                    <!-- HEADER WITH IMAGE -->
                    <div class="header">
                        <div style="display: flex; flex-direction: row; align-items: center; gap: 1.5rem; text-align: center;">
                            ${imgSrc ? `
                                <img src="${imgSrc}" alt="Profile" style="width: 128px; height: 128px; object-fit: cover; border-radius: 50%; border: 4px solid ${accentColor}70;" />
                            ` : ''}
                            <div>
                                <h1 style="font-size: 2.5rem; font-weight: 800; color: #27272a; margin: 0; letter-spacing: 0.05em;">
                                    ${p.full_name || "Your Name"}
                                </h1>
                                <p style="text-transform: uppercase; color: #525252; font-weight: 500; letter-spacing: 0.2em; margin-top: 0.5rem;">
                                    ${p.profession || ""}
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- SIDEBAR -->
                    <aside class="sidebar">
                        <div style="max-width: 360px; margin: 0 auto;">

                            <!-- Contact -->
                            <section class="no-print-break">
                                <h2 class="section-title accent">CONTACT</h2>
                                <div style="font-size: 0.875rem; line-height: 1.8;">
                                    ${p.phone ? `<div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.5rem;">${PhoneIcon}<span>${p.phone}</span></div>` : ''}
                                    ${p.email ? `<div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.5rem;">${MailIcon}<span>${p.email}</span></div>` : ''}
                                    ${p.location ? `<div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.5rem;">${MapPinIcon}<span>${p.location}</span></div>` : ''}
                                    ${p.linkedin ? `<div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.5rem;"><a href="${p.linkedin}" target="_blank" style="color:inherit;">${LinkedinIcon}<span> Linkedin</span></a></div>` : ''}
                                    ${p.website ? `<div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.5rem;"><a href="${p.website}" target="_blank" style="color:inherit;">${GlobeIcon}<span> Protfolio</span></a></div>` : ''}
                                </div>
                            </section>

                            <!-- Education -->
                            ${education.length > 0 ? `
                                <section class="no-print-break" style="margin-top: 2rem;">
                                    <h2 class="section-title accent">EDUCATION</h2>
                                    ${education.map(edu => `
                                        <div style="margin-bottom: 1rem;">
                                            <p style="font-weight: 600; text-transform: uppercase; margin:0;">${edu.degree}</p>
                                            <p style="color:#525252; margin:0.25rem 0;">${edu.institution}</p>
                                            <p style="font-size:0.75rem; color:#71717a;">${formatDate(edu.graduation_date)}</p>
                                        </div>
                                    `).join('')}
                                </section>
                            ` : ''}

                            <!-- Skills -->
                            ${skills.length > 0 ? `
                                <section class="no-print-break" style="margin-top: 2rem;">
                                    <h2 class="section-title accent">SKILLS</h2>
                                    <div>
                                        ${skills.map(s => `<span class="tag">${s}</span>`).join('')}
                                    </div>
                                </section>
                            ` : ''}

                            <!-- Languages -->
                            ${languages.length > 0 ? `
                                <section class="no-print-break" style="margin-top: 2rem;">
                                    <h2 class="section-title accent">LANGUAGES</h2>
                                    ${languages.map(l => `
                                        <p style="margin:0.35rem 0; font-size:0.875rem;">• <strong>${l.language}</strong> - ${l.level}</p>
                                    `).join('')}
                                </section>
                            ` : ''}

                        </div>
                    </aside>

                    <!-- MAIN CONTENT -->
                    <main class="main">

                        <!-- Summary -->
                        ${data.professional_summary ? `
                            <section class="no-print-break" style="margin-bottom: 2rem;">
                                <h2 class="section-title" style="color:${accentColor};">SUMMARY</h2>
                                <p style="font-size:0.95rem; color:#374151;">${data.professional_summary.replace(/\n/g, '<br>')}</p>
                            </section>
                        ` : ''}

                        <!-- Experience -->
                        ${experience.length > 0 ? `
                            <section class="no-print-break" style="margin-bottom: 2rem;">
                                <h2 class="section-title" style="color:${accentColor};">EXPERIENCE</h2>
                                ${experience.map(exp => `
                                    <div style="margin-bottom: 1.5rem;">
                                        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap;">
                                            <h3 style="font-size:1.1rem; font-weight:600; margin:0;">${exp.position}</h3>
                                            <span style="font-size:0.8rem; color:#71717a;">${formatDate(exp.start_date)} – ${exp.is_current ? 'Present' : formatDate(exp.end_date)}</span>
                                        </div>
                                        <p style="margin:0.35rem 0; color:${accentColor}; font-weight:500;">${exp.company}</p>
                                        ${exp.description ? `<ul>${exp.description.split('\n').map(line => `<li>${line || '&nbsp;'}</li>`).join('')}</ul>` : ''}
                                    </div>
                                `).join('')}
                            </section>
                        ` : ''}

                        <!-- Projects -->
                        ${project.length > 0 ? `
                            <section class="no-print-break" style="margin-bottom: 2rem;">
                                <h2 class="section-title" style="color:${accentColor};">PROJECTS</h2>
                                ${project.map(proj => `
                                    <div style="margin-bottom: 1.5rem;">
                                        <h3 style="font-size:1.1rem; font-weight:600; margin:0;">${proj.name}</h3>
                                        <p style="margin:0.35rem 0; color:${accentColor};">${proj.type}</p>
                                        ${proj.description ? `<ul>${proj.description.split('\n').map(line => `<li>${line || '&nbsp;'}</li>`).join('')}</ul>` : ''}
                                    </div>
                                `).join('')}
                            </section>
                        ` : ''}

                        <!-- References -->
                        ${references.length > 0 ? `
                            <section class="no-print-break">
                                <h2 class="section-title" style="color:${accentColor};">REFERENCES</h2>
                                <div style="display:flex; flex-wrap:wrap; gap:2rem;">
                                    ${references.map(ref => `
                                        <div style="flex: 1 1 200px;">
                                            <p style="font-weight:700; margin:0;">${ref.name}</p>
                                            <p style="margin:0.25rem 0;">${ref.title}</p>
                                            <p style="margin:0;">${ref.company}</p>
                                            <p style="margin:0;">${ref.contact}</p>
                                        </div>
                                    `).join('')}
                                </div>
                            </section>
                        ` : ''}

                    </main>
                </div>
            </div>
        </body>
        </html>
            `;

    return htmlContent;
}



/**
 * Simple Modern Resume Template → Pure HTML + Inline CSS (No Tailwind)
 * Clean, bold headers, pipe-separated contact, modern layout
 * @param {object} data - Your resume data
 * @param {string} accentColor - e.g., "#dc2626", "#0891b2", etc.
 * @returns {string} Full standalone HTML
 */
function getSimpleModernTemplateHtml(data, accentColor) {

    const formatDate = (dateStr) => {
        if (!dateStr || dateStr.toLowerCase() === 'current') return 'Present';

        const [year, month] = dateStr.split("-");
        if (year && month) {
            const date = new Date(year, month - 1);
            if (!isNaN(date)) {
                return date.toLocaleDateString("en-US", { year: "numeric", month: "short" });
            }
        }
        return dateStr;
    };

    const p = data.personal_info || {};

    // Build contact line with pipes: Location | Phone | Email | LinkedIn | Website
    const contactItems = [];
    if (p.location) contactItems.push(`<span>${p.location}</span>`);
    if (p.phone) contactItems.push(`<span>${p.phone}</span>`);
    if (p.email) contactItems.push(`<span>${p.email}</span>`);
    if (p.linkedin) {
        const cleanLink = p.linkedin.replace(/(^\w+:|^)\/\//, '').replace(/\/$/, '');
        contactItems.push(`<a href="${p.linkedin}" target="_blank" style="color:#374151; text-decoration:none; font-weight:500;">LinkedIn</a>`);
    }
    if (p.website) {
        const cleanSite = p.website.replace(/(^\w+:|^)\/\//, '').replace(/\/$/, '');
        contactItems.push(`<a href="${p.website}" target="_blank" style="color:#374151; text-decoration:none; font-weight:500;">Portfolio</a>`);
    }
    const contactLine = contactItems.join('<span style="margin:0 0.5rem; color:#9ca3af;">|</span>');

    const experience = data.experience || [];
    const project = data.project || [];
    const education = data.education || [];
    const skills = data.skills || [];
    const languages = data.languages || [];
    const references = data.references || [];

    const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${p.full_name || "Resume"} - Resume</title>
            <style>
                body {
                    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    background: #f3f4f6;
                    color: #1f2937;
                    line-height: 1.6;
                }
                .container {
                    max-width: 1000px;
                    margin: 1rem auto;
                    background: white;
                    padding: 2rem;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.08);
                    border-radius: 8px;
                }
                h1 {
                    font-size: 1.875rem;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    margin: 0 0 0.25rem 0;
                    color: #111827;
                }
                .profession {
                    font-size: 1rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.15em;
                    color: ${accentColor};
                    margin: 0.25rem 0 0.5rem 0;
                }
                .contact-line {
                    font-size: 0.875rem;
                    color: #4b5563;
                    margin-bottom: 1rem;
                }
                .section-header {
                    font-size: 1.125rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.15em;
                    padding: 1.5rem 0 0.35rem;
                    margin: 1.5rem 0 1rem;
                    border-bottom: 3px solid ${accentColor};
                    color: #111827;
                }
                .entry {
                    margin-bottom: 1.5rem;
                }
                .entry-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                    margin-bottom: 0.25rem;
                }
                .entry-title {
                    font-weight: 700;
                    font-size: 0.875rem;
                    color: #111827;
                }
                .entry-date {
                    font-weight: 500;
                    color: #6b7280;
                    font-size: 0.875rem;
                }
                .entry-subtitle {
                    font-style: italic;
                    color: #4b5563;
                    margin-bottom: 0.5rem;
                }
                ul {
                    margin: 0.5rem 0;
                    padding-left: 1.5px;
                }
                li {
                    margin-bottom: 0.4rem;
                    color: #374151;
                }
                .skills-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 0.75rem 1.5rem;
                    margin-top: 0.5rem;
                }
                .skill-item {
                    font-weight: 600;
                    color: #1f2937;
                }
                .languages {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 1.5rem 2rem;
                    margin-top: 0.5rem;
                }
                .lang-item {
                    min-width: 45%;
                    font-size: 0.95rem;
                }
                .references {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 2rem;
                    margin-top: 1rem;
                }
                .ref-item {
                    flex: 1;
                    min-width: 280px;
                }

                @media (max-width: 640px) {
                    .container { padding: 2rem 1.5rem; margin: 1rem; border-radius: 0; box-shadow: none; }
                    .skills-grid { grid-template-columns: 1fr 1fr; }
                    .languages { flex-direction: column; gap: 0.75rem; }
                    .references { flex-direction: column; gap: 1.5rem; }
                }

                @media print {
                    body { background: white; }
                    .container { box-shadow: none; margin: 0; max-width: none; padding: 1.5rem; }
                    a { color: inherit !important; text-decoration: none !important; }
                }
            </style>
        </head>
        <body>
            <div class="container">
                
                <!-- Header -->
                <header>
                    <h1>${p.full_name || "STELLA WALKER"}</h1>
                    <div class="profession">${p.profession || ""}</div>
                    <div class="contact-line">
                        ${contactLine || ""}
                    </div>
                </header>

                <!-- Professional Summary -->
                ${data.professional_summary ? `
                    <section>
                        <div class="section-header">Professional Summary</div>
                        <p style="color:#374151; margin: 0.75rem 0;">${data.professional_summary.replace(/\n/g, '<br>')}</p>
                    </section>
                ` : ''}

                <!-- Education -->
                ${education.length > 0 ? `
                    <section>
                        <div class="section-header">Education</div>
                        ${education.map(edu => `
                            <div class="entry">
                                <div class="entry-header">
                                    <div class="entry-title">${edu.degree}${edu.field ? ` - ${edu.field}` : ''}</div>
                                    <div class="entry-date">${formatDate(edu.graduation_date)}</div>
                                </div>
                                <div class="entry-subtitle">${edu.institution}${edu.location ? `, ${edu.location}` : ''}</div>
                            </div>
                        `).join('')}
                    </section>
                ` : ''}

                <!-- Experience -->
                ${experience.length > 0 ? `
                    <section>
                        <div class="section-header">Experience</div>
                        ${experience.map(exp => `
                            <div class="entry">
                                <div class="entry-header">
                                    <div class="entry-title">${exp.position}</div>
                                    <div class="entry-date">${formatDate(exp.start_date)} – ${exp.is_current ? 'Present' : formatDate(exp.end_date)}</div>
                                </div>
                                <div class="entry-subtitle">${exp.company}</div>
                                ${exp.description ? `
                                    <ul>
                                        ${exp.description.split('\n').map(line => line.trim() ? `<li>${line}</li>` : '').join('')}
                                    </ul>
                                ` : ''}
                            </div>
                        `).join('')}
                    </section>
                ` : ''}

                <!-- Projects -->
                ${project.length > 0 ? `
                    <section>
                        <div class="section-header">Projects</div>
                        ${project.map(p => `
                            <div class="entry">
                                <div class="entry-header">
                                    <div class="entry-title">${p.name} <span style="font-weight:500; color:#6b7280;">(${p.type})</span></div>
                                </div>
                                ${p.description ? `
                                    <ul>
                                        ${p.description.split('\n').map(line => line.trim() ? `<li>${line}</li>` : '').join('')}
                                    </ul>
                                ` : ''}
                            </div>
                        `).join('')}
                    </section>
                ` : ''}

                <!-- Skills -->
                ${skills.length > 0 ? `
                    <section>
                        <div class="section-header">Skills</div>
                        <div class="skills-grid">
                            ${skills.map(skill => `<div class="skill-item">${skill}</div>`).join('')}
                        </div>
                    </section>
                ` : ''}

                <!-- Languages -->
                ${languages.length > 0 ? `
                    <section>
                        <div class="section-header">Languages</div>
                        <div class="languages">
                            ${languages.map(lang => `
                                <div class="lang-item">• <strong>${lang.language}</strong> - ${lang.level}</div>
                            `).join('')}
                        </div>
                    </section>
                ` : ''}

                <!-- References -->
                ${references.length > 0 ? `
                    <section>
                        <div class="section-header">References</div>
                        <div class="references">
                            ${references.map(ref => `
                                <div class="ref-item">
                                    <div style="font-weight:700;">${ref.name}</div>
                                    <div>${ref.title}</div>
                                    <div>${ref.company}</div>
                                    <div>${ref.contact}</div>
                                </div>
                            `).join('')}
                        </div>
                    </section>
                ` : ''}

            </div>
        </body>
        </html>
            `;

    return htmlContent;
}




/**
 * Traditional Resume Template → Pure HTML + Inline CSS
 * Classic two-column serif design with elegant borders
 * @param {object} data - Resume data
 * @param {string} accentColor - e.g., "#1f2937", "#8b5cf6", etc. (default dark gray)
 * @returns {string} Full standalone HTML string
 */
function getTraditionalTemplateHtml(data, accentColor) {

    const formatDate = (dateStr) => {
        if (!dateStr || dateStr.toLowerCase() === 'current') return 'Present';
        const [year, month] = dateStr.split("-");
        if (year && month) {
            const date = new Date(year, month - 1);
            if (!isNaN(date)) {
                return date.toLocaleDateString("en-US", { year: "numeric", month: "short" });
            }
        }
        return dateStr;
    };

    const p = data.personal_info || {};
    const experience = data.experience || [];
    const project = data.project || [];
    const education = data.education || [];
    const skills = data.skills || [];
    const languages = data.languages || [];
    const references = data.references || [];

    // Build contact items (with pipe separators on md+ and print)
    const contactItems = [];
    if (p.phone) contactItems.push(`<span style="white-space:nowrap;">${p.phone}</span>`);
    if (p.email) contactItems.push(`<span style="white-space:nowrap;">${p.email}</span>`);
    if (p.location) contactItems.push(`<span style="white-space:nowrap;">${p.location}</span>`);
    if (p.linkedin) {
        const clean = p.linkedin.replace(/(^\w+:|^)\/\//, '').replace(/\/$/, '') || 'LinkedIn';
        contactItems.push(`<a href="${p.linkedin}" target="_blank" style="color:inherit; text-decoration:none; white-space:nowrap;">LinkedIn</a>`);
    }
    if (p.website) {
        const clean = p.website.replace(/(^\w+:|^)\/\//, '').replace(/\/$/, '') || 'Portfolio';
        contactItems.push(`<a href="${p.website}" target="_blank" style="color:inherit; text-decoration:none; white-space:nowrap;">Portfolio</a>`);
    }

    const contactHtml = contactItems.length > 0
        ? `<div style="font-size:0.875rem; color:#525252; display:flex; flex-wrap:wrap; justify-content:center; column-gap:0.75rem; row-gap:0.25rem;">
             ${contactItems.map((item, i) => 
                 `<span>${item}${i < contactItems.length - 1 ? '<span style="margin:0 0.25rem; color:#9ca3af;">|</span>' : ''}</span>`
             ).join('')}
           </div>`
        : '';

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${p.full_name || "Resume"} - Resume</title>
        <style>
            body {
                font-family: Georgia, 'Times New Roman', Times, serif;
                margin: 0;
                padding: 0;
                background: #f9fafb;
                color: #1f2937;
                line-height: 1.6;
            }
            .container {
                max-width: 1000px;
                margin: 2rem auto;
                background: white;
                padding: 2rem;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            .header-border {
                border-top: 2px solid ${accentColor};
                border-bottom: 2px solid ${accentColor};
                padding: 1rem 0;
                margin: 0 1rem 1rem;
            }
            h1 {
                font-size: 2.25rem;
                font-weight: normal;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                text-align: center;
                margin: 0 0 0.5rem;
                color: #111827;
            }
            .profession {
                font-size: 1rem;
                font-weight: 600;
                text-transform: uppercase;
                text-align: center;
                margin: 0.75rem 0 0.5rem;
                color: ${accentColor};
            }
            .section-title {
                font-size: 1.25rem;
                font-weight: bold;
                text-transform: uppercase;
                margin: 0 0 0.75rem;
                color: ${accentColor};
            }
            .left-col .section-title,
            .right-col .section-title {
                padding-top: 0;
            }
            .grid {
                display: grid;
                grid-template-columns: 1fr;
                gap: 2rem;
            }
            .left-col {
                order: 2;
            }
            .right-col {
                order: 1;
            }
            .entry {
                margin-bottom: 1rem;
            }
            .entry-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                flex-wrap: wrap;
                gap: 0.25rem;
                margin-bottom: 0.25rem;
            }
            .entry-title {
                font-weight: 600;
                font-size: 0.875rem;
                color: #111827;
            }
            .entry-date {
                font-size: 0.875rem;
                color: #6b7280;
                font-weight: 500;
            }
            .entry-subtitle {
                font-style: italic;
                color: #525252;
                margin-bottom: 0.5rem;
            }
            ul {
                margin: 0.5rem 0;
                padding-left: 1.5rem;
            }
            li {
                margin-bottom: 0.35rem;
                color: #374151;
            }
            .skills-list {
                list-style: none;
                padding-left: 0;
            }
            .skills-list li {
                position: relative;
                padding-left: 1rem;
            }
            .skills-list li:before {
                content: "•";
                font-weight: bold;
                color: #111827;
                position: absolute;
                left: 0;
            }
            .references {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }

            @media (min-width: 768px) {
                .container { padding: 3rem 2rem; }
                .header-border { margin: 0 2rem 2.5rem; }
                .grid {
                    grid-template-columns: 4fr 8fr;
                    gap: 2.5rem;
                }
                .left-col {
                    order: 0;
                    padding-right: 1.5rem;
                }
                .right-col {
                    order: 0;
                    border-left: 1px solid #d1d5db;
                    padding-left: 2rem;
                }
            }

            @media print {
                body { background: white; }
                .container {
                    box-shadow: none;
                    margin: 0;
                    padding: 1.5rem;
                    max-width: none;
                }
                .header-border { margin: 0 1rem 1rem; }
                .grid {
                    grid-template-columns: 4fr 8fr;
                }
                .right-col {
                    border-left: 1px solid #d1d5db;
                    padding-left: 2rem;
                }
                a { color: inherit; text-decoration: none; }
                .contact-line span:not(:last-child):after {
                    content: " | ";
                    margin: 0 0.125rem;
                    color: #9ca3af;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">

            <!-- Header with bordered section -->
            <div class="header-border">
                <header style="text-align:center;">
                    <h1>${p.full_name || ""}</h1>
                    <div class="profession">${p.profession || ""}</div>
                    ${contactHtml}
                </header>
            </div>

            <!-- Two-column layout -->
            <div class="grid">

                <!-- LEFT COLUMN: Skills, Languages, References -->
                <aside class="left-col">

                    <!-- Skills -->
                    ${skills.length > 0 ? `
                        <section style="margin-bottom:2rem;">
                            <h2 class="section-title">Core Skills</h2>
                            <ul class="skills-list" style="font-size:0.875rem;">
                                ${skills.map(skill => `<li>${skill}</li>`).join('')}
                            </ul>
                        </section>
                    ` : ''}

                    <!-- Languages -->
                    ${languages.length > 0 ? `
                        <section style="margin-bottom:2rem;">
                            <h2 class="section-title">Languages</h2>
                            <div style="font-size:0.875rem;">
                                ${languages.map(lang => `
                                    <p style="margin:0.25rem 0;"><strong>${lang.language}</strong> - ${lang.level}</p>
                                `).join('')}
                            </div>
                        </section>
                    ` : ''}

                    <!-- References -->
                    ${references.length > 0 ? `
                        <section style="margin-bottom:2rem;">
                            <h2 class="section-title">References</h2>
                            <div class="references" style="font-size:0.875rem;">
                                ${references.map(ref => `
                                    <div>
                                        <div style="font-weight:bold;">${ref.name}</div>
                                        <div>${ref.title}</div>
                                        <div>${ref.company}</div>
                                        <div>${ref.contact}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </section>
                    ` : ''}

                </aside>

                <!-- RIGHT COLUMN: Main content -->
                <main class="right-col">

                    <!-- Professional Summary -->
                    ${data.professional_summary ? `
                        <section style="margin-bottom:1rem;">
                            <h2 class="section-title">Professional Summary</h2>
                            <p style="font-size:0.875rem; color:#374151;">${data.professional_summary.replace(/\n/g, '<br>')}</p>
                        </section>
                    ` : ''}

                    <!-- Experience -->
                    ${experience.length > 0 ? `
                        <section style="margin-bottom:1rem;">
                            <h2 class="section-title">Experience</h2>
                            ${experience.map(exp => `
                                <div class="entry">
                                    <div class="entry-header">
                                        <div class="entry-title">${exp.position}</div>
                                        <div class="entry-date">${formatDate(exp.start_date)} – ${exp.is_current ? 'Present' : formatDate(exp.end_date)}</div>
                                    </div>
                                    <div class="entry-subtitle">${exp.company}${exp.location ? `, ${exp.location}` : ''}</div>
                                    ${exp.description ? `
                                        <ul>
                                            ${exp.description.split('\n').map(line => line.trim() ? `<li>${line}</li>` : '').join('')}
                                        </ul>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </section>
                    ` : ''}

                    <!-- Education -->
                    ${education.length > 0 ? `
                        <section style="margin-bottom:1rem;">
                            <h2 class="section-title">Education</h2>
                            ${education.map(edu => `
                                <div class="entry">
                                    <div class="entry-header">
                                        <div class="entry-title">${edu.degree}${edu.field ? `: ${edu.field}` : ''}</div>
                                        <div class="entry-date">${formatDate(edu.graduation_date)}</div>
                                    </div>
                                    <div class="entry-subtitle">${edu.institution}${edu.location ? `, ${edu.location}` : ''}</div>
                                </div>
                            `).join('')}
                        </section>
                    ` : ''}

                    <!-- Projects -->
                    ${project.length > 0 ? `
                        <section style="margin-bottom:1rem;">
                            <h2 class="section-title">Projects Experience</h2>
                            ${project.map(p => `
                                <div class="entry">
                                    <div class="entry-title">${p.name} <span style="font-weight:500; color:#6b7280;">(${p.type})</span></div>
                                    ${p.description ? `
                                        <ul>
                                            ${p.description.split('\n').map(line => line.trim() ? `<li>${line}</li>` : '').join('')}
                                        </ul>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </section>
                    ` : ''}

                </main>
            </div>
        </div>
    </body>
    </html>
        `;

    return htmlContent;
}



/**
 * Natural Resume Template → Pure HTML + Inline CSS
 * Modern, clean design with photo, accent header, sidebar skills/education
 * @param {object} data - Resume data
 * @param {string} accentColor - Hex color, e.g., "#10b981" (emerald), "#6366f1" (indigo)
 * @returns {string} Full standalone HTML string
 */
function getNaturalTemplateHtml(data, accentColor) {

    const formatDate = (dateStr) => {
        if (!dateStr || dateStr.toLowerCase() === 'current') return 'Present';
        const [year, month] = dateStr.split("-");
        if (year && month) {
            const date = new Date(year, month - 1);
            if (!isNaN(date)) {
                return date.toLocaleDateString("en-US", { year: "numeric", month: "short" });
            }
        }
        return dateStr;
    };

    const p = data.personal_info || {};
    const imgSrc = p.image ? (typeof p.image === "string" ? p.image : URL.createObjectURL(p.image)) : "";

    // === ICON SVGs (colored with accentColor) ===
    const MailIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${accentColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.83 1.83 0 0 1-2.06 0L2 7"/></svg>`;

    //const PhoneIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${accentColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2 2h-3.92a2 2 0 0 1-2-2.16 2 2 0 0 0-2.3-2.3c-2.4 0-4.8-.48-7.2-1.44a15.8 15.8 0 0 1-3.48-1.78l-.34-.17a1 1 0 0 1 0-1.78l.34-.17A15.8 15.8 0 0 1 7.2 4.48a2 2 0 0 0 2.3-2.3 2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3"/></svg>`;
    const PhoneIcon = `<img width="16" height="16" src="https://img.icons8.com/ios/50/phone--v1.png" alt="phone--v1" fill="none" stroke="${accentColor}"/>`;

    const MapPinIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${accentColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;

    //const LinkedinIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="${accentColor}" stroke="white" stroke-width="2"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><circle cx="8" cy="8" r="2"/><path d="M8 11v7M8 11V11"/><path d="M16 11v7M12 15v2"/></svg>`;
    const LinkedinIcon = `<img width="16" height="16" src="https://img.icons8.com/ios/50/linkedin.png" alt="linkedin" fill="${accentColor}" stroke="white"/>`;

    const GlobeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${accentColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>`;

    const experience = data.experience || [];
    const project = data.project || [];
    const education = data.education || [];
    const skills = data.skills || [];
    const languages = data.languages || [];
    const references = data.references || [];

    const headerBg = accentColor + "30";

    const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${p.full_name || "Resume"} - Resume</title>
            <style>
                body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 0; background: #f3f4f6; color: #1f2937; line-height: 1.6; }
                .container { max-width: 900px; margin: 2rem auto; background: white; box-shadow: 0 20px 40px rgba(0,0,0,0.1); overflow: hidden; }
                header { padding: 2rem 2rem 1rem; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 1.5rem; background-color: ${headerBg}; -webkit-print-color-adjust: exact; color-adjust: exact; }
                h1 { font-size: 2.25rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin: 0; color: #111827; }
                .profession { font-size: 1.125rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.15em; color: ${accentColor}; margin: 0.5rem 0; }
                .summary { font-size: 0.875rem; color: #4b5563; max-width: 800px; }
                .grid { display: grid; grid-template-columns: 1fr; }
                aside { padding: 2rem; background: #f8f8f8; -webkit-print-color-adjust: exact; color-adjust: exact; }
                main { padding: 1rem 2rem 2rem; }
                .section-title-main { font-size: 1.125rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; padding: 1rem 0 0.5rem; margin: 1.5rem 0 1rem; border-bottom: 1px solid #d1d5db; color: #111827; }
                .section-title-side { font-size: 1.125rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; margin: 1.5rem 0 1rem; color: #1f2937; }
                .tag { display: inline-block; padding: 0.375rem 0.75rem; font-size: 0.875rem; font-weight: 600; border: 1px solid ${accentColor}; color: ${accentColor}; background: white; border-radius: 9999px; margin-right: 0.5rem; margin-bottom: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
                .entry { margin-bottom: 1.5rem; }
                .entry-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.25rem; }
                .entry-title { font-weight: 700; font-size: 0.875rem; color: #111827; }
                .entry-date { font-size: 0.875rem; color: #6b7280; font-weight: 500; }
                .entry-subtitle { font-style: italic; color: #525252; margin-bottom: 0.5rem; }
                ul { margin: 0.5rem 0; padding-left: 1.5rem; }
                li { margin-bottom: 0.35rem; color: #374151; }
                .contact-item { display: flex; align-items: flex-start; gap: 0.5rem; margin-bottom: 0.75rem; font-size: 0.875rem; font-weight: 500; }
                .languages { display: flex; flex-wrap: wrap; gap: 1.5rem; margin-top: 0.5rem; }
                .lang-item { font-size: 0.875rem; min-width: 45%; }

                @media (min-width: 768px) {
                    header { flex-direction: row; text-align: left; padding: 3rem; gap: 2rem; }
                    .grid { grid-template-columns: 1fr 2fr; }
                    aside { padding: 3rem; }
                    main { padding: 2rem 3rem 3rem; }
                }
                @media print {
                    body { background: white; }
                    .container { box-shadow: none; margin: 0; max-width: none; }
                    header, aside { -webkit-print-color-adjust: exact; color-adjust: exact; }
                    .grid { grid-template-columns: 1fr 2fr; }
                    a { color: inherit; text-decoration: none; }
                }
            </style>
        </head>
        <body>
            <div class="container">

                <!-- HEADER WITH PHOTO & SUMMARY -->
                <header style="background-color:${headerBg};">
                    ${imgSrc ? `<img src="${imgSrc}" alt="Profile" style="width:112px; height:112px; object-fit:cover; border-radius:50%; border:4px solid white; box-shadow:0 4px 12px rgba(0,0,0,0.2);" />` : ''}
                    <div>
                        <h1>${p.full_name || ""}</h1>
                        <div class="profession" style="color:${accentColor};">${p.profession || ""}</div>
                        ${data.professional_summary ? `<p class="summary">${data.professional_summary.replace(/\n/g, '<br>')}</p>` : ''}
                    </div>
                </header>

                <!-- TWO-COLUMN LAYOUT -->
                <div class="grid">

                    <!-- LEFT SIDEBAR -->
                    <aside style="background:#f8f8f8;">

                        <!-- Contact -->
                        <section>
                            <h3 class="section-title-side">Contact</h3>
                            <div style="font-size:0.875rem;">
                                ${p.email ? `<div class="contact-item">${MailIcon}<span style="word-break:break-all;">${p.email}</span></div>` : ''}
                                ${p.phone ? `<div class="contact-item">${PhoneIcon}<span>${p.phone}</span></div>` : ''}
                                ${p.location ? `<div class="contact-item">${MapPinIcon}<span>${p.location}</span></div>` : ''}
                                ${p.linkedin ? `<div class="contact-item">${LinkedinIcon}<a href="${p.linkedin}" target="_blank" style="color:inherit;">LinkedIn</a></div>` : ''}
                                ${p.website ? `<div class="contact-item">${GlobeIcon}<a href="${p.website}" target="_blank" style="color:inherit;">Portfolio</a></div>` : ''}
                            </div>
                        </section>

                        <!-- Education -->
                        ${education.length > 0 ? `
                            <section style="margin-top:2rem;">
                                <h3 class="section-title-side">Education</h3>
                                ${education.map(edu => `
                                    <div style="margin-bottom:1rem;">
                                        <div style="font-weight:700; font-size:0.9375rem;">${edu.degree}${edu.field ? ` in ${edu.field}` : ''}</div>
                                        <div style="font-style:italic; color:#525252; font-size:0.875rem;">${edu.institution}</div>
                                        <div style="font-size:0.8125rem; color:#6b7280;">
                                            ${edu.start_date ? formatDate(edu.start_date) + ' – ' : ''}${formatDate(edu.graduation_date)}
                                        </div>
                                        ${edu.gpa ? `<div style="font-size:0.8125rem; color:#6b7280;">Grade: ${edu.gpa}</div>` : ''}
                                    </div>
                                `).join('')}
                            </section>
                        ` : ''}

                        <!-- Skills -->
                        ${skills.length > 0 ? `
                            <section style="margin-top:2rem;">
                                <h3 class="section-title-side">Skills</h3>
                                <div style="margin-top:0.75rem;">
                                    ${skills.map(skill => `<span class="tag" style="border-color:${accentColor}; color:${accentColor};">${skill}</span>`).join('')}
                                </div>
                            </section>
                        ` : ''}

                        <!-- Languages -->
                        ${languages.length > 0 ? `
                            <section style="margin-top:2rem;">
                                <h3 class="section-title-side">Languages</h3>
                                <div class="languages">
                                    ${languages.map(lang => `<div class="lang-item">• <strong>${lang.language}</strong> – ${lang.level}</div>`).join('')}
                                </div>
                            </section>
                        ` : ''}

                        <!-- References -->
                        ${references.length > 0 ? `
                            <section style="margin-top:2rem;">
                                <h3 class="section-title-side">References</h3>
                                <div style="font-size:0.875rem;">
                                    ${references.map(ref => `
                                        <div style="margin-bottom:1rem;">
                                            <div style="font-weight:700;">${ref.name}</div>
                                            <div style="font-size:0.8125rem;">${ref.title} – ${ref.company}</div>
                                            <div style="font-size:0.8125rem;">${ref.contact}</div>
                                        </div>
                                    `).join('')}
                                </div>
                            </section>
                        ` : ''}

                    </aside>

                    <!-- MAIN CONTENT -->
                    <main>

                        <!-- Work Experience -->
                        ${experience.length > 0 ? `
                            <section>
                                <h2 class="section-title-main">Work Experience</h2>
                                ${experience.map(exp => `
                                    <div class="entry">
                                        <div class="entry-header">
                                            <div class="entry-title">${exp.position}</div>
                                            <div class="entry-date">${formatDate(exp.start_date)} – ${exp.is_current ? 'Present' : formatDate(exp.end_date)}</div>
                                        </div>
                                        <div class="entry-subtitle">${exp.company}</div>
                                        ${exp.description ? `<ul>${exp.description.split('\n').map(line => line.trim() ? `<li>${line}</li>` : '').join('')}</ul>` : ''}
                                    </div>
                                `).join('')}
                            </section>
                        ` : ''}

                        <!-- Projects -->
                        ${project.length > 0 ? `
                            <section>
                                <h2 class="section-title-main">Projects</h2>
                                ${project.map(p => `
                                    <div class="entry">
                                        <div class="entry-title">${p.name} <span style="font-weight:500; color:#6b7280;">(${p.type})</span></div>
                                        ${p.description ? `<ul>${p.description.split('\n').map(line => line.trim() ? `<li>${line}</li>` : '').join('')}</ul>` : ''}
                                    </div>
                                `).join('')}
                            </section>
                        ` : ''}

                    </main>
                </div>
            </div>
        </body>
        </html>
            `;

    return htmlContent;
}


/**
 * Strong Resume Template → Pure HTML + Inline CSS
 * Bold, professional design with accent top border and left bars
 * @param {object} data - Resume data
 * @param {string} accentColor - Hex color, e.g., "#dc2626" (red), "#1d4ed8" (blue)
 * @returns {string} Full standalone HTML string
 */
function getStrongTemplateHtml(data, accentColor) {

    const formatDate = (dateStr) => {
        if (!dateStr || dateStr.toLowerCase() === 'current') return 'Present';
        const [year, month] = dateStr.split("-");
        if (year && month) {
            const date = new Date(year, month - 1);
            if (!isNaN(date)) {
                return date.toLocaleDateString("en-US", { year: "numeric", month: "short" });
            }
        }
        return dateStr;
    };

    const p = data.personal_info || {};
    const experience = data.experience || [];
    const project = data.project || [];
    const education = data.education || [];
    const skills = data.skills || [];
    const languages = data.languages || [];
    const references = data.references || [];

    // Build contact line with pipes
    const contactItems = [];
    if (p.phone) contactItems.push(p.phone);
    if (p.email) contactItems.push(p.email);
    if (p.location) contactItems.push(p.location);
    if (p.linkedin) {
        const clean = p.linkedin.replace(/(^\w+:|^)\/\//, '').replace(/\/$/, '') || 'LinkedIn';
        contactItems.push(`<a href="${p.linkedin}" target="_blank" style="color:inherit; text-decoration:none;">LinkedIn</a>`);
    }
    if (p.website) {
        const clean = p.website.replace(/(^\w+:|^)\/\//, '').replace(/\/$/, '') || 'Portfolio';
        contactItems.push(`<a href="${p.website}" target="_blank" style="color:inherit; text-decoration:none;">Portfolio</a>`);
    }
    const contactLine = contactItems.length > 0
        ? contactItems.map((item, i) => 
            `<span style="white-space:nowrap;">${item}${i < contactItems.length - 1 ? ' <span style="color:#9ca3af;">|</span>' : ''}</span>`
          ).join(' ')
        : '';

    const htmlContent =`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${p.full_name || "Resume"} - Resume</title>
            <style>
                body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 0; background: #f3f4f6; color: #1f2937; line-height: 1.2; }
                .container { max-width: 1024px; margin: 1rem auto; background: white; box-shadow: 0 20px 40px rgba(0,0,0,0.1); border-top: 8px solid ${accentColor}; }
                .inner { padding: 2rem; }
                header { text-align: center; margin-bottom: 2rem; }
                h1 { font-size: 1.875rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.025em; margin: 0 0 0.5rem; color: #111827; }
                .profession { font-size: 1rem; font-weight: 700; text-transform: uppercase; margin: 0.75rem 0; color: ${accentColor}; }
                .contact { font-size: 0.875rem; color: #4b5563; display: flex; flex-wrap: wrap; justify-content: center; gap: 0.75rem; }
                .summary-section { padding: 1.5rem 2rem; margin: 0 0 2rem; border-top: 2px solid ${accentColor}; border-bottom: 2px solid ${accentColor}; text-align: center; }
                .summary-section p { font-size: 0.875rem; color: #374151; margin: 0; }
                .content-grid { display: grid; grid-template-columns: 1fr; gap: 1rem 2rem; margin-bottom: 2rem; }
                .section-title { font-size: 1.125rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; padding: 0.25rem 0 0.25rem 1rem; border-left: 4px solid ${accentColor}; color: ${accentColor}; margin: 0 0 1rem; }
                .section-content { padding-top: 0.25rem; }
                .entry { margin-bottom: 1.5rem; }
                .entry-header { display: flex; flex-direction: column; justify-content: space-between; gap: 0.5rem; margin-bottom: 0.5rem; }
                .entry-title { font-weight: 700; font-size: 0.875rem; color: #111827; }
                .entry-subtitle { font-style: italic; color: #525252; font-size: 0.875rem; }
                .entry-date { font-size: 0.875rem; color: #6b7280; font-weight: 500; }
                ul { margin: 0.25rem 0; padding-left: 1.5rem; }
                li { margin-bottom: 0.4rem; color: #374151; }
                .skills-list { display: grid; grid-template-columns: 1fr; gap: 0.5rem; list-style: disc inside; }
                .languages { display: flex; flex-wrap: wrap; gap: 1rem; }
                .lang-item { font-size: 0.875rem; min-width: 45%; }
                .references { display: flex; flex-direction: column; gap: 1.5rem; }

                @media (min-width: 768px) {
                    .inner { padding: 3rem; }
                    .summary-section { margin: 0 0 0; }
                    .content-grid { grid-template-columns: 3fr 9fr; }
                    .entry-header { flex-direction: row; align-items: flex-start; }
                    .skills-list { grid-template-columns: 1fr 1fr; gap: 1rem 1.5rem; }
                    .references { flex-direction: row; gap: 2rem; }
                }
                @media print {
                    body { background: white; }
                    .container { box-shadow: none; margin: 0; max-width: none; border-top: 8px solid ${accentColor}; }
                    .content-grid { grid-template-columns: 3fr 9fr; }
                    .skills-list { grid-template-columns: 1fr 1fr; }
                    .references { flex-direction: row; }
                    a { color: inherit; text-decoration: none; }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="inner">

                    <!-- HEADER -->
                    <header>
                        <h1>${p.full_name || ""}</h1>
                        <div class="profession">${p.profession || ""}</div>
                        ${contactLine ? `<div class="contact">${contactLine}</div>` : ''}
                    </header>

                    <!-- PROFESSIONAL SUMMARY -->
                    ${data.professional_summary ? `
                        <div class="summary-section">
                            <p>${data.professional_summary.replace(/\n/g, '<br>')}</p>
                        </div>
                    ` : ''}

                    <!-- MAIN CONTENT -->
                    <div style="margin-top:1.5rem;">

                        <!-- EDUCATION -->
                        ${education.length > 0 ? `
                            <div class="content-grid">
                                <div><h2 class="section-title">Education</h2></div>
                                <div class="section-content">
                                    ${education.map(edu => `
                                        <div class="entry">
                                            <div class="entry-header">
                                                <div>
                                                    <div class="entry-title">${edu.degree}${edu.field ? ` in ${edu.field}` : ''}</div>
                                                    <div class="entry-subtitle">${edu.institution}</div>
                                                    ${edu.gpa ? `<div style="font-size:0.875rem; color:#6b7280;">Grade: ${edu.gpa}</div>` : ''}
                                                </div>
                                                <div class="entry-date">${formatDate(edu.graduation_date)}</div>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}

                        <!-- WORK EXPERIENCE -->
                        ${experience.length > 0 ? `
                            <div class="content-grid">
                                <div><h2 class="section-title">Work Experience</h2></div>
                                <div class="section-content">
                                    ${experience.map(exp => `
                                        <div class="entry">
                                            <div class="entry-header">
                                                <div>
                                                    <div class="entry-title">${exp.position}</div>
                                                    <div class="entry-subtitle">${exp.company}</div>
                                                </div>
                                                <div class="entry-date">${formatDate(exp.start_date)} – ${exp.is_current ? 'Present' : formatDate(exp.end_date)}</div>
                                            </div>
                                            ${exp.description ? `
                                                <ul>
                                                    ${exp.description.split('\n').map(line => line.trim() ? `<li>${line}</li>` : '').join('')}
                                                </ul>
                                            ` : ''}
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}

                        <!-- PROJECT EXPERIENCE -->
                        ${project.length > 0 ? `
                            <div class="content-grid">
                                <div><h2 class="section-title">Project Experience</h2></div>
                                <div class="section-content">
                                    ${project.map(p => `
                                        <div class="entry">
                                            <div class="entry-title">${p.name} <span style="font-weight:500; color:#6b7280; font-size: 0.875rem">(${p.type})</span></div>
                                            ${p.description ? `
                                                <ul>
                                                    ${p.description.split('\n').map(line => line.trim() ? `<li>${line}</li>` : '').join('')}
                                                </ul>
                                            ` : ''}
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}

                        <!-- RELEVANT SKILLS -->
                        ${skills.length > 0 ? `
                            <div class="content-grid">
                                <div><h2 class="section-title">Relevant Skills</h2></div>
                                <div class="section-content">
                                    <ul class="skills-list">
                                        ${skills.map(skill => `<li>${skill}</li>`).join('')}
                                    </ul>
                                </div>
                            </div>
                        ` : ''}

                        <!-- LANGUAGES -->
                        ${languages.length > 0 ? `
                            <div class="content-grid">
                                <div><h2 class="section-title">Languages</h2></div>
                                <div class="section-content">
                                    <div class="languages">
                                        ${languages.map(lang => `
                                            <div class="lang-item">• <strong>${lang.language}</strong> – ${lang.level}</div>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                        ` : ''}

                        <!-- REFERENCES -->
                        ${references.length > 0 ? `
                            <div class="content-grid">
                                <div><h2 class="section-title">References</h2></div>
                                <div class="section-content">
                                    <div class="references">
                                        ${references.map(ref => `
                                            <div>
                                                <div style="font-weight:700;">${ref.name}</div>
                                                <div style="font-size:0.875rem;">${ref.title}</div>
                                                <div style="font-size:0.875rem;">${ref.company}</div>
                                                <div style="font-size:0.875rem;">${ref.contact}</div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                        ` : ''}

                    </div>
                </div>
            </div>
        </body>
        </html>
            `;

    return htmlContent;
}


/**
 * Classic Two-Column Professional Resume Template → Pure HTML + Inline CSS
 * Elegant design with full accent header, serif font, and clean layout
 * @param {object} data - Resume data
 * @param {string} accentColor - Hex color for header and accents, e.g., "#1e40af" (blue), "#991b1b" (red)
 * @returns {string} Full standalone HTML string
 */
function getProfessionalTemplateHtml(data, accentColor) {

    const formatDate = (dateStr) => {
        if (!dateStr || dateStr.toLowerCase() === 'current') return 'Present';
        const [year, month] = dateStr.split("-");
        if (year && month) {
            const date = new Date(year, month - 1);
            if (!isNaN(date)) {
                return date.toLocaleDateString("en-US", { year: "numeric", month: "short" });
            }
        }
        return dateStr;
    };

    const p = data.personal_info || {};
    const experience = data.experience || [];
    const project = data.project || [];
    const education = data.education || [];
    const skills = data.skills || [];
    const references = data.references || [];

    // Contact line with pipes
    const contactItems = [];
    if (p.location) contactItems.push(p.location);
    if (p.phone) contactItems.push(p.phone);
    if (p.email) contactItems.push(p.email);
    if (p.linkedin) {
        const clean = p.linkedin.replace(/(^\w+:|^)\/\//, '').replace(/\/$/, '') || 'LinkedIn';
        contactItems.push(`<a href="${p.linkedin}" target="_blank" style="color:white; text-decoration:none;">LinkedIn</a>`);
    }
    if (p.website) {
        const clean = p.website.replace(/(^\w+:|^)\/\//, '').replace(/\/$/, '') || 'Portfolio';
        contactItems.push(`<a href="${p.website}" target="_blank" style="color:white; text-decoration:none;">Portfolio</a>`);
    }
    const contactLine = contactItems.length > 0
        ? contactItems.map((item, i) => 
            `<span style="white-space:nowrap;">${item}${i < contactItems.length - 1 ? ' | ' : ''}</span>`
          ).join('')
        : '';

    const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${p.full_name || "Resume"} - Resume</title>
            <style>
                body { 
                    font-family: Georgia, 'Times New Roman', Times, serif; 
                    margin: 0; 
                    padding: 0; 
                    background: #f5f5f5; 
                    color: #333; 
                    line-height: 1.5; 
                    font-size: 11pt; /* Professional CV base size */
                }
                .container { 
                    max-width: 960px; 
                    margin: 0 auto; 
                    background: white; 
                    box-shadow: 0 10px 30px rgba(0,0,0,0.15); 
                    overflow: hidden;
                }
                header { 
                    background: ${accentColor}; 
                    color: white; 
                    padding: 2rem 1.5rem; 
                    text-align: center; 
                    -webkit-print-color-adjust: exact; 
                    color-adjust: exact;
                }
                h1 { 
                    font-size: 2.2rem; 
                    font-weight: 900; 
                    text-transform: uppercase; 
                    letter-spacing: 0.15em; 
                    margin: 0 0 0.4rem; 
                }
                .profession { 
                    font-size: 1rem; 
                    font-weight: 500; 
                    text-transform: uppercase; 
                    letter-spacing: 0.1em; 
                    margin: 0.5rem 0 1rem; 
                }
                .contact { 
                    font-size: 0.8rem; 
                    font-weight: 300; 
                    display: flex; 
                    flex-wrap: wrap; 
                    justify-content: center; 
                    gap: 0.75rem; 
                }
                .summary { 
                    padding: 2rem 2rem 1rem; 
                    font-size: 0.9rem; 
                    color: #444; 
                }
                .main-content { 
                    padding: 0 2rem 2rem; 
                }
                .content-block { 
                    display: grid; 
                    grid-template-columns: 1fr; 
                    gap: 1.5rem; 
                    margin-top: 1.5rem; 
                }
                .section-title { 
                    font-size: 0.85rem; 
                    font-weight: 900; 
                    text-transform: uppercase; 
                    letter-spacing: 0.12em; 
                    color: #222; 
                    padding-top: 0.25rem; 
                }
                .section-content { 
                    font-size: 0.9rem; 
                }
                .entry { 
                    margin-bottom: 1rem; 
                }
                .entry-header { 
                    display: flex; 
                    flex-direction: column; 
                    gap: 0.25rem; 
                    margin-bottom: 0.25rem; 
                }
                .entry-title { 
                    font-weight: 700; 
                    color: #222; 
                }
                .entry-date { 
                    font-size: 0.85rem; 
                    color: #555; 
                }
                .entry-subtitle { 
                    font-style: italic; 
                    color: #555; 
                    font-size: 0.9rem; 
                }
                ul { 
                    margin: 0.5rem 0; 
                    padding-left: 1.3rem; 
                }
                li { 
                    margin-bottom: 0.3rem; 
                    color: #444; 
                }
                .skills-tags { 
                    display: flex; 
                    flex-wrap: wrap; 
                    gap: 0.5rem; 
                    margin-top: 0.5rem; 
                }
                .skill-tag { 
                    display: inline-block; 
                    padding: 0.35rem 0.75rem; 
                    font-size: 0.75rem; 
                    font-weight: 600; 
                    color: white; 
                    background: ${accentColor}; 
                    border-radius: 9999px; 
                }
                .references { 
                    display: flex; 
                    flex-direction: column; 
                    gap: 1rem; 
                    font-size: 0.9rem; 
                }

                @media (min-width: 768px) {
                    .content-block { 
                        grid-template-columns: 3fr 9fr; 
                    }
                    .entry-header { 
                        flex-direction: row; 
                        justify-content: space-between; 
                        align-items: flex-start; 
                    }
                    .references { 
                        flex-direction: row; 
                        gap: 2rem; 
                    }
                }
                @media print {
                    body { background: white; font-size: 10pt; }
                    .container { box-shadow: none; max-width: none; margin: 0; }
                    header, .skill-tag { 
                        background: ${accentColor} !important; 
                        -webkit-print-color-adjust: exact; 
                        color-adjust: exact; 
                    }
                    .content-block { grid-template-columns: 3fr 9fr; }
                    a { color: white; text-decoration: none; }
                }
            </style>
        </head>
        <body>
            <div class="container">

                <!-- HEADER -->
                <header style="background:${accentColor};">
                    <h1>${p.full_name || "EMMA SMITH"}</h1>
                    <div class="profession">${p.profession || "BANK TELLER"}</div>
                    ${contactLine ? `<div class="contact">${contactLine}</div>` : ''}
                </header>

                <!-- PROFESSIONAL SUMMARY -->
                ${data.professional_summary ? `
                    <div class="summary">
                        <p>${data.professional_summary.replace(/\n/g, '<br>')}</p>
                    </div>
                ` : ''}

                <!-- MAIN CONTENT -->
                <div class="main-content">

                    <!-- EDUCATION -->
                    ${education.length > 0 ? `
                        <div class="content-block">
                            <div class="section-title">Education</div>
                            <div class="section-content">
                                ${education.map(edu => `
                                    <div class="entry">
                                        <div class="entry-header">
                                            <div class="entry-title">${edu.degree}${edu.field ? ` in ${edu.field}` : ''}</div>
                                            <div class="entry-date">${formatDate(edu.graduation_date)}</div>
                                        </div>
                                        <div class="entry-subtitle">${edu.institution}</div>
                                        ${edu.gpa ? `<div style="font-size:0.85rem; color:#666;">Grade: ${edu.gpa}</div>` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}

                    <!-- WORK EXPERIENCE -->
                    ${experience.length > 0 ? `
                        <div class="content-block">
                            <div class="section-title">Work Experience</div>
                            <div class="section-content">
                                ${experience.map(exp => `
                                    <div class="entry">
                                        <div class="entry-header">
                                            <div class="entry-title">${exp.position}</div>
                                            <div class="entry-date">${formatDate(exp.start_date)} – ${exp.is_current ? 'Present' : formatDate(exp.end_date)}</div>
                                        </div>
                                        <div class="entry-subtitle">${exp.company}</div>
                                        ${exp.description ? `
                                            <ul>
                                                ${exp.description.split('\n').map(line => line.trim() ? `<li>${line}</li>` : '').join('')}
                                            </ul>
                                        ` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}

                    <!-- PROJECT EXPERIENCE -->
                    ${project.length > 0 ? `
                        <div class="content-block">
                            <div class="section-title">Project Experience</div>
                            <div class="section-content">
                                ${project.map(p => `
                                    <div class="entry">
                                        <div class="entry-title">${p.name} <span style="font-weight:500; color:#666;">(${p.type})</span></div>
                                        ${p.description ? `
                                            <ul>
                                                ${p.description.split('\n').map(line => line.trim() ? `<li>${line}</li>` : '').join('')}
                                            </ul>
                                        ` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}

                    <!-- RELEVANT SKILLS -->
                    ${skills.length > 0 ? `
                        <div class="content-block">
                            <div class="section-title">Relevant Skills</div>
                            <div class="section-content">
                                <div class="skills-tags">
                                    ${skills.map(skill => `<span class="skill-tag" style="background:${accentColor};">${skill}</span>`).join('')}
                                </div>
                            </div>
                        </div>
                    ` : ''}

                    <!-- REFERENCES -->
                    ${references.length > 0 ? `
                        <div class="content-block">
                            <div class="section-title">References</div>
                            <div class="section-content">
                                <div class="references">
                                    ${references.map(ref => `
                                        <div>
                                            <div style="font-weight:700;">${ref.name}</div>
                                            <div style="font-size:0.85rem;">${ref.title}</div>
                                            <div style="font-size:0.85rem;">${ref.company}</div>
                                            <div style="font-size:0.85rem;">${ref.contact}</div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    ` : ''}

                </div>
            </div>
        </body>
        </html>
            `;

    return htmlContent;
}


/**
 * Modern Sidebar Resume Template → Pure HTML + Inline CSS
 * Clean, professional sidebar layout with accent-colored header and sidebar elements
 * @param {object} data - Resume data (same structure as your React component)
 * @param {string} accentColor - Hex color, e.g., "#1e40af", "#dc2626", "#16a34a"
 * @returns {string} Complete standalone HTML string ready for PDF generation or email
 */
function getOfficialTemplateHtml(data, accentColor) {

    const formatDate = (dateStr) => {
        if (!dateStr || dateStr.toLowerCase() === 'current') return 'Present';
        const [year, month] = dateStr.split("-");
        if (year && month) {
            const date = new Date(year, month - 1);
            if (!isNaN(date.getTime())) {
                return date.toLocaleDateString("en-US", { year: "numeric", month: "short" });
            }
        }
        return dateStr;
    };

    // === ICON SVGs (colored with accentColor) ===
    const MailIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${accentColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.83 1.83 0 0 1-2.06 0L2 7"/></svg>`;

    const PhoneIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${accentColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2 2h-3.92a2 2 0 0 1-2-2.16 2 2 0 0 0-2.3-2.3c-2.4 0-4.8-.48-7.2-1.44a15.8 15.8 0 0 1-3.48-1.78l-.34-.17a1 1 0 0 1 0-1.78l.34-.17A15.8 15.8 0 0 1 7.2 4.48a2 2 0 0 0 2.3-2.3 2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3"/></svg>`;

    const MapPinIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${accentColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;

    const LinkedinIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="${accentColor}" stroke="white" stroke-width="2"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><circle cx="8" cy="8" r="2"/><path d="M8 11v7M8 11V11"/><path d="M16 11v7M12 15v2"/></svg>`;

    const GlobeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${accentColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>`;

    const p = data.personal_info || {};
    const experience = data.experience || [];
    const education = data.education || [];
    const projects = data.project || [];
    const skills = data.skills || [];
    const certificates = data.certificates || [];
    const languages = data.languages || [];
    const references = data.references || [];
    const achievements = data.achievements || [];

    const htmlContent =  `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${p.full_name || "Resume"} - Resume</title>
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    font-family: 'Calibri', 'Arial', sans-serif;
                    background: #f5f5f5;
                    color: #333;
                    font-size: 10.5pt;
                    line-height: 1.5;
                }
                .container {
                    max-width: 1000px;
                    margin: 0 auto;
                    background: white;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.15);
                    overflow: hidden;
                }
                .sidebar {
                    background: #f9f9f9;
                    padding: 2rem;
                    width: 100%;
                }
                .main {
                    flex: 1;
                }
                header {
                    background: ${accentColor};
                    color: white;
                    padding: 2.5rem 2rem;
                    text-align: left;
                }
                header h1 {
                    font-size: 2.4rem;
                    font-weight: 900;
                    margin: 0 0 0.4rem;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }
                header h2 {
                    font-size: 1.35rem;
                    font-weight: 600;
                    margin: 0 0 1rem;
                }
                header p {
                    font-size: 0.95rem;
                    opacity: 0.95;
                    max-width: 700px;
                }
                .profile-img {
                    width: 128px;
                    height: 128px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 5px solid white;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                    margin-bottom: 1.5rem;
                }
                .section-title-sidebar {
                    font-size: 0.8rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.12em;
                    color: #333;
                    padding: 1rem 0 0.5rem;
                    border-bottom: 2px solid #ccc;
                    margin-bottom: 0.8rem;
                }
                .section-title-main {
                    font-size: 1.2rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.15em;
                    color: ${accentColor};
                    padding: 1.2rem 0 0.5rem;
                    border-bottom: 2px solid #ddd;
                    margin-bottom: 1rem;
                }
                .contact-item {
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                    margin-bottom: 0.7rem;
                    font-size: 0.9rem;
                }
                .contact-item a {
                    color: #333;
                    text-decoration: none;
                }
                .contact-item a:hover {
                    text-decoration: underline;
                }
                .skill-pill {
                    display: inline-block;
                    background: ${accentColor};
                    color: white;
                    padding: 0.35rem 0.75rem;
                    border-radius: 999px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    margin: 0.25rem 0.4rem 0.25rem 0;
                }
                .lang-bar {
                    height: 6px;
                    background: #ddd;
                    border-radius: 3px;
                    margin-top: 0.4rem;
                    overflow: hidden;
                }
                .lang-fill {
                    height: 100%;
                    background: ${accentColor};
                    border-radius: 3px;
                }
                .entry {
                    margin-bottom: 1.4rem;
                }
                .entry-header {
                    display: flex;
                    flex-direction: column;
                    gap: 0.2rem;
                    margin-bottom: 0.3rem;
                }
                .entry-title {
                    font-weight: 700;
                    font-size: 1rem;
                    color: #222;
                }
                .entry-meta {
                    font-size: 0.88rem;
                    color: #666;
                }
                .entry-subtitle {
                    font-style: italic;
                    color: #555;
                    font-size: 0.95rem;
                    margin-bottom: 0.4rem;
                }
                ul.bullets {
                    margin: 0.5rem 0;
                    padding-left: 1.3rem;
                }
                ul.bullets li {
                    margin-bottom: 0.3rem;
                    font-size: 0.92rem;
                    color: #444;
                }

                /* Responsive & Print */
                @media (min-width: 768px) {
                    .container {
                        flex-direction: row;
                    }
                    .sidebar {
                        width: 32%;
                        min-width: 280px;
                    }
                    .main {
                        width: 68%;
                    }
                    .entry-header {
                        flex-direction: row;
                        justify-content: space-between;
                        align-items: baseline;
                    }
                }
                @media print {
                    body { background: white; font-size: 10pt; }
                    .container { box-shadow: none; max-width: none; margin: 0; display: flex; flex-direction: row !important; }
                    header, .skill-pill { 
                        background: ${accentColor} !important; 
                        -webkit-print-color-adjust: exact; 
                        color-adjust: exact; 
                    }
                    header { color: white !important; }
                    a { color: inherit !important; text-decoration: none; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="container">

                <!-- SIDEBAR (Left on desktop, bottom on mobile) -->
                <aside class="sidebar">

                    ${p.image ? `<img src="${p.image}" alt="Profile" class="profile-img">` : ''}

                    <!-- Contact -->
                    ${p.email || p.phone || p.location || p.linkedin || p.website ? `
                    <div class="section-title-sidebar">Contact</div>
                    <div style="font-size:0.92rem;">
                        ${p.email ? `<div class="contact-item">${MailIcon} ${p.email}</div>` : ''}
                        ${p.phone ? `<div class="contact-item">${PhoneIcon} ${p.phone}</div>` : ''}
                        ${p.location ? `<div class="contact-item">${MapPinIcon} ${p.location}</div>` : ''}
                        ${p.linkedin ? `<div class="contact-item">${LinkedinIcon} <a href="${p.linkedin}" target="_blank">LinkedIn</a></div>` : ''}
                        ${p.website ? `<div class="contact-item">${GlobeIcon} <a href="${p.website}" target="_blank">Portfolio</a></div>` : ''}
                    </div>
                    ` : ''}

                    <!-- Skills -->
                    ${skills.length > 0 ? `
                    <div class="section-title-sidebar">Skills</div>
                    <div>
                        ${skills.map(s => `<span class="skill-pill">${s}</span>`).join('')}
                    </div>
                    ` : ''}

                    <!-- Certificates -->
                    ${certificates.length > 0 ? `
                    <div class="section-title-sidebar">Certificates</div>
                    <div style="font-size:0.9rem;">
                        ${certificates.map(c => `
                            <div style="margin-bottom:0.8rem;">
                                <div style="font-weight:600;">${c.name}</div>
                                <div style="font-size:0.85rem; color:#666;">${c.institution} - ${c.year}</div>
                            </div>
                        `).join('')}
                    </div>
                    ` : ''}

                    <!-- Languages -->
                    ${languages.length > 0 ? `
                    <div class="section-title-sidebar">Languages</div>
                    <div style="font-size:0.9rem;">
                        ${languages.map(l => {
                            const levelNum = parseInt(l.level);
                            const width = isNaN(levelNum) ? 0 : (levelNum / 5) * 100;
                            return `
                                <div style="margin-bottom:0.9rem;">
                                    <div><strong>${l.language}</strong> - ${l.level}</div>
                                    ${!isNaN(levelNum) ? `<div class="lang-bar"><div class="lang-fill" style="width:${width}%;"></div></div>` : ''}
                                </div>
                            `;
                        }).join('')}
                    </div>
                    ` : ''}

                    <!-- References -->
                    ${references.length > 0 ? `
                    <div class="section-title-sidebar">References</div>
                    <div style="font-size:0.88rem;">
                        ${references.map(r => `
                            <div style="margin-bottom:0.9rem;">
                                <div style="font-weight:700;">${r.name} (${r.title})</div>
                                <div>${r.company}</div>
                                <div>Contact: ${r.contact}</div>
                            </div>
                        `).join('')}
                    </div>
                    ` : ''}
                </aside>

                <!-- MAIN CONTENT (Right side) -->
                <main class="main">
                    <header style="background:${accentColor};">
                        <h1>${p.full_name || "Your Name"}</h1>
                        <h2>${p.profession || ""}</h2>
                        ${data.professional_summary ? `<p>${data.professional_summary.replace(/\n/g, '<br>')}</p>` : ''}
                    </header>

                    <div style="padding:2rem;">

                        <!-- Work Experience -->
                        ${experience.length > 0 ? `
                        <div>
                            <div class="section-title-main">Work Experience</div>
                            ${experience.map(exp => `
                                <div class="entry">
                                    <div class="entry-header">
                                        <div class="entry-title">${exp.position}</div>
                                        <div class="entry-meta">${formatDate(exp.start_date)} – ${exp.is_current ? 'Present' : formatDate(exp.end_date)}</div>
                                    </div>
                                    <div class="entry-subtitle">${exp.company}</div>
                                    ${exp.description ? `
                                    <ul class="bullets">
                                        ${exp.description.split('\n').filter(line => line.trim()).map(line => `<li>${line.trim()}</li>`).join('')}
                                    </ul>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                        ` : ''}

                        <!-- Achievements -->
                        ${achievements.length > 0 ? `
                        <div style="margin-top:2rem;">
                            <div class="section-title-main">Achievements</div>
                            ${achievements.map(a => `
                                <div class="entry-header" style="margin-bottom:0.5rem;">
                                    <div style="font-weight:600;">${a.title} - ${a.company || ''}</div>
                                    <div class="entry-meta">${a.year}</div>
                                </div>
                            `).join('')}
                        </div>
                        ` : ''}

                        <!-- Education -->
                        ${education.length > 0 ? `
                        <div style="margin-top:2rem;">
                            <div class="section-title-main">Education</div>
                            ${education.map(edu => `
                                <div class="entry">
                                    <div class="entry-header">
                                        <div class="entry-title">${edu.degree}${edu.field ? ` in ${edu.field}` : ''}</div>
                                        <div class="entry-meta">${formatDate(edu.graduation_date)}</div>
                                    </div>
                                    <div class="entry-subtitle">${edu.institution}</div>
                                    ${edu.gpa ? `<div style="color:#666; font-size:0.9rem;">GPA: ${edu.gpa}</div>` : ''}
                                </div>
                            `).join('')}
                        </div>
                        ` : ''}

                        <!-- Projects -->
                        ${projects.length > 0 ? `
                        <div style="margin-top:2rem;">
                            <div class="section-title-main">Project Experience</div>
                            ${projects.map(p => `
                                <div class="entry">
                                    <div class="entry-header">
                                        <div class="entry-title">${p.name}</div>
                                        <div class="entry-meta">(${p.type})</div>
                                    </div>
                                    ${p.description ? `
                                    <ul class="bullets">
                                        ${p.description.split('\n').filter(l => l.trim()).map(l => `<li>${l.trim()}</li>`).join('')}
                                    </ul>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                        ` : ''}

                    </div>
                </main>
            </div>
        </body>
        </html>
            `;
    return htmlContent;
}


/**
 * Modern Image Resume Template – Optimized for Print & PDF (Perfect CV Font Sizes)
 * @param {object} data - Your resume data
 * @param {string} accentColor - e.g. "#1e40af", "#dc2626"
 * @returns {string} Standalone HTML string
 */
function getMordernImageTemplateHtml(data, accentColor = "#1e40af") {

    const formatDate = (dateStr, justYear = false) => {
        if (!dateStr || ['present', 'current'].includes(dateStr.toLowerCase())) return 'Present';
        const [year, month] = dateStr.split("-");
        if (justYear && year) return year;
        if (year && month) {
            const date = new Date(year, parseInt(month, 10) - 1);
            return date.toLocaleString('en-us', { month: 'short', year: 'numeric' });
        }
        return dateStr;
    };

    // === ICON SVGs (colored with accentColor) ===
    const MailIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.83 1.83 0 0 1-2.06 0L2 7"/></svg>`;

    const PhoneIcon = `<img width="16" height="16" src="https://img.icons8.com/ios/50/phone--v1.png" alt="phone--v1"/>`;

    const MapPinIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;

    const LinkedinIcon = `<img width="16" height="16" src="https://img.icons8.com/ios/50/linkedin.png" alt="linkedin"/>`;

    const GlobeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>`;

    const p = data.personal_info || {};
    const experience = data.experience || [];
    const education = data.education || [];
    const projects = data.project || [];
    const skills = data.skills || [];
    const languages = data.languages || [];
    const certificates = data.certificates || [];
    const references = data.references || [];
    const achievements = data.achievements || [];

    const htmlContent =  `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${p.full_name || "Resume"} - Resume</title>
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    font-family: 'Segoe UI', Calibri, Arial, sans-serif;
                    background: #fafafa;
                    color: #222;
                    font-size: 10pt;           /* Perfect base size for CVs */
                    line-height: 1.48;
                }
                .container {
                    max-width: 1100px;
                    margin: 0 auto;
                    background: white;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
                    overflow: hidden;
                }
                .sidebar {
                    background: #f7f7f7;
                    padding: 1.8rem 1.6rem;
                }
                .main {
                    padding: 1.8rem 2.2rem;
                    flex: 1;
                }
                .profile-img {
                    width: 112px;
                    height: 112px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 4.5px solid ${accentColor};
                    box-shadow: 0 5px 15px rgba(0,0,0,0.18);
                    display: block;
                    margin: 0 auto 1.4rem;
                }
                .sidebar-header {
                    font-size: 0.875rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.11em;
                    color: ${accentColor};
                    padding-bottom: 0.35rem;
                    border-bottom: 1.5px solid ${accentColor};
                    margin: 1.3rem 0 0.75rem;
                }
                .main-header {
                    font-size: 1.025rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.13em;
                    color: #222;
                    padding-bottom: 0.4rem;
                    border-bottom: 1px solid #ddd;
                    margin: 1.6rem 0 0.9rem;
                }
                .name {
                    font-size: 1.875rem;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                    color: ${accentColor};
                    margin: 0 0 0.25rem;
                    line-height: 1.1;
                }
                .profession {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #444;
                    margin-bottom: 0.75rem;
                }
                .summary {
                    font-size: 0.875rem;
                    color: #444;
                    line-height: 1.55;
                    border-top: 1px solid #eee;
                    padding-top: 0.9rem;
                    margin-top: 0.8rem;
                }
                .contact-item {
                    font-size: 0.875rem;
                    color: #333;
                    margin-bottom: 0.55rem;
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                }
                /*.contact-item a {
                    color: #333;
                    text-decoration: none;
                    font-weight: 600;
                }*/
                .skill-pill {
                    display: inline-block;
                    background: white;
                    color: #222;
                    border: 1.3px solid ${accentColor};
                    padding: 0.32rem 0.68rem;
                    border-radius: 50px;
                    font-size: 0.73rem;
                    font-weight: 600;
                    margin: 0.22rem 0.35rem 0.22rem 0;
                }
                .lang-bar {
                    height: 5px;
                    background: #e0e0e0;
                    border-radius: 3px;
                    margin-top: 0.35rem;
                    overflow: hidden;
                }
                .lang-fill {
                    height: 100%;
                    background: ${accentColor};
                }
                .entry {
                    margin-bottom: 1.1rem;
                }
                .entry-header {
                    display: flex;
                    flex-direction: column;
                    gap: 0.15rem;
                    margin-bottom: 0.25rem;
                }
                .entry-title {
                    font-weight: 700;
                    font-size: 0.875rem;
                    color: #111;
                }
                .entry-meta {
                    font-size: 0.84rem;
                    color: #666;
                }
                .entry-subtitle {
                    font-style: italic;
                    color: #555;
                    font-size: 0.875rem;
                    margin-bottom: 0.4rem;
                }
                ul.bullets {
                    margin: 0.45rem 0;
                    padding-left: 1.25rem;
                }
                ul.bullets li {
                    margin-bottom: 0.28rem;
                    font-size: 0.89rem;
                    color: #333;
                }
                .accent-text { color: ${accentColor}; font-weight: 600; }

                /* Desktop layout */
                @media (min-width: 768px) {
                    .container { flex-direction: row; }
                    .sidebar { width: 34%; padding: 2rem 1.8rem; }
                    .main { width: 66%; }
                    .entry-header { flex-direction: row; justify-content: space-between; align-items: baseline; }
                }

                /* Print perfection */
                @media print {
                    body { background: white; font-size: 9.5pt; }
                    .container { box-shadow: none; max-width: none; margin: 0; display: flex; flex-direction: row !important; }
                    .profile-img { border: 4.5px solid ${accentColor} !important; -webkit-print-color-adjust: exact; }
                    .skill-pill { border: 1.3px solid ${accentColor} !important; background: white !important; }
                    a { color: inherit !important; text-decoration: none; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="container">

                <!-- SIDEBAR -->
                <aside class="sidebar">
                    ${p.image ? `<img src="${p.image}" alt="Profile" class="profile-img">` : ''}

                    <!-- Contact -->
                    ${(p.email || p.phone || p.location || p.linkedin || p.website) ? `
                    <div class="sidebar-header">Contact</div>
                    <div>
                        ${p.email ? `<div class="contact-item">${MailIcon} ${p.email}</div>` : ''}
                        ${p.phone ? `<div class="contact-item">${PhoneIcon} ${p.phone}</div>` : ''}
                        ${p.location ? `<div class="contact-item">${MapPinIcon} ${p.location}</div>` : ''}
                        ${p.linkedin ? `<div class="contact-item">${LinkedinIcon} <a href="${p.linkedin}">LinkedIn</a></div>` : ''}
                        ${p.website ? `<div class="contact-item">${GlobeIcon} <a href="${p.website}">Portfolio</a></div>` : ''}
                    </div>` : ''}

                    <!-- Skills -->
                    ${skills.length > 0 ? `<div class="sidebar-header">Relevant Skills</div><div>${skills.map(s => `<span class="skill-pill">${s}</span>`).join('')}</div>` : ''}

                    <!-- Languages -->
                    ${languages.length > 0 ? `<div class="sidebar-header">Languages</div><div style="margin-top:0.4rem;">${languages.map(l => {
                        const w = isNaN(parseInt(l.level)) ? 0 : (parseInt(l.level)/5)*100;
                        return `<div style="margin-bottom:0.75rem;"><strong>${l.language}</strong> — ${l.level}${!isNaN(parseInt(l.level)) ? `<div class="lang-bar"><div class="lang-fill" style="width:${w}%"></div></div>` : ''}</div>`;
                    }).join('')}</div>` : ''}

                    <!-- Certificates -->
                    ${certificates.length > 0 ? `<div class="sidebar-header">Certificates</div><div style="font-size:0.88rem;">${certificates.map(c => `<div style="margin-bottom:0.7rem;"><div class="accent-text">${c.name}</div><div style="color:#666;font-size:0.82rem;">${c.institution} — ${c.year}</div></div>`).join('')}</div>` : ''}

                    <!-- References -->
                    ${references.length > 0 ? `<div class="sidebar-header">References</div><div style="font-size:0.86rem;">${references.map(r => `<div style="margin-bottom:0.9rem;"><div class="accent-text">${r.name}</div><div>${r.title}</div><div>${r.company}</div><div style="font-style:italic;color:#555;">${r.contact}</div></div>`).join('')}</div>` : ''}
                </aside>

                <!-- MAIN CONTENT -->
                <main class="main">
                    <header>
                        <h1 class="name">${p.full_name || "Your Name"}</h1>
                        <h2 class="profession">${p.profession || ""}</h2>
                        ${data.professional_summary ? `<div class="summary">${data.professional_summary.replace(/\n/g, '<br>')}</div>` : ''}
                    </header>

                    <!-- Education -->
                    ${education.length > 0 ? `<section><div class="main-header">Educational Background</div>${education.map(edu => `<div class="entry"><div class="entry-header"><div class="entry-title" style="color:${accentColor};">${edu.degree}${edu.field ? ` in ${edu.field}` : ''}</div><div class="entry-meta">${edu.start_date ? formatDate(edu.start_date, true) + ' – ' : ''}${formatDate(edu.graduation_date, true)}</div></div><div class="entry-subtitle">${edu.institution}</div>${edu.gpa ? `<div style="color:#666;font-size:0.88rem;">Grade: ${edu.gpa}</div>` : ''}</div>`).join('')}</section>` : ''}

                    <!-- Work Experience -->
                    ${experience.length > 0 ? `<section><div class="main-header">Work Experience</div>${experience.map(exp => `<div class="entry"><div class="entry-header"><div class="entry-title">${exp.position}</div><div class="entry-meta">${formatDate(exp.start_date)} – ${exp.is_current ? 'Present' : formatDate(exp.end_date)}</div></div><div class="entry-subtitle">${exp.company}</div>${exp.description ? `<ul class="bullets">${exp.description.split('\n').filter(l=>l.trim()).map(l=>`<li>${l.trim()}</li>`).join('')}</ul>` : ''}</div>`).join('')}</section>` : ''}

                    <!-- Projects -->
                    ${projects.length > 0 ? `<section><div class="main-header">Projects Experience</div>${projects.map(p => `<div class="entry"><div class="entry-header"><div class="entry-title">${p.name}</div><div class="entry-meta">(${p.type})</div></div>${p.description ? `<ul class="bullets">${p.description.split('\n').filter(l=>l.trim()).map(l=>`<li>${l.trim()}</li>`).join('')}</ul>` : ''}</div>`).join('')}</section>` : ''}

                    <!-- Achievements -->
                    ${achievements.length > 0 ? `<section><div class="main-header">Achievements</div>${achievements.map(a => `<div class="entry-header" style="margin-bottom:0.5rem;"><div style="font-weight:600;">${a.title} ${a.company ? '– ' + a.company : ''}</div><div class="entry-meta">${a.year}</div></div>`).join('')}</section>` : ''}
                </main>
            </div>
        </body>
        </html>
            `;

    return htmlContent;
}


/**
 * Image-Accurate Modern Resume Template → Pure HTML + Inline CSS
 * Matches your React ImageAccurateTemplate exactly
 * @param {object} data - Resume data
 * @param {string} accentColor - Hex color (e.g. "#6d28d9" for purple, "#1e40af" for blue)
 * @returns {string} Standalone HTML string
 */
function getImageAccurateTemplateHtml(data, accentColor = "#6d28d9") {

    const formatDate = (dateStr) => {
        if (!dateStr || dateStr.toLowerCase() === 'present' || dateStr.toLowerCase() === 'current') return 'Present';
        const [year, month] = dateStr.split("-");
        if (year && month) {
            const date = new Date(year, parseInt(month, 10) - 1);
            return date.toLocaleString('en-us', { month: 'short', year: 'numeric' });
        }
        return year || dateStr; 
    };

     // === ICON SVGs (colored with accentColor) ===
    const MailIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.83 1.83 0 0 1-2.06 0L2 7"/></svg>`;

    const PhoneIcon = `<img width="16" height="16" src="https://img.icons8.com/ios/50/phone--v1.png" alt="phone--v1"/>`;

    const MapPinIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;

    const LinkedinIcon = `<img width="16" height="16" src="https://img.icons8.com/ios/50/linkedin.png" alt="linkedin"/>`;

    const GlobeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>`;

    const p = data.personal_info || {};
    const experience = data.experience || [];
    const projects = data.project || [];
    const education = data.education || [];
    const skills = data.skills || [];
    const languages = data.languages || [];
    const references = data.references || [];

    const contactIconItem = (iconSvg, text, href = null) => {
    const content = href 
        ? `<a href="${href}" target="_blank" style="color:#333; text-decoration:none; display:flex; align-items:center; gap:6px;">${iconSvg}<span>${text}</span></a>`
        : `<div style="display:flex; align-items:center; gap:6px;">${iconSvg}<span>${text}</span></div>`;
    return `<span style="white-space:nowrap;">${content}</span>`;
};

    // Then build contact line like this:
    const contactParts = [];
    if (p.email) contactParts.push(contactIconItem(MailIcon, p.email));
    if (p.phone) contactParts.push(contactIconItem(PhoneIcon, p.phone));
    if (p.location) contactParts.push(contactIconItem(MapPinIcon, p.location));
    if (p.linkedin) {
        const clean = 'LinkedIn';
        contactParts.push(contactIconItem(LinkedinIcon, clean, p.linkedin));
    }
    if (p.website) {
        const clean = 'Portfolio';
        contactParts.push(contactIconItem(GlobeIcon, clean, p.website));
    }

    const contactLine = contactParts.length > 0
        ? contactParts.map((item, i) => 
            `${item}${i < contactParts.length - 1 ? ' <span style="color:#999;font-weight:bold;margin:0 0.6rem;">|</span> ' : ''}`
        ).join('')
        : '';

    const htmlContent =  `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${p.full_name || "Resume"} - Resume</title>
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    font-family: 'Segoe UI', Calibri, Arial, sans-serif;
                    background: #f9f9f9;
                    color: #222;
                    font-size: 10.5pt;
                    line-height: 1.5;
                }
                .container {
                    max-width: 1100px;
                    margin: 2rem auto;
                    background: white;
                    padding: 2.8rem 3rem;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.12);
                }
                header {
                    text-align: center;
                    margin-bottom: 1rem;
                    padding-bottom: 0.5rem;
                }
                .name {
                    font-size: 2.25rem;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 0.12em;
                    color: ${accentColor};
                    margin: 0 0 0.25rem;
                }
                .profession {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #444;
                    margin-bottom: 0.75rem;
                }
                .contact-bar {
                    font-size: 0.875rem;
                    color: #444;
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: center;
                    align-items: center;
                    gap: 0.25rem 1.2rem;
                    margin-top: 0.2rem;
                }
                hr {
                    border: none;
                    border-top: 2px solid ${accentColor};
                    margin: 1.2rem 0;
                }
                .section-header {
                    font-size: 1.125rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.12em;
                    color: #222;
                    padding: 1.4rem 0 0.6rem;
                    border-bottom: 2.5px solid ${accentColor};
                    margin: 1rem 0 1rem;
                }
                .summary {
                    font-size: 0.875rem;
                    color: #444;
                    line-height: 1.6;
                    margin-bottom: 1.2rem;
                }
                .entry {
                    margin-bottom: 1.3rem;
                }
                .entry-header {
                    display: flex;
                    flex-direction: column;
                    gap: 0.2rem;
                    margin-bottom: 0.3rem;
                }
                .entry-title {
                    font-weight: 700;
                    font-size: 0.875rem;
                    color: #111;
                }
                .entry-meta {
                    font-size: 0.875rem;
                    color: #666;
                }
                .entry-subtitle {
                    font-style: italic;
                    color: #555;
                    font-size: 0.875rem;
                    margin-bottom: 0.5rem;
                }
                ul.bullets {
                    margin: 0.6rem 0;
                    padding-left: 1.4rem;
                }
                ul.bullets li {
                    margin-bottom: 0.35rem;
                    font-size: 0.875rem;
                    color: #333;
                }
                .skill-pill {
                    display: inline-block;
                    background: ${accentColor};
                    color: white;
                    padding: 0.4rem 0.75rem;
                    border-radius: 6px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    margin: 0.25rem 0.5rem 0.25rem 0;
                }
                .bottom-columns {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                    margin-top: 1.5rem;
                }
                .col-left { flex: 2; }
                .col-right { flex: 1; }

                @media (min-width: 768px) {
                    .bottom-columns { flex-direction: row; }
                    .entry-header {
                        flex-direction: row;
                        justify-content: space-between;
                        align-items: baseline;
                    }
                }
                @media print {
                    body { background: white; font-size: 10pt; }
                    .container { box-shadow: none; max-width: 1100px; margin: 0; padding: 1.5rem 1.8rem; }
                    .skill-pill { 
                        background: ${accentColor} !important; 
                        color: white !important;
                        -webkit-print-color-adjust: exact;
                        color-adjust: exact;
                    }
                    a { color: inherit; text-decoration: none; }
                }
            </style>
        </head>
        <body>
            <div class="container">

                <!-- HEADER -->
                <header>
                    <h1 class="name">${p.full_name || ""}</h1>
                    <h2 class="profession">${p.profession || ""}</h2>
                    ${contactLine ? `<div class="contact-bar">${contactLine}</div>` : ''}
                </header>
                <hr>

                <!-- PROFESSIONAL SUMMARY -->
                ${data.professional_summary ? `
                    <section>
                        <div class="section-header">Professional Summary</div>
                        <p class="summary">${data.professional_summary.replace(/\n/g, '<br>')}</p>
                    </section>
                ` : ''}

                <!-- EXPERIENCE -->
                ${experience.length > 0 ? `
                    <section>
                        <div class="section-header">Professional Experience</div>
                        ${experience.map(exp => `
                            <div class="entry">
                                <div class="entry-header">
                                    <div class="entry-title">${exp.position}</div>
                                    <div class="entry-meta">${formatDate(exp.start_date)} – ${exp.is_current ? 'Present' : formatDate(exp.end_date)}</div>
                                </div>
                                <div class="entry-subtitle">${exp.company}</div>
                                ${exp.description ? `
                                    <ul class="bullets">
                                        ${exp.description.split('\n').filter(l => l.trim()).map(l => `<li>${l.trim()}</li>`).join('')}
                                    </ul>
                                ` : ''}
                            </div>
                        `).join('')}
                    </section>
                ` : ''}

                <!-- PROJECTS -->
                ${projects.length > 0 ? `
                    <section>
                        <div class="section-header">Projects</div>
                        ${projects.map(p => `
                            <div class="entry">
                                <div class="entry-header">
                                    <div class="entry-title">${p.name}</div>
                                    <div class="entry-meta">(${p.type})</div>
                                </div>
                                ${p.description ? `
                                    <ul class="bullets">
                                        ${p.description.split('\n').filter(l => l.trim()).map(l => `<li>${l.trim()}</li>`).join('')}
                                    </ul>
                                ` : ''}
                            </div>
                        `).join('')}
                    </section>
                ` : ''}

                <!-- EDUCATION -->
                ${education.length > 0 ? `
                    <section>
                        <div class="section-header">Education</div>
                        ${education.map(edu => `
                            <div class="entry">
                                <div class="entry-header">
                                    <div class="entry-title">${edu.degree}${edu.field ? ` in ${edu.field}` : ''}</div>
                                    <div class="entry-meta"> ${formatDate(edu.graduation_date)}</div>
                                </div>
                                <div class="entry-subtitle">${edu.institution}</div>
                            </div>
                        `).join('')}
                    </section>
                ` : ''}

                <!-- BOTTOM: Skills + Languages + References -->
                <div class="bottom-columns">

                    <!-- Left: Skills + References -->
                    <div class="col-left">
                        ${skills.length > 0 ? `
                            <div class="section-header">Core Skills</div>
                            <div style="margin-top:0.5rem;">
                                ${skills.map(s => `<span class="skill-pill">${s}</span>`).join('')}
                            </div>
                        ` : ''}

                        ${references.length > 0 ? `
                            <div class="section-header">References</div>
                            <div style="columns:2; column-gap:2rem; margin-top:0.8rem; font-size:0.94rem;">
                                ${references.map(r => `
                                    <div style="break-inside:avoid; margin-bottom:1rem;">
                                        <div style="font-weight:700;color:#111;">${r.name}</div>
                                        <div>${r.title} of ${r.company}</div>
                                        <div style="font-style:italic;color:#666;">${r.contact}</div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>

                    <!-- Right: Languages -->
                    ${languages.length > 0 ? `
                        <div class="col-right">
                            <div class="section-header">Languages</div>
                            <div style="margin-top:0.6rem; font-size:0.96rem;">
                                ${languages.map(l => `<div style="margin-bottom:0.4rem;"><strong>${l.language}</strong> – ${l.level}</div>`).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>

            </div>
        </body>
        </html>
            `;

    return htmlContent;
}