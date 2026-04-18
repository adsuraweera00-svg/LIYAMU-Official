import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`);
  },
});

const createFilter = (allowedExts, allowedMimes) => (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const extOk = allowedExts.some(e => ext === `.${e}`);
  const mimeOk = allowedMimes.test(file.mimetype);
  
  if (extOk && mimeOk) {
    cb(null, true);
  } else {
    const types = allowedExts.join('|');
    cb(new Error(`Invalid file type. Allowed: ${types}`));
  }
};

// 2MB Image Limit
export const uploadProfile = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: createFilter(['jpeg', 'jpg', 'png'], /image/),
});

// 5MB PDF/Image Limit
export const uploadVerification = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: createFilter(['jpeg', 'jpg', 'png', 'pdf'], /image|pdf/),
});

// 200MB Limit (for PDF) and Image/PDF Filter for Book Uploads
export const uploadBookFiles = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter: createFilter(['jpeg', 'jpg', 'png', 'pdf'], /image|pdf/),
});

export const uploadBookPDF = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter: createFilter(['pdf'], /pdf/),
});

// 5MB Limit for Payment Slips
export const uploadSlip = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: createFilter(['jpeg', 'jpg', 'png', 'webp'], /image/),
});
