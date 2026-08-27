const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

/**
 * Service providing secure, server-side Cloudinary file operations
 * for RFQ attachments, CAD drawings, and technical specifications.
 */
class CloudinaryService {
  /**
   * Check if Cloudinary backend configuration is available
   * @returns {boolean}
   */
  static isConfigured() {
    return isCloudinaryConfigured;
  }

  /**
   * Upload a file buffer (e.g., from multer memory storage) to Cloudinary securely
   * @param {Buffer} fileBuffer 
   * @param {Object} [options] 
   * @returns {Promise<Object>} Cloudinary upload response object
   */
  static uploadBuffer(fileBuffer, options = {}) {
    return new Promise((resolve, reject) => {
      if (!isCloudinaryConfigured) {
        return reject(
          new Error('Cloudinary is not configured on the backend server. Missing environment credentials.')
        );
      }

      const defaultOptions = {
        folder: 'kolmeks/rfq-drawings',
        resource_type: 'auto',
        ...options,
      };

      const uploadStream = cloudinary.uploader.upload_stream(
        defaultOptions,
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload stream error:', error);
            return reject(error);
          }
          resolve(result);
        }
      );

      uploadStream.end(fileBuffer);
    });
  }

  /**
   * Upload a file from a local filesystem path to Cloudinary securely
   * @param {string} filePath 
   * @param {Object} [options] 
   * @returns {Promise<Object>} Cloudinary upload response object
   */
  static async uploadFilePath(filePath, options = {}) {
    if (!isCloudinaryConfigured) {
      throw new Error('Cloudinary is not configured on the backend server. Missing environment credentials.');
    }

    const defaultOptions = {
      folder: 'kolmeks/rfq-drawings',
      resource_type: 'auto',
      ...options,
    };

    return await cloudinary.uploader.upload(filePath, defaultOptions);
  }

  /**
   * Delete a resource from Cloudinary by public_id
   * @param {string} publicId 
   * @param {string} [resourceType='image'] 
   * @returns {Promise<Object>}
   */
  static async deleteResource(publicId, resourceType = 'image') {
    if (!isCloudinaryConfigured) {
      throw new Error('Cloudinary is not configured on the backend server. Missing environment credentials.');
    }

    return await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  }
}

module.exports = CloudinaryService;
