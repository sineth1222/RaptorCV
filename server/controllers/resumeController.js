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
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#525252" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: -2px;">
                            <path d="M22 16.92v3a2 2 0 0 1-2 2h-3.92a2 2 0 0 1-2-2.16a2 2 0 0 0-2.3-2.3c-2.4 0-4.8-.48-7.2-1.44a15.8 15.8 0 0 1-3.48-1.78l-.34-.17a1 1 0 0 1 0-1.78l.34-.17A15.8 15.8 0 0 1 7.2 4.48a2 2 0 0 0 2.3-2.3a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3"/>
                        </svg>
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
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#525252" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: -2px;">
                            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" fill="#525252" stroke="none"/>
                            <line x1="8.5" y1="11" x2="8.5" y2="18" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
                            <circle cx="8.5" cy="7.5" r="1.5" fill="white" stroke="none"/>
                            <path d="M12.5 18v-4a2.5 2.5 0 0 1 2.5-2.5h0a2.5 2.5 0 0 1 2.5 2.5V18" stroke="white" stroke-width="2.5" stroke-linecap="round" fill="none"/>
                        </svg>
                        <span style="word-break: break-all;">${personalInfo.linkedin.replace(/(^\w+:|^)\/\//, '').replace(/\/$/, '') || 'LinkedIn'}</span>
                    </a>
                ` : ''}
                
                ${personalInfo.website ? `
                    <a target="_blank" href="${personalInfo.website}" style="display: flex; align-items: center; gap: 4px; color: inherit; text-decoration: none; word-break: break-all;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#525252" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: -2px;">
                            <circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" />
                        </svg>
                        <span style="word-break: break-all;">${personalInfo.website.replace(/(^\w+:|^)\/\//, '').replace(/\/$/, '') || 'Portfolio'}</span>
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



// =================================================================
// 📢 Helper Functions (Assistants for generateResumeHtml)
// =================================================================


/**
 * Calm Sidebar Template සඳහා HTML අන්තර්ගතය ජනනය කරයි.
 * @param {object} data - සම්පූර්ණ Resume දත්ත වස්තුව
 * @param {string} accentColor - තෝරාගත් වර්ණය (e.g., '#3b82f6')
 * @returns {string} - Styled HTML string
 */
const getCalmSidebarTemplateHtml = (data, accentColor) => {

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
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#525252" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: -2px;">
                            <path d="M22 16.92v3a2 2 0 0 1-2 2h-3.92a2 2 0 0 1-2-2.16a2 2 0 0 0-2.3-2.3c-2.4 0-4.8-.48-7.2-1.44a15.8 15.8 0 0 1-3.48-1.78l-.34-.17a1 1 0 0 1 0-1.78l.34-.17A15.8 15.8 0 0 1 7.2 4.48a2 2 0 0 0 2.3-2.3a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3"/>
                        </svg>
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
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#525252" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: -2px;">
                            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" fill="#525252" stroke="none"/>
                            <line x1="8.5" y1="11" x2="8.5" y2="18" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
                            <circle cx="8.5" cy="7.5" r="1.5" fill="white" stroke="none"/>
                            <path d="M12.5 18v-4a2.5 2.5 0 0 1 2.5-2.5h0a2.5 2.5 0 0 1 2.5 2.5V18" stroke="white" stroke-width="2.5" stroke-linecap="round" fill="none"/>
                        </svg>
                        <a href="${personalInfo.linkedin}" target="_blank" style="color: #4b5563; text-decoration: none; word-break: break-all;">
                            ${personalInfo.linkedin.replace(/(^\w+:|^)\/\//, '').replace(/\/$/, '') || 'LinkedIn'}
                        </a>
                    </div>
                ` : ''}
                ${personalInfo.website ? `
                    <div style="display: flex; align-items: flex-start; gap: 8px;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: 2px;">
                            <circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" />
                        </svg>
                        <a href="${personalInfo.website}" target="_blank" style="color: #4b5563; text-decoration: none; word-break: break-all;">
                            ${personalInfo.website.replace(/(^\w+:|^)\/\//, '').replace(/\/$/, '') || 'Portfolio'}
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
            <h1 style="font-size: 2rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; color: ${accentColor};">
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