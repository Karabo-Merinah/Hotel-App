import multer from "multer"

const storage = multer.memoryStorage()

const upload = multer({storage,
    limits: {fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, callback) => {
        if (file.mimetype === "image/jpeg" ||
            file.mimetype === "image/png" ||
            file.mimetype === "image/webp") {
            callback(null, true)
        } else {
            callback(new Error("Only JPG, PNG and WebP images are allowed."))
        }
    }
})
export default upload