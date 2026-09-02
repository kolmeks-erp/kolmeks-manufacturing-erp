const { supabase } = require('../config/supabase');
const CloudinaryService = require('../services/cloudinary.service');

// Helper to handle error responses safely
const handleError = (res, error, customMessage = 'Document Management operation failed.') => {
  console.error(customMessage, error);
  return res.status(500).json({
    success: false,
    error: {
      message: customMessage,
      details: error.message || error,
    },
  });
};

// ==============================================================================
// 1. DOCUMENT DASHBOARD TELEMETRY & KPIs
// ==============================================================================
exports.getDashboardData = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const in30DaysStr = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0];

    const [
      totalRes,
      activeRes,
      pendingAppRes,
      expiringSoonRes,
      expiredRes,
      reviewDueRes,
      typesRes,
      categoriesRes,
    ] = await Promise.all([
      supabase.from('documents').select('id', { count: 'exact' }),
      supabase.from('documents').select('id', { count: 'exact' }).eq('is_archived', false).not('status', 'eq', 'DRAFT'),
      supabase.from('document_approvals').select('id', { count: 'exact' }).eq('status', 'PENDING'),
      supabase.from('documents').select('id', { count: 'exact' }).eq('is_archived', false).gte('expiry_date', todayStr).lte('expiry_date', in30DaysStr),
      supabase.from('documents').select('id', { count: 'exact' }).eq('is_archived', false).lt('expiry_date', todayStr),
      supabase.from('documents').select('id', { count: 'exact' }).eq('is_archived', false).lte('next_review_date', todayStr),
      supabase.from('documents').select('type_id, document_types(name)'),
      supabase.from('documents').select('category_id, document_categories(name)'),
    ]);

    // Aggregate category & type counts
    const categoryCounts = {};
    (categoriesRes.data || []).forEach((item) => {
      const name = item.document_categories?.name || 'Uncategorized';
      categoryCounts[name] = (categoryCounts[name] || 0) + 1;
    });

    const typeCounts = {};
    (typesRes.data || []).forEach((item) => {
      const name = item.document_types?.name || 'General';
      typeCounts[name] = (typeCounts[name] || 0) + 1;
    });

    return res.status(200).json({
      success: true,
      data: {
        totalDocumentsCount: totalRes.count || 0,
        activeDocumentsCount: activeRes.count || 0,
        pendingApprovalsCount: pendingAppRes.count || 0,
        expiringSoonCount: expiringSoonRes.count || 0,
        expiredCount: expiredRes.count || 0,
        reviewDueCount: reviewDueRes.count || 0,
        categoryBreakdown: categoryCounts,
        typeBreakdown: typeCounts,
      },
    });
  } catch (err) {
    return handleError(res, err, 'Failed to fetch document telemetry.');
  }
};

// ==============================================================================
// 2. DOCUMENT LIBRARY (LIST, SEARCH, FILTER, PAGINATE)
// ==============================================================================
exports.getDocuments = async (req, res) => {
  try {
    const {
      search,
      type_id,
      category_id,
      status,
      confidentiality_level,
      is_archived,
      expiring,
      limit = 50,
      offset = 0,
    } = req.query;

    let query = supabase
      .from('documents')
      .select('*, type:type_id(*), category:category_id(*), versions:document_versions(*), owner:owner_id(full_name, email)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (search) {
      query = query.or(`title.ilike.%${search}%,document_number.ilike.%${search}%,description.ilike.%${search}%`);
    }
    if (type_id) query = query.eq('type_id', type_id);
    if (category_id) query = query.eq('category_id', category_id);
    if (status) query = query.eq('status', status);
    if (confidentiality_level) query = query.eq('confidentiality_level', confidentiality_level);
    if (is_archived !== undefined) query = query.eq('is_archived', is_archived === 'true');

    const { data, count, error } = await query;
    if (error) throw error;

    // Filter current version for clean output
    const formattedData = (data || []).map((doc) => {
      const currentVer = (doc.versions || []).find((v) => v.is_current) || doc.versions?.[0] || null;
      return {
        ...doc,
        current_version: currentVer,
      };
    });

    return res.status(200).json({
      success: true,
      data: formattedData,
      pagination: {
        total: count || 0,
        limit: Number(limit),
        offset: Number(offset),
      },
    });
  } catch (err) {
    return handleError(res, err, 'Failed to list documents.');
  }
};

// ==============================================================================
// 3. DOCUMENT DETAILS BY ID (WITH FULL METADATA, VERSIONS, APPROVALS & AUDIT)
// ==============================================================================
exports.getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: doc, error: docErr } = await supabase
      .from('documents')
      .select('*, type:type_id(*), category:category_id(*), owner:owner_id(full_name, email), uploader:uploaded_by(full_name, email)')
      .eq('id', id)
      .single();

    if (docErr || !doc) {
      return res.status(404).json({ success: false, error: { message: 'Document not found.' } });
    }

    const [versionsRes, relationshipsRes, approvalsRes, auditRes] = await Promise.all([
      supabase.from('document_versions').select('*, creator:created_by(full_name)').eq('document_id', id).order('created_at', { ascending: false }),
      supabase.from('document_relationships').select('*').eq('document_id', id),
      supabase.from('document_approvals').select('*, requester:requester_id(full_name), steps:document_approval_steps(*, approver:approver_id(full_name))').eq('document_id', id).order('created_at', { ascending: false }),
      supabase.from('document_audit_logs').select('*, actor:actor_id(full_name)').eq('document_id', id).order('created_at', { ascending: false }).limit(20),
    ]);

    const versions = versionsRes.data || [];
    const currentVersion = versions.find((v) => v.is_current) || versions[0] || null;

    // Record audit viewing event
    await supabase.from('document_audit_logs').insert({
      document_id: id,
      version_id: currentVersion?.id || null,
      actor_id: req.user?.id || null,
      action: 'VIEWED',
      reason: 'Document detail accessed by authorized user',
    });

    return res.status(200).json({
      success: true,
      data: {
        ...doc,
        current_version: currentVersion,
        versions,
        relationships: relationshipsRes.data || [],
        approvals: approvalsRes.data || [],
        audit_trail: auditRes.data || [],
      },
    });
  } catch (err) {
    return handleError(res, err, 'Failed to fetch document details.');
  }
};

// ==============================================================================
// 4. CREATE DOCUMENT & UPLOAD FILE
// ==============================================================================
exports.createDocument = async (req, res) => {
  try {
    const {
      title,
      description,
      type_id,
      category_id,
      tags,
      department_id,
      confidentiality_level,
      effective_date,
      review_date,
      expiry_date,
      related_module,
      related_record_id,
      related_record_reference,
    } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, error: { message: 'Document title is required.' } });
    }

    let fileData = {
      file_name: 'document_attachment.pdf',
      file_type: 'application/pdf',
      file_size: 0,
      storage_path: 'kolmeks/documents/local_placeholder',
      storage_url: 'https://res.cloudinary.com/sh5dujco/raw/upload/v1/kolmeks/documents/sample.pdf',
    };

    if (req.file) {
      fileData.file_name = req.file.originalname;
      fileData.file_type = req.file.mimetype;
      fileData.file_size = req.file.size;

      // Upload to Cloudinary if available
      if (CloudinaryService.isConfigured()) {
        try {
          const uploadRes = await CloudinaryService.uploadBuffer(req.file.buffer, {
            folder: 'kolmeks/documents',
            resource_type: 'auto',
          });
          fileData.storage_path = uploadRes.public_id;
          fileData.storage_url = uploadRes.secure_url;
        } catch (uploadErr) {
          console.warn('Cloudinary upload warning, using local buffer metadata:', uploadErr.message);
        }
      }
    }

    // Process tags array
    let tagsArr = [];
    if (Array.isArray(tags)) tagsArr = tags;
    else if (typeof tags === 'string') tagsArr = tags.split(',').map((t) => t.trim()).filter(Boolean);

    // Calculate next review date (e.g. 1 year after review_date or created_at)
    const baseReviewDate = review_date ? new Date(review_date) : new Date();
    const nextReviewDateStr = new Date(baseReviewDate.setFullYear(baseReviewDate.getFullYear() + 1)).toISOString().split('T')[0];

    // Insert Document Header
    const { data: doc, error: docErr } = await supabase
      .from('documents')
      .insert({
        title,
        description: description || null,
        type_id: type_id || null,
        category_id: category_id || null,
        tags: tagsArr,
        owner_id: req.user?.id || null,
        department_id: department_id || null,
        uploaded_by: req.user?.id || null,
        status: 'DRAFT',
        confidentiality_level: confidentiality_level || 'INTERNAL',
        effective_date: effective_date || null,
        review_date: review_date || null,
        next_review_date: nextReviewDateStr,
        expiry_date: expiry_date || null,
      })
      .select()
      .single();

    if (docErr) throw docErr;

    // Insert Version 1.0
    const { data: ver, error: verErr } = await supabase
      .from('document_versions')
      .insert({
        document_id: doc.id,
        version_number: '1.0',
        file_name: fileData.file_name,
        file_type: fileData.file_type,
        file_size: fileData.file_size,
        storage_path: fileData.storage_path,
        storage_url: fileData.storage_url,
        change_summary: 'Initial document upload (v1.0)',
        created_by: req.user?.id || null,
        status: 'DRAFT',
        is_current: true,
      })
      .select()
      .single();

    if (verErr) throw verErr;

    // Insert Cross-Module ERP Relationship if provided
    if (related_module && related_record_id) {
      await supabase.from('document_relationships').insert({
        document_id: doc.id,
        module_name: related_module,
        record_id: related_record_id,
        record_reference: related_record_reference || related_record_id,
      });
    }

    // Record Audit Log
    await supabase.from('document_audit_logs').insert({
      document_id: doc.id,
      version_id: ver.id,
      actor_id: req.user?.id || null,
      action: 'CREATED',
      new_value: { title, document_number: doc.document_number, file_name: fileData.file_name },
      reason: 'Document created and uploaded',
    });

    return res.status(201).json({
      success: true,
      message: 'Document created successfully.',
      data: {
        ...doc,
        current_version: ver,
      },
    });
  } catch (err) {
    return handleError(res, err, 'Failed to create document.');
  }
};

// ==============================================================================
// 5. UPDATE DOCUMENT METADATA
// ==============================================================================
exports.updateDocumentMetadata = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, type_id, category_id, tags, confidentiality_level, effective_date, review_date, expiry_date } = req.body;

    const { data: oldDoc } = await supabase.from('documents').select('*').eq('id', id).single();

    let tagsArr = oldDoc?.tags || [];
    if (Array.isArray(tags)) tagsArr = tags;
    else if (typeof tags === 'string') tagsArr = tags.split(',').map((t) => t.trim()).filter(Boolean);

    const updatePayload = {
      title: title || oldDoc.title,
      description: description !== undefined ? description : oldDoc.description,
      type_id: type_id || oldDoc.type_id,
      category_id: category_id || oldDoc.category_id,
      tags: tagsArr,
      confidentiality_level: confidentiality_level || oldDoc.confidentiality_level,
      effective_date: effective_date || oldDoc.effective_date,
      review_date: review_date || oldDoc.review_date,
      expiry_date: expiry_date || oldDoc.expiry_date,
      updated_at: new Date().toISOString(),
    };

    const { data: updatedDoc, error } = await supabase
      .from('documents')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await supabase.from('document_audit_logs').insert({
      document_id: id,
      actor_id: req.user?.id || null,
      action: 'METADATA_UPDATED',
      old_value: oldDoc,
      new_value: updatedDoc,
      reason: 'Document metadata updated by user',
    });

    return res.status(200).json({
      success: true,
      message: 'Document metadata updated.',
      data: updatedDoc,
    });
  } catch (err) {
    return handleError(res, err, 'Failed to update document metadata.');
  }
};

// ==============================================================================
// 6. NEW REVISION / VERSION UPLOAD
// ==============================================================================
exports.uploadNewVersion = async (req, res) => {
  try {
    const { id } = req.params;
    const { version_number, change_summary } = req.body;

    if (!change_summary) {
      return res.status(400).json({ success: false, error: { message: 'Change summary is required for new version.' } });
    }

    // Get current version count to determine version_number if not provided
    const { data: existingVersions } = await supabase.from('document_versions').select('version_number').eq('document_id', id);
    const vCount = (existingVersions || []).length + 1;
    const newVerNum = version_number || `1.${vCount - 1}`;

    let fileData = {
      file_name: 'updated_attachment.pdf',
      file_type: 'application/pdf',
      file_size: 0,
      storage_path: 'kolmeks/documents/local_placeholder',
      storage_url: 'https://res.cloudinary.com/sh5dujco/raw/upload/v1/kolmeks/documents/sample.pdf',
    };

    if (req.file) {
      fileData.file_name = req.file.originalname;
      fileData.file_type = req.file.mimetype;
      fileData.file_size = req.file.size;

      if (CloudinaryService.isConfigured()) {
        try {
          const uploadRes = await CloudinaryService.uploadBuffer(req.file.buffer, {
            folder: 'kolmeks/documents',
            resource_type: 'auto',
          });
          fileData.storage_path = uploadRes.public_id;
          fileData.storage_url = uploadRes.secure_url;
        } catch (uploadErr) {
          console.warn('Cloudinary upload warning:', uploadErr.message);
        }
      }
    }

    // Set all previous versions is_current = false
    await supabase.from('document_versions').update({ is_current: false }).eq('document_id', id);

    // Insert new version
    const { data: ver, error } = await supabase
      .from('document_versions')
      .insert({
        document_id: id,
        version_number: newVerNum,
        file_name: fileData.file_name,
        file_type: fileData.file_type,
        file_size: fileData.file_size,
        storage_path: fileData.storage_path,
        storage_url: fileData.storage_url,
        change_summary,
        created_by: req.user?.id || null,
        status: 'DRAFT',
        is_current: true,
      })
      .select()
      .single();

    if (error) throw error;

    // Reset document status to DRAFT or SUBMITTED for re-approval
    await supabase.from('documents').update({ status: 'DRAFT', updated_at: new Date().toISOString() }).eq('id', id);

    await supabase.from('document_audit_logs').insert({
      document_id: id,
      version_id: ver.id,
      actor_id: req.user?.id || null,
      action: 'VERSION_CREATED',
      new_value: { version_number: newVerNum, change_summary, file_name: fileData.file_name },
      reason: 'New document revision created',
    });

    return res.status(201).json({
      success: true,
      message: `Version ${newVerNum} created successfully.`,
      data: ver,
    });
  } catch (err) {
    return handleError(res, err, 'Failed to upload new document version.');
  }
};

// ==============================================================================
// 7. DIGITAL APPROVAL WORKFLOW (SUBMIT, DECIDE, RESUBMIT)
// ==============================================================================
exports.submitForApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { target_role, due_date, priority, message, approval_type } = req.body;

    // Get current version
    const { data: ver } = await supabase.from('document_versions').select('id, version_number').eq('document_id', id).eq('is_current', true).single();
    if (!ver) {
      return res.status(404).json({ success: false, error: { message: 'Active document version not found.' } });
    }

    // Insert Document Approval Request
    const { data: approval, error: appErr } = await supabase
      .from('document_approvals')
      .insert({
        document_id: id,
        version_id: ver.id,
        requester_id: req.user?.id || null,
        approval_type: approval_type || 'SEQUENTIAL',
        target_role: target_role || 'DEPARTMENT_MANAGER',
        status: 'PENDING',
        due_date: due_date || null,
        priority: priority || 'MEDIUM',
        message: message || 'Please review and approve this document.',
      })
      .select()
      .single();

    if (appErr) throw appErr;

    // Insert Initial Step in Approval Pipeline
    await supabase.from('document_approval_steps').insert({
      approval_id: approval.id,
      step_number: 1,
      approver_role: target_role || 'DEPARTMENT_MANAGER',
      decision: 'PENDING',
    });

    // Update document and version statuses
    await supabase.from('documents').update({ status: 'SUBMITTED' }).eq('id', id);
    await supabase.from('document_versions').update({ status: 'SUBMITTED' }).eq('id', ver.id);

    await supabase.from('document_audit_logs').insert({
      document_id: id,
      version_id: ver.id,
      actor_id: req.user?.id || null,
      action: 'SUBMITTED_FOR_APPROVAL',
      new_value: { approval_id: approval.id, target_role, priority },
      reason: message || 'Document submitted for formal digital approval',
    });

    return res.status(201).json({
      success: true,
      message: 'Document submitted for approval.',
      data: approval,
    });
  } catch (err) {
    return handleError(res, err, 'Failed to submit document for approval.');
  }
};

exports.processApprovalDecision = async (req, res) => {
  try {
    const { approval_id } = req.params;
    const { decision, comments } = req.body; // 'APPROVED', 'REJECTED', 'CHANGES_REQUESTED'

    if (!['APPROVED', 'REJECTED', 'CHANGES_REQUESTED'].includes(decision)) {
      return res.status(400).json({ success: false, error: { message: 'Invalid approval decision value.' } });
    }

    if ((decision === 'REJECTED' || decision === 'CHANGES_REQUESTED') && !comments?.trim()) {
      return res.status(400).json({ success: false, error: { message: 'Comments/Rationale are strictly required for Rejection or Changes Requested.' } });
    }

    const { data: approval, error: appErr } = await supabase.from('document_approvals').select('*').eq('id', approval_id).single();
    if (appErr || !approval) {
      return res.status(404).json({ success: false, error: { message: 'Approval request not found.' } });
    }

    // Update step decision
    await supabase
      .from('document_approval_steps')
      .update({
        decision,
        approver_id: req.user?.id || null,
        comments: comments || null,
        decided_at: new Date().toISOString(),
      })
      .eq('approval_id', approval_id);

    // Update main approval status
    await supabase
      .from('document_approvals')
      .update({
        status: decision,
        updated_at: new Date().toISOString(),
      })
      .eq('id', approval_id);

    // Update document and version statuses
    const docStatus = decision === 'APPROVED' ? 'APPROVED' : decision;
    await supabase.from('documents').update({ status: docStatus, updated_at: new Date().toISOString() }).eq('id', approval.document_id);
    await supabase.from('document_versions').update({ status: docStatus }).eq('id', approval.version_id);

    await supabase.from('document_audit_logs').insert({
      document_id: approval.document_id,
      version_id: approval.version_id,
      actor_id: req.user?.id || null,
      action: decision,
      new_value: { decision, comments },
      reason: comments || `Approval decision recorded as ${decision}`,
    });

    return res.status(200).json({
      success: true,
      message: `Document approval decision recorded as ${decision}.`,
      data: { approval_id, decision },
    });
  } catch (err) {
    return handleError(res, err, 'Failed to process approval decision.');
  }
};

// ==============================================================================
// 8. PUBLISH & ARCHIVE WORKFLOWS
// ==============================================================================
exports.publishDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: doc, error: docErr } = await supabase.from('documents').select('status').eq('id', id).single();
    if (docErr || !doc) {
      return res.status(404).json({ success: false, error: { message: 'Document not found.' } });
    }

    const { data: ver } = await supabase.from('document_versions').select('id').eq('document_id', id).eq('is_current', true).single();

    await supabase.from('documents').update({ status: 'PUBLISHED', updated_at: new Date().toISOString() }).eq('id', id);
    if (ver) {
      await supabase.from('document_versions').update({ status: 'PUBLISHED' }).eq('id', ver.id);
    }

    await supabase.from('document_audit_logs').insert({
      document_id: id,
      version_id: ver?.id || null,
      actor_id: req.user?.id || null,
      action: 'PUBLISHED',
      reason: 'Approved document published for company-wide access',
    });

    return res.status(200).json({
      success: true,
      message: 'Document published successfully.',
    });
  } catch (err) {
    return handleError(res, err, 'Failed to publish document.');
  }
};

exports.archiveDocument = async (req, res) => {
  try {
    const { id } = req.params;

    await supabase.from('documents').update({ status: 'ARCHIVED', is_archived: true, updated_at: new Date().toISOString() }).eq('id', id);

    await supabase.from('document_audit_logs').insert({
      document_id: id,
      actor_id: req.user?.id || null,
      action: 'ARCHIVED',
      reason: 'Document moved to historical archive vault',
    });

    return res.status(200).json({
      success: true,
      message: 'Document archived successfully.',
    });
  } catch (err) {
    return handleError(res, err, 'Failed to archive document.');
  }
};

// ==============================================================================
// 9. EXPIRING & REVIEW DUE DOCUMENTS
// ==============================================================================
exports.getExpiringDocuments = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const in60DaysStr = new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString().split('T')[0];

    const [expiringSoonRes, expiredRes, reviewDueRes] = await Promise.all([
      supabase.from('documents').select('*, type:type_id(name), category:category_id(name)').eq('is_archived', false).gte('expiry_date', todayStr).lte('expiry_date', in60DaysStr).order('expiry_date', { ascending: true }),
      supabase.from('documents').select('*, type:type_id(name), category:category_id(name)').eq('is_archived', false).lt('expiry_date', todayStr).order('expiry_date', { ascending: true }),
      supabase.from('documents').select('*, type:type_id(name), category:category_id(name)').eq('is_archived', false).lte('next_review_date', todayStr).order('next_review_date', { ascending: true }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        expiringSoon: expiringSoonRes.data || [],
        expired: expiredRes.data || [],
        reviewDue: reviewDueRes.data || [],
      },
    });
  } catch (err) {
    return handleError(res, err, 'Failed to fetch expiring documents.');
  }
};

// ==============================================================================
// 10. MY APPROVAL TASKS
// ==============================================================================
exports.getMyApprovals = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('document_approvals')
      .select('*, document:document_id(id, title, document_number, confidentiality_level), version:version_id(version_number, file_name), requester:requester_id(full_name), steps:document_approval_steps(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data: data || [],
    });
  } catch (err) {
    return handleError(res, err, 'Failed to fetch approval tasks.');
  }
};

// ==============================================================================
// 11. RECENT DOCUMENTS
// ==============================================================================
exports.getRecentDocuments = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*, type:type_id(name), category:category_id(name), owner:owner_id(full_name)')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data: data || [],
    });
  } catch (err) {
    return handleError(res, err, 'Failed to fetch recent documents.');
  }
};

// ==============================================================================
// 12. DOCUMENT TYPES & CATEGORIES MANAGEMENT
// ==============================================================================
exports.getDocumentTypes = async (req, res) => {
  try {
    const { data, error } = await supabase.from('document_types').select('*').order('name');
    if (error) throw error;
    return res.status(200).json({ success: true, data: data || [] });
  } catch (err) {
    return handleError(res, err, 'Failed to fetch document types.');
  }
};

exports.createDocumentType = async (req, res) => {
  try {
    const { code, name, description, category } = req.body;
    const { data, error } = await supabase.from('document_types').insert({ code, name, description, category }).select().single();
    if (error) throw error;
    return res.status(201).json({ success: true, message: 'Document type created.', data });
  } catch (err) {
    return handleError(res, err, 'Failed to create document type.');
  }
};

exports.getDocumentCategories = async (req, res) => {
  try {
    const { data, error } = await supabase.from('document_categories').select('*').order('name');
    if (error) throw error;
    return res.status(200).json({ success: true, data: data || [] });
  } catch (err) {
    return handleError(res, err, 'Failed to fetch document categories.');
  }
};

exports.createDocumentCategory = async (req, res) => {
  try {
    const { code, name, description, parent_id } = req.body;
    const { data, error } = await supabase.from('document_categories').insert({ code, name, description, parent_id: parent_id || null }).select().single();
    if (error) throw error;
    return res.status(201).json({ success: true, message: 'Document category created.', data });
  } catch (err) {
    return handleError(res, err, 'Failed to create document category.');
  }
};

// ==============================================================================
// 13. EXECUTIVE REPORTS & CSV DATA
// ==============================================================================
exports.getDocumentReports = async (req, res) => {
  try {
    const [docsRes, approvalsRes, auditRes] = await Promise.all([
      supabase.from('documents').select('*, type:type_id(name), category:category_id(name)'),
      supabase.from('document_approvals').select('*, document:document_id(title)'),
      supabase.from('document_audit_logs').select('*, actor:actor_id(full_name)').order('created_at', { ascending: false }).limit(50),
    ]);

    const docs = docsRes.data || [];
    const approvals = approvalsRes.data || [];
    const audits = auditRes.data || [];

    return res.status(200).json({
      success: true,
      data: {
        totalCount: docs.length,
        documents: docs,
        approvals,
        recentAudits: audits,
      },
    });
  } catch (err) {
    return handleError(res, err, 'Failed to generate document reports.');
  }
};
