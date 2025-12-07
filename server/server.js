import express from "express";
import cors from "cors";
import "dotenv/config";
import ConnectDB from "./configs/db.js";
import userRouter from "./routes/userRoute.js";
import resumeRouter from "./routes/resumeRoute.js";
import aiRouter from "./routes/aiRoute.js";
import nodemailer from "nodemailer";


const app = express();
const PORT = process.env.PORT || 3000;

// Databse connection
await ConnectDB()

app.use(express.json())
app.use(cors({
    origin: ['http://localhost:5173', process.env.FRONT_END_URL || 'https://resume-builder-one-puce.vercel.app'], 
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
}))


const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", // 👈 Host name
    port: 465,             // 👈 SSL/TLS port
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
});

app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;
    
    if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: 'Please fill in all fields.' });
    }

    try {
        // --- 1. Admin/Owner ට යන ඊමේල් පණිවිඩය (New Submission Notification) ---
        const ownerMailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.RECEIVING_EMAIL || process.env.EMAIL_USER, 
            subject: `New Contact Form Submission from ${name}`,
            text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
            html: `<h3>New Contact Message:</h3><p><strong>From:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong> ${message}</p>`
        };

        // --- 2. User ට යන ස්වයංක්‍රීය පිළිතුරු ඊමේල් පණිවිඩය (Auto-Reply) ---
        const userMailOptions = {
            from: process.env.EMAIL_USER,
            to: email, // User's email address
            subject: 'Thank You for Contacting Us! - RaptorCV Team',
            html: `
                <p><strong>Hi ${name},</strong></p>
                <p>Thank you for reaching out to us! This email confirms we have successfully received your message. Our team is currently reviewing your inquiry.</p>
                <p>We aim to respond to all messages within **24 hours**. We appreciate your patience.</p>
                <br>
                <p><strong>Here is a summary of the message you sent:</strong></p>
                <blockquote style="border-left: 3px solid #00c767; padding-left: 15px; margin: 15px 0; color: #555;">
                    "${message}"
                </blockquote>
                <br>
                <p>Thank you again for getting in touch.</p>
                <p>Best regards,</p>
                <table border="0" cellpadding="0" cellspacing="0" style="margin-top: 15px; font-family: Arial, sans-serif;">
                    <tr>
                        <td align="center" valign="middle" style="
                            width: 32px; 
                            height: 32px; 
                            border-radius: 6px; 
                            font-weight: bold; 
                            color: white; 
                            background-color: #059669; /* bg-emerald-600 */
                            font-size: 20px;
                            line-height: 1; /* අමතර padding/space ඉවත් කිරීමට */
                            padding: 0; /* padding ඉවත් කිරීමට */
                        ">
                            R
                        </td>
                        
                        <td valign="bottom" style="padding-left: 4px;"> 
                            <span style="font-size: 24px; font-weight: bold; color: #00c767;"> 
                                aptor<span style="color: #475569;">CV</span>. 
                            </span>
                        </td>
                    </tr>
                </table>
            `,
        };

        await transporter.sendMail(ownerMailOptions); // 1. ඔබට යවයි
        await transporter.sendMail(userMailOptions);  // 2. User ට යවයි (Auto-Reply)

        res.status(200).json({ success: true, message: 'Message sent successfully. Auto-reply sent.' });

    } catch (error) {
        console.error('Error sending emails:', error);
        res.status(500).json({ success: false, message: 'Failed to send messages.' });
    }
});


app.get('/', (req, res) => res.send("Server is live..."))
app.use('/api/users', userRouter)
app.use('/api/resumes', resumeRouter)
app.use('/api/ai', aiRouter)

app.listen(PORT, ()=> {
    console.log(`Server is running on port ${PORT}`);
});