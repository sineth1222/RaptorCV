import multer from "multer";


const storage = multer.diskStorage({});

const upload = multer({storage})

export default upload;

// multer.js

/*import multer from "multer";
import path from "path";

// Multer ගබඩාව සකස් කිරීම
const storage = multer.diskStorage({
  // 1. ගොනුව තැබිය යුතු ෆෝල්ඩරය
  destination: function (req, file, cb) {
    // ගොනු තාවකාලිකව save කිරීමට 'uploads/' ෆෝල්ඩරයක් භාවිතා කරන්න
    // (මෙම ෆෝල්ඩරය ඔබේ project root එකේ තිබිය යුතුය)
    cb(null, 'uploads/'); 
  },
  
  // 2. ගොනුවට නමක් ලබා දීම
  filename: function (req, file, cb) {
    // ගොනුව අද්විතීය නමකින් save කරන්න (Date + original name)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Multer middleware එක සකස් කිරීම
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // උපරිම ගොනු ප්‍රමාණය 5MB ලෙස සීමා කිරීම (අත්‍යවශ්‍ය නොවේ, නමුත් හොඳ පුරුද්දකි)
});

export default upload;*/