const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path"); // In built node package, using this we can get extensions of a  file

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/images/uploads') // Destination folder for uploads
    },
    filename: (req, file, cb) => {
        const uniqueFilename = uuidv4(); // Generating a unique filename using UUID
        cb(null, uniqueFilename + path.extname(file.originalname)); // Use the unique file name for the uploaded file
    }
});

const upload = multer({ storage: storage });

module.exports = upload;