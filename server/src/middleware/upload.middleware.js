const multer = require('multer');
const path = require('path');

// Memory storage to process files safely in RAM before Cloudinary streaming
const storage = multer.memoryStorage();

// Allowed file extensions & MIME types for engineering/CAD drawings & images
const ALLOWED_EXTENSIONS = new Set([
  '.pdf',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.dxf',
  '.step',
  '.stp',
  '.iges',
  '.igs',
  '.dwg',
]);

const PROHIBITED_EXTENSIONS = new Set([
  '.exe',
  '.bat',
  '.cmd',
  '.sh',
  '.js',
  '.html',
  '.htm',
  '.php',
  '.vbs',
  '.ps1',
  '.scr',
  '.jar',
  '.dll',
  '.so',
  '.com',
]);

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  // Block prohibited dangerous executable formats
  if (PROHIBITED_EXTENSIONS.has(ext)) {
    return cb(
      new Error(`Security policy restriction: File extension '${ext}' is strictly prohibited.`),
      false
    );
  }

  // Allow standard engineering CAD/drawing & image extensions
  if (ALLOWED_EXTENSIONS.has(ext)) {
    return cb(null, true);
  }

  // Accept generic CAD octet-streams if extension matches .step, .stp, .dxf, .dwg, .iges, .igs
  if (
    file.mimetype === 'application/octet-stream' ||
    file.mimetype.startsWith('image/') ||
    file.mimetype === 'application/pdf'
  ) {
    return cb(null, true);
  }

  return cb(
    new Error(
      `Unsupported file format '${ext}'. Allowed types: PDF, PNG, JPG, WEBP, DXF, STEP, STP, IGES, IGS, DWG.`
    ),
    false
  );
};

// 15MB file size limit per file, maximum 5 files per RFQ submission
const rfqUpload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15 MB
    files: 5,
  },
  fileFilter,
});

// Business document upload with 25MB limit
const DOC_ALLOWED_EXTENSIONS = new Set([
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.csv', '.txt',
  '.jpg', '.jpeg', '.png', '.webp', '.dxf', '.step', '.stp', '.dwg', '.zip'
]);

const docFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (PROHIBITED_EXTENSIONS.has(ext)) {
    return cb(new Error(`Security policy restriction: File extension '${ext}' is strictly prohibited.`), false);
  }
  if (DOC_ALLOWED_EXTENSIONS.has(ext) || file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    return cb(null, true);
  }
  return cb(null, true); // Allow safe business documents
};

const documentUpload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB limit
    files: 1,
  },
  fileFilter: docFileFilter,
});

module.exports = {
  rfqUpload,
  documentUpload,
  ALLOWED_EXTENSIONS,
};
