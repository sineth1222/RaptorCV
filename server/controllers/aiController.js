import ai from "../configs/ai.js";
import Resume from "../models/Resume.js";


//controller for enhansing a resume proffetional summary
// POST: /api/ai/enhance-pro-sum
export const enhanceProfessionalSummary = async (req, res) => {
    try {
        const { userContent } = req.body;

        if(!userContent){
            return res.status(400).json({message: 'Missing required field'})
        }

        const response = await ai.chat.completions.create({
            model: process.env.OPENAI_MODEL,
            messages: [
            {
                role: "system",
                content: "You are an expert in resume writing. Your task is to enhance the professional summary of a resume. The summary should be 1-2 sentences also highlighting key skills, experience, and career objectives. Make it compelling and ATS-friendly. and only return text no options or anything else.",
            },
            {
                role: "user",
                content: userContent,
            },
            ],
        })

        const enhancedContent = response.choices[0].message.content;
        return res.status(200).json({enhancedContent})

    } catch (error) {
        console.error("OpenAI API Error:", error);
        return res.status(400).json({message: error.message})
    }
}


//job description ai 
//POST: /api/ai/enhance-job-desc
export const enhanceJobDescription = async (req, res) => {
    try {
        const { userContent } = req.body;

        if(!userContent){
            return res.status(400).json({message: 'Missing required field'})
        }
        

        const response = await ai.chat.completions.create({
            model: process.env.OPENAI_MODEL,
            messages: [
            {
                role: "system",
                content: "You are an expert in resume writing. Your task is to enhance the job description of a resume. The job description should be 1-2 sentences also highlighting key responsibilities and achievements. Use action verbs and quantifiable results where possible. Make it compelling and ATS-friendly. and only return text no options or anything else.",
            },
            {
                role: "user",
                content: userContent,
            },
            ],
        })

        const enhancedContent = response.choices[0].message.content;
        return res.status(200).json({enhancedContent})

    } catch (error) {
        return res.status(400).json({message: error.message})
    }
}


//uploading resume dattabase
//POST: /api/ai/upload-resume
export const uploadResume = async (req, res) => {
    try {
        const { resumeText, title } = req.body;
        //console.log("Received Resume Text Length:", resumeText ? resumeText.length : 0);
        const userId = req.userId;

        if(!resumeText){
            return res.status(400).json({message: 'Missing required field'})
        }

        const systemPrompt = "You are an expert AI Agent to extract data from resume."
        const userPrompt = `extract data from this resume: ${resumeText}

        Provide data in the following JSON format with no additional text before or after: 

        {
            professional_summary: {type: String, default: ''},
            skills: [{type: String}],
            personal_info: {
                image: {type: String, default: ''},
                full_name: {type: String, default: ''},
                profession: {type: String, default: ''},
                email: {type: String, default: ''},
                phone: {type: String, default: ''},
                location: {type: String, default: ''},
                linkedin: {type: String, default: ''},
                website: {type: String, default: ''},
            },
            experience: [
                {
                    company: { type: String },
                    position: { type: String },
                    start_date: { type: String },
                    end_date: { type: String },
                    description: { type: String },
                    is_current: { type: Boolean },
                }
            ],
            project: [
                {
                    name: { type: String },
                    type: { type: String },
                    description: { type: String },
                }
            ],
            education: [
                {
                    institution: { type: String },
                    degree: { type: String },
                    field: { type: String },
                    graduation_date: { type: String },
                    gpa: { type: String },
                }
            ],
        }
        `


        const response = await ai.chat.completions.create({
            model: process.env.OPENAI_MODEL,
            messages: [
            {
                role: "system",
                content: systemPrompt,
            },
            {
                role: "user",
                content: userPrompt,
            },
            ],
            //response_format: {type: 'json-object'}
        })

        //console.log("Raw AI Response:", extractedData);

        //const extractedData = response.choices[0].message.content;
        //const parseData = JSON.parse(extractedData)
        //const newResume = await Resume.create({userId, title, ...parseData})


        const extractedData = response.choices[0].message.content; // OpenAI Client එක භාවිතා කරනවා නම්
        let cleanData = extractedData;
        if (cleanData.startsWith('```json')) {
            cleanData = cleanData.substring(7); // '```json' වල දිග 7 ක් බැවින්
        }

        if (cleanData.endsWith('```')) {
            cleanData = cleanData.substring(0, cleanData.length - 3); // '```' වල දිග 3 ක් බැවින්
        }

        cleanData = cleanData.trim(); 
        const parseData = JSON.parse(cleanData); 
        const newResume = await Resume.create({userId, title, ...parseData});


        res.json({resumeId: newResume._id})

       

    } catch (error) {
        return res.status(400).json({message: error.message})       
    }
}