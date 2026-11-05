import multer from "multer";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import { fileURLToPath } from "url";
import { errorHandler } from "./error.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const documentsUploadDir = path.resolve(__dirname, "../data/documents");

fs.mkdirSync(documentsUploadDir, { recursive: true });

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".pdf"];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, documentsUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 30);
    const uniqueName = `doc_${Date.now()}_${randomUUID().slice(0, 8)}_${safeBase}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext) || !ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(
      errorHandler(
        400,
        `Invalid file type for ${file.fieldname}. Only JPG, JPEG, PNG, and PDF files are accepted.`
      ),
      false
    );
  }
  cb(null, true);
};

export const documentUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB maximum
  },
});

