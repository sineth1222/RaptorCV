import mongoose from "mongoose";


const ResumeSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    title: {type: String, default: 'Untitled Resume'},
    public: {type: Boolean, default: false},
    template: {type: String, default: 'Classic'},
    accent_color: {type: String, default: '#3B82F6'},
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
    references: [
        {
            name: { type: String },
            title: { type: String },
            company: { type: String },
            contact: { type: String },
        }
    ],
    languages: [
        {
            language: { type: String },
            level: { type: String },
        }
    ],
}, {timestamps: true, minimize: false})



const Resume = mongoose.model('Resume', ResumeSchema)

export default Resume;