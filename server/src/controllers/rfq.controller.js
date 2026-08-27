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
 * Helper to log RFQ Activity Events into rfq_activities
 */
async function logRFQActivity(rfq_id, actorProfile, activity_type, description, old_value = null, new_value = null) {
  try {
    await supabaseAdmin.from('rfq_activities').insert({
      rfq_id,
      actor_id: actorProfile?.id || null,
      actor_name: actorProfile?.full_name || 'Staff User',
      activity_type,
      description,
      old_value: old_value ? String(old_value) : null,
      new_value: new_value ? String(new_value) : null,
    });
  } catch (err) {
    console.warn('Failed to insert RFQ activity log:', err);
  }
}

/**
 * Submit a new B2B Request for Quotation (RFQ)
 * Route: POST /api/rfq
 * Public submission handler (Prompt 11)
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
        status: 'NEW',
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

    // Log initial creation activity
    await logRFQActivity(
      rfqRecord.id,
      null,
      'CREATED',
      `Public RFQ submitted by ${finalFullName} (${finalCompany})`
    );

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
        } else {
          await logRFQActivity(
            rfqRecord.id,
            null,
            'FILE_ADDED',
            `Attached ${fileRecords.length} technical file(s)`
          );
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

// ==============================================================================
// INTERNAL ERP HANDLERS (PROMPT 17)
// ==============================================================================

/**
 * GET /api/rfqs
 * Fetch paginated RFQ list with multi-field search, filters, and sorting
 */
async function getRFQs(req, res) {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);
    const search = (req.query.search || '').trim();
    const status = req.query.status || 'all';
    const requirement_type = req.query.requirement_type || 'all';
    const assigned_to = req.query.assigned_to || 'all';
    const customer_id = req.query.customer_id || 'all';
    const sortBy = req.query.sortBy || 'created_at';
    const sortOrder = req.query.sortOrder === 'asc';

    const offset = (page - 1) * limit;

    let query = supabaseAdmin.from('rfqs').select('*', { count: 'exact' });

    // Status Filter (case-insensitive)
    if (status && status !== 'all') {
      query = query.ilike('status', status);
    }

    // Requirement Type Filter
    if (requirement_type && requirement_type !== 'all') {
      query = query.eq('requirement_type', requirement_type);
    }

    // Assigned User Filter
    if (assigned_to && assigned_to !== 'all') {
      if (assigned_to === 'unassigned') {
        query = query.is('assigned_to', null);
      } else {
        query = query.eq('assigned_to', assigned_to);
      }
    }

    // Customer Filter
    if (customer_id && customer_id !== 'all') {
      if (customer_id === 'unlinked') {
        query = query.is('customer_id', null);
      } else {
        query = query.eq('customer_id', customer_id);
      }
    }

    // Search Filter
    if (search) {
      query = query.or(
        `rfq_number.ilike.%${search}%,company.ilike.%${search}%,full_name.ilike.%${search}%,email.ilike.%${search}%,component_name.ilike.%${search}%`
      );
    }

    // Sorting
    query = query.order(sortBy, { ascending: sortOrder });

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) {
      console.error('Error fetching RFQs:', error);
      return res.status(500).json({
        success: false,
        error: 'InternalServerError',
        message: 'Failed to retrieve RFQ list.',
      });
    }

    // Fetch assigned employee names & linked customer names for rendering table details
    const assignedIds = Array.from(new Set(data?.map((r) => r.assigned_to).filter(Boolean)));
    const customerIds = Array.from(new Set(data?.map((r) => r.customer_id).filter(Boolean)));

    let profilesMap = {};
    let customersMap = {};

    if (assignedIds.length > 0) {
      const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, email')
        .in('id', assignedIds);
      profiles?.forEach((p) => {
        profilesMap[p.id] = p;
      });
    }

    if (customerIds.length > 0) {
      const { data: customers } = await supabaseAdmin
        .from('customers')
        .select('id, company_name, customer_code')
        .in('id', customerIds);
      customers?.forEach((c) => {
        customersMap[c.id] = c;
      });
    }

    const formattedData = data?.map((r) => ({
      ...r,
      assigned_user: r.assigned_to ? profilesMap[r.assigned_to] || null : null,
      customer_master: r.customer_id ? customersMap[r.customer_id] || null : null,
    }));

    const total = count || 0;
    const totalPages = Math.ceil(total / limit) || 1;

    return res.status(200).json({
      success: true,
      data: formattedData || [],
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (err) {
    console.error('RFQ controller getRFQs exception:', err);
    return res.status(500).json({
      success: false,
      error: 'InternalServerError',
      message: 'An error occurred while loading RFQs.',
    });
  }
}

/**
 * GET /api/rfqs/:id
 * Fetch detailed RFQ record, including customer link, product link, assigned user, attachments, notes, and activity timeline.
 */
async function getRFQById(req, res) {
  try {
    const { id } = req.params;

    const { data: rfq, error: rfqError } = await supabaseAdmin
      .from('rfqs')
      .select('*')
      .eq('id', id)
      .single();

    if (rfqError || !rfq) {
      return res.status(404).json({
        success: false,
        error: 'NotFound',
        message: 'RFQ record not found.',
      });
    }

    // Fetch linked customer if any
    let customerMaster = null;
    if (rfq.customer_id) {
      const { data: cust } = await supabaseAdmin
        .from('customers')
        .select('*')
        .eq('id', rfq.customer_id)
        .single();
      customerMaster = cust || null;
    }

    // Fetch linked product if any
    let productMaster = null;
    if (rfq.product_id) {
      const { data: prod } = await supabaseAdmin
        .from('products')
        .select('*')
        .eq('id', rfq.product_id)
        .single();
      productMaster = prod || null;
    }

    // Fetch assigned user profile
    let assignedUser = null;
    if (rfq.assigned_to) {
      const { data: prof } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, email, role_id')
        .eq('id', rfq.assigned_to)
        .single();
      assignedUser = prof || null;
    }

    // Fetch attached files
    const { data: attachments } = await supabaseAdmin
      .from('rfq_attachments')
      .select('*')
      .eq('rfq_id', id)
      .order('created_at', { ascending: true });

    // Fetch internal notes
    const { data: notes } = await supabaseAdmin
      .from('rfq_notes')
      .select('*')
      .eq('rfq_id', id)
      .order('created_at', { ascending: false });

    // Fetch activity timeline
    const { data: activities } = await supabaseAdmin
      .from('rfq_activities')
      .select('*')
      .eq('rfq_id', id)
      .order('created_at', { ascending: false });

    return res.status(200).json({
      success: true,
      data: {
        ...rfq,
        customer_master: customerMaster,
        product_master: productMaster,
        assigned_user: assignedUser,
        attachments: attachments || [],
        notes: notes || [],
        activities: activities || [],
      },
    });
  } catch (err) {
    console.error('RFQ controller getRFQById exception:', err);
    return res.status(500).json({
      success: false,
      error: 'InternalServerError',
      message: 'Failed to load RFQ profile details.',
    });
  }
}

/**
 * PATCH /api/rfqs/:id/status
 * Change status with state transition validation & audit logging
 */
async function updateRFQStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Status parameter is required.',
      });
    }

    const normalizedStatus = status.trim().toUpperCase();

    const allowedStatuses = [
      'NEW',
      'UNDER_REVIEW',
      'NEED_MORE_INFORMATION',
      'QUOTATION_PREPARATION',
      'QUOTED',
      'APPROVED',
      'REJECTED',
      'CLOSED',
      'CANCELLED',
    ];

    if (!allowedStatuses.includes(normalizedStatus)) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: `Invalid status '${status}'. Must be one of: ${allowedStatuses.join(', ')}`,
      });
    }

    const { data: existingRfq } = await supabaseAdmin.from('rfqs').select('status').eq('id', id).single();

    const oldStatus = existingRfq?.status || 'NEW';

    const { data: updated, error } = await supabaseAdmin
      .from('rfqs')
      .update({
        status: normalizedStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating RFQ status:', error);
      return res.status(500).json({
        success: false,
        error: 'InternalServerError',
        message: 'Failed to update RFQ status.',
      });
    }

    // Log Activity
    await logRFQActivity(
      id,
      req.profile,
      'STATUS_CHANGED',
      `Changed status from ${oldStatus} to ${normalizedStatus}`,
      oldStatus,
      normalizedStatus
    );

    return res.status(200).json({
      success: true,
      data: updated,
      message: `RFQ status updated to ${normalizedStatus}.`,
    });
  } catch (err) {
    console.error('RFQ controller updateRFQStatus exception:', err);
    return res.status(500).json({
      success: false,
      error: 'InternalServerError',
      message: 'Failed to update RFQ status.',
    });
  }
}

/**
 * PATCH /api/rfqs/:id/assignment
 * Assign / unassign RFQ to an authorized staff user
 */
async function updateRFQAssignment(req, res) {
  try {
    const { id } = req.params;
    const { assigned_to } = req.body; // UUID or null

    const { data: existingRfq } = await supabaseAdmin.from('rfqs').select('assigned_to').eq('id', id).single();

    let assignedProfile = null;
    if (assigned_to) {
      const { data: prof } = await supabaseAdmin.from('profiles').select('id, full_name').eq('id', assigned_to).single();
      if (!prof) {
        return res.status(400).json({ success: false, error: 'ValidationError', message: 'Assigned profile not found.' });
      }
      assignedProfile = prof;
    }

    const { data: updated, error } = await supabaseAdmin
      .from('rfqs')
      .update({
        assigned_to: assigned_to || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating RFQ assignment:', error);
      return res.status(500).json({ success: false, error: 'InternalServerError', message: 'Failed to update assignment.' });
    }

    const desc = assignedProfile
      ? `Assigned RFQ to ${assignedProfile.full_name}`
      : 'Unassigned RFQ';

    await logRFQActivity(id, req.profile, 'ASSIGNED', desc, existingRfq?.assigned_to, assigned_to || null);

    return res.status(200).json({
      success: true,
      data: updated,
      message: desc,
    });
  } catch (err) {
    console.error('RFQ controller updateRFQAssignment exception:', err);
    return res.status(500).json({ success: false, error: 'InternalServerError', message: 'Failed to update assignment.' });
  }
}

/**
 * PATCH /api/rfqs/:id/customer
 * Link / Unlink RFQ to an existing customer master record
 */
async function linkCustomer(req, res) {
  try {
    const { id } = req.params;
    const { customer_id } = req.body; // UUID or null

    let customerObj = null;
    if (customer_id) {
      const { data: cust } = await supabaseAdmin.from('customers').select('id, company_name, customer_code').eq('id', customer_id).single();
      if (!cust) {
        return res.status(400).json({ success: false, error: 'ValidationError', message: 'Customer record not found.' });
      }
      customerObj = cust;
    }

    const { data: updated, error } = await supabaseAdmin
      .from('rfqs')
      .update({
        customer_id: customer_id || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error linking customer to RFQ:', error);
      return res.status(500).json({ success: false, error: 'InternalServerError', message: 'Failed to link customer.' });
    }

    const desc = customerObj
      ? `Linked RFQ to Customer ${customerObj.company_name} (${customerObj.customer_code})`
      : 'Unlinked Customer from RFQ';

    await logRFQActivity(id, req.profile, 'CUSTOMER_LINKED', desc, null, customer_id || null);

    return res.status(200).json({
      success: true,
      data: updated,
      message: desc,
    });
  } catch (err) {
    console.error('RFQ controller linkCustomer exception:', err);
    return res.status(500).json({ success: false, error: 'InternalServerError', message: 'Failed to link customer.' });
  }
}

/**
 * PATCH /api/rfqs/:id/product
 * Optionally link / Unlink RFQ to an existing Product Master record
 */
async function linkProduct(req, res) {
  try {
    const { id } = req.params;
    const { product_id } = req.body; // UUID or null

    let productObj = null;
    if (product_id) {
      const { data: prod } = await supabaseAdmin.from('products').select('id, name, product_code').eq('id', product_id).single();
      if (!prod) {
        return res.status(400).json({ success: false, error: 'ValidationError', message: 'Product record not found.' });
      }
      productObj = prod;
    }

    const { data: updated, error } = await supabaseAdmin
      .from('rfqs')
      .update({
        product_id: product_id || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error linking product to RFQ:', error);
      return res.status(500).json({ success: false, error: 'InternalServerError', message: 'Failed to link product.' });
    }

    const desc = productObj
      ? `Linked RFQ to Product ${productObj.name} (${productObj.product_code})`
      : 'Unlinked Product from RFQ';

    await logRFQActivity(id, req.profile, 'PRODUCT_LINKED', desc, null, product_id || null);

    return res.status(200).json({
      success: true,
      data: updated,
      message: desc,
    });
  } catch (err) {
    console.error('RFQ controller linkProduct exception:', err);
    return res.status(500).json({ success: false, error: 'InternalServerError', message: 'Failed to link product.' });
  }
}

/**
 * GET /api/rfqs/:id/notes
 * Fetch private internal team notes for RFQ
 */
async function getNotes(req, res) {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('rfq_notes')
      .select('*')
      .eq('rfq_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching RFQ notes:', error);
      return res.status(500).json({ success: false, error: 'InternalServerError', message: 'Failed to retrieve notes.' });
    }

    return res.status(200).json({ success: true, data: data || [] });
  } catch (err) {
    console.error('RFQ controller getNotes exception:', err);
    return res.status(500).json({ success: false, error: 'InternalServerError', message: 'Failed to load notes.' });
  }
}

/**
 * POST /api/rfqs/:id/notes
 * Add a private internal note to RFQ
 */
async function createNote(req, res) {
  try {
    const { id } = req.params;
    const { note } = req.body;

    if (!note || !note.trim()) {
      return res.status(400).json({ success: false, error: 'ValidationError', message: 'Note text is required.' });
    }

    const newNote = {
      rfq_id: id,
      author_id: req.profile?.id || null,
      author_name: req.profile?.full_name || 'Staff User',
      note: note.trim(),
    };

    const { data: created, error } = await supabaseAdmin
      .from('rfq_notes')
      .insert(newNote)
      .select()
      .single();

    if (error) {
      console.error('Error creating RFQ note:', error);
      return res.status(500).json({ success: false, error: 'InternalServerError', message: 'Failed to post internal note.' });
    }

    await logRFQActivity(id, req.profile, 'NOTE_ADDED', `Added internal note: "${note.trim().substring(0, 50)}..."`);

    return res.status(201).json({
      success: true,
      data: created,
      message: 'Internal note added successfully.',
    });
  } catch (err) {
    console.error('RFQ controller createNote exception:', err);
    return res.status(500).json({ success: false, error: 'InternalServerError', message: 'Failed to post note.' });
  }
}

/**
 * GET /api/rfqs/:id/activity
 * Fetch RFQ activity audit timeline
 */
async function getActivity(req, res) {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('rfq_activities')
      .select('*')
      .eq('rfq_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching RFQ activity timeline:', error);
      return res.status(500).json({ success: false, error: 'InternalServerError', message: 'Failed to retrieve timeline.' });
    }

    return res.status(200).json({ success: true, data: data || [] });
  } catch (err) {
    console.error('RFQ controller getActivity exception:', err);
    return res.status(500).json({ success: false, error: 'InternalServerError', message: 'Failed to load activity timeline.' });
  }
}

module.exports = {
  submitRFQ,
  getRFQs,
  getRFQById,
  updateRFQStatus,
  updateRFQAssignment,
  linkCustomer,
  linkProduct,
  getNotes,
  createNote,
  getActivity,
};
