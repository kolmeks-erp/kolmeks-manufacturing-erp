const { supabaseAdmin } = require('../config/supabase');
const CloudinaryService = require('../services/cloudinary.service');

/**
 * Helper to generate a unique human-readable RFQ number (e.g. RFQ-2026-104829)
 */
function generateRFQNumber() {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(100000 + Math.random() * 900000); // 6-digit random string
  return `RFQ-${year}-${randomSuffix}`;
}

/**
 * Submit a new B2B Request for Quotation (RFQ)
 * Route: POST /api/rfq
 */
async function submitRFQ(req, res, next) {
  const uploadedCloudinaryPublicIds = [];

  try {
    const {
      full_name,
      company,
      email,
      phone,
      country,
      requirement_type,
      other_requirement,
      project_name,
      component_name,
      description,
      estimated_quantity,
      quantity,
      unit,
      target_delivery_date,
      target_date,
      material,
      surface_finish,
      tolerance_requirements,
      hp_field,
      website_hp,
    } = req.body;

    // 1. Anti-Bot Honeypot Validation
    if (hp_field || website_hp) {
      console.warn('🤖 Spam bot submission blocked via honeypot field.');
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid submission request.',
          code: 'BOT_DETECTED',
        },
      });
    }

    // 2. Validate Required Fields
    const finalProjectName = (project_name || component_name || '').trim();
    const finalFullName = (full_name || '').trim();
    const finalCompany = (company || '').trim();
    const finalEmail = (email || '').trim();
    const finalCountry = (country || 'Finland').trim();
    const finalReqType = (requirement_type || 'CNC Machining').trim();
    const finalDescription = (description || '').trim();
    const rawQuantity = estimated_quantity !== undefined ? estimated_quantity : quantity;

    if (!finalFullName) {
      return res.status(400).json({
        success: false,
        error: { message: 'Full name is required.', code: 'MISSING_REQUIRED_FIELD' },
      });
    }
    if (!finalCompany) {
      return res.status(400).json({
        success: false,
        error: { message: 'Company name is required.', code: 'MISSING_REQUIRED_FIELD' },
      });
    }
    if (!finalEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(finalEmail)) {
      return res.status(400).json({
        success: false,
        error: { message: 'A valid business email address is required.', code: 'INVALID_EMAIL' },
      });
    }
    if (!finalProjectName) {
      return res.status(400).json({
        success: false,
        error: { message: 'Part or project name is required.', code: 'MISSING_REQUIRED_FIELD' },
      });
    }
    if (!finalDescription) {
      return res.status(400).json({
        success: false,
        error: { message: 'Project description is required.', code: 'MISSING_REQUIRED_FIELD' },
      });
    }

    // 3. Validate Quantity
    const parsedQuantity = parseInt(rawQuantity, 10);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Estimated quantity must be a positive integer.', code: 'INVALID_QUANTITY' },
      });
    }

    // 4. Validate Target Delivery Date if provided
    const finalTargetDate = target_delivery_date || target_date || null;
    if (finalTargetDate) {
      const parsedDate = new Date(finalTargetDate);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          error: { message: 'Target delivery date format is invalid.', code: 'INVALID_DATE' },
        });
      }
    }

    // 5. Generate Unique Request Number
    const rfqNumber = generateRFQNumber();

    // 6. Insert Primary RFQ Record into Supabase
    const { data: rfqRecord, error: rfqError } = await supabaseAdmin
      .from('rfqs')
      .insert({
        rfq_number: rfqNumber,
        full_name: finalFullName,
        company: finalCompany,
        email: finalEmail,
        phone: (phone || '').trim(),
        country: finalCountry,
        requirement_type: finalReqType,
        other_requirement: (other_requirement || '').trim(),
        component_name: finalProjectName,
        description: finalDescription,
        quantity: parsedQuantity,
        unit: (unit || 'Pcs').trim(),
        target_date: finalTargetDate,
        material: (material || '').trim(),
        surface_finish: (surface_finish || '').trim(),
        tolerance_requirements: (tolerance_requirements || '').trim(),
        status: 'new',
      })
      .select()
      .single();

    if (rfqError || !rfqRecord) {
      console.error('Database Error inserting RFQ:', rfqError);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Unable to register quote request in database. Please try again.',
          code: 'DATABASE_ERROR',
        },
      });
    }

    // 7. Process Uploaded Files to Cloudinary & Save Metadata
    const fileRecords = [];
    const files = req.files || [];

    if (files.length > 0) {
      for (const file of files) {
        let uploadResult = null;

        if (CloudinaryService.isConfigured()) {
          try {
            uploadResult = await CloudinaryService.uploadBuffer(file.buffer, {
              folder: `kolmeks/rfq/${rfqNumber}`,
              resource_type: 'auto',
            });
            if (uploadResult && uploadResult.public_id) {
              uploadedCloudinaryPublicIds.push(uploadResult.public_id);
            }
          } catch (uploadErr) {
            console.error(`Failed uploading file ${file.originalname} to Cloudinary:`, uploadErr);
          }
        }

        // Construct Attachment Record
        fileRecords.push({
          rfq_id: rfqRecord.id,
          file_name: file.originalname,
          original_filename: file.originalname,
          file_url: uploadResult ? uploadResult.secure_url : 'https://storage.kolmeks.com/pending-upload',
          cloudinary_public_id: uploadResult ? uploadResult.public_id : null,
          resource_type: uploadResult ? uploadResult.resource_type : 'raw',
          file_type: file.mimetype,
          mime_type: file.mimetype,
          file_size: file.size,
        });
      }

      // Save file attachment records to Supabase
      if (fileRecords.length > 0) {
        const { error: attachmentsError } = await supabaseAdmin
          .from('rfq_attachments')
          .insert(fileRecords);

        if (attachmentsError) {
          console.error('Error inserting RFQ attachments into Supabase:', attachmentsError);
          // Non-fatal warning: primary RFQ record is preserved
        }
      }
    }

    // 8. Return Success Response
    return res.status(201).json({
      success: true,
      message: 'Your Request for Quotation has been received successfully.',
      data: {
        requestNumber: rfqNumber,
        id: rfqRecord.id,
        createdAt: rfqRecord.created_at,
        filesAttachedCount: files.length,
      },
    });
  } catch (err) {
    console.error('Unhandled error in submitRFQ:', err);

    // Clean up uploaded Cloudinary files if fatal error occurred
    if (uploadedCloudinaryPublicIds.length > 0 && CloudinaryService.isConfigured()) {
      for (const publicId of uploadedCloudinaryPublicIds) {
        try {
          await CloudinaryService.deleteResource(publicId);
        } catch (cleanupErr) {
          console.error('Failed to cleanup Cloudinary file:', publicId, cleanupErr);
        }
      }
    }

    return res.status(500).json({
      success: false,
      error: {
        message: 'An unexpected internal error occurred while processing your quote request.',
        code: 'INTERNAL_SERVER_ERROR',
      },
    });
  }
}

module.exports = {
  submitRFQ,
};
