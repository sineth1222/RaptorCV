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
        
        // **සටහන:** මෙහිදී, `resume.toObject()` භාවිතා කළ හැක්කේ Mongoose Document එක JS Object එකක් බවට පත් කිරීමටයි.
        const resumeData = resume.toObject();

        // 2. Resume Template HTML එක ජනනය කිරීම
        // ***මෙය ඉතා වැදගත් කොටසයි***
        // ***ඔබේ Resume Template එකේ සැබෑ HTML කේතය මෙහි ඇතුළත් කළ යුතුය.***
        // ***දැනට, පහත දැක්වෙන්නේ සරල උදාහරණයක් පමණි.***
        
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
                top: '20mm',
                right: '20mm',
                bottom: '20mm',
                left: '20mm',
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

const getClassicTemplateHtml = (data, accentColor) => {
    
    // දත්ත වලට පහසුවෙන් ළඟා වීමට Destructure කරන්න
    const personalInfo = data.personal_info || {};
    const summary = data.professional_summary || '';
    const experience = data.experience || [];

    // date formatting function එකද මෙහි නැවත නිර්මාණය කළ යුතුය.
    const formatDate = (dateStr) => { /* ... formatting logic here ... */ }; 

    // JSX/Tailwind වෙනුවට HTML String එක
    return `
        <div style="max-width: 850px; margin: 0 auto; padding: 32px; background: white; color: #333; line-height: 1.6;">
            <header style="text-align: center; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 2px solid ${accentColor};">
                <h1 style="font-size: 2rem; font-weight: bold; margin-bottom: 4px; color: ${accentColor};">
                    ${personalInfo.full_name || "Your Name"}
                </h1>
                <p style="text-transform: uppercase; color: #525252; font-weight: 500; font-size: 1.125rem; letter-spacing: 0.1em; margin-bottom: 12px;">
                    ${personalInfo.profession || ""}
                </p>
                <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 16px; font-size: 0.875rem; color: #525252;">
                    ${personalInfo.email ? `<div><span style="margin-right: 4px;">&#9993;</span><span>${personalInfo.email}</span></div>` : ''}
                    ${personalInfo.phone ? `<div><span style="margin-right: 4px;">&#9742;</span><span>${personalInfo.phone}</span></div>` : ''}
                    </div>
            </header>

            ${summary ? `
                <section style="margin-bottom: 24px;">
                    <h2 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 16px; color: ${accentColor}; border-bottom: 1px solid #ccc; padding-bottom: 4px;">
                        PROFESSIONAL SUMMARY
                    </h2>
                    <p style="font-size: 0.9375rem; color: #4b5563;">${summary}</p>
                </section>
            ` : ''}

            ${experience.length > 0 ? `
                <section style="margin-bottom: 24px;">
                    <h2 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 16px; color: ${accentColor}; border-bottom: 1px solid #ccc; padding-bottom: 4px;">
                        EXPERIENCE
                    </h2>
                    ${experience.map(exp => `
                        <div style="margin-bottom: 16px; padding-bottom: 8px; border-left: 3px solid ${accentColor}; padding-left: 10px;">
                            <div style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.9375rem; margin-bottom: 4px;">
                                <h3 style="font-weight: bold; color: #1f2937; margin: 0;">${exp.job_title} at ${exp.company}</h3>
                                <span style="color: #6b7280; font-size: 0.875rem;">${formatDate(exp.start_date)} - ${formatDate(exp.end_date)}</span>
                            </div>
                            </div>
                    `).join('')}
                </section>
            ` : ''}

            </div>
    `;
};

// ... අනෙකුත් Templates සඳහා ද මෙවැනි ශ්‍රිත නිර්මාණය කළ යුතුය.