const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

const isCloudinaryConfigured = Boolean(cloudName && apiKey && apiSecret);

if (!isCloudinaryConfigured) {
  console.warn(
    '⚠️ Warning: Cloudinary environment variables (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are missing or incomplete. Server-side upload flows will be unavailable until configured.'
  );
} else {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
};
