import imagekit from "../configs/imageKit.js";
import Resume from "../models/Resume.js";
import fs from "fs"



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