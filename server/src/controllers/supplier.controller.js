const { supabaseAdmin } = require('../config/supabase');

/**
 * Controller for Supplier & Supplier Contacts Management
 */
const supplierController = {
  /**
   * GET /api/suppliers
   * Fetch supplier list with server pagination, multi-field search, status/type/country/industry filtering, and sorting.
   */
  async getSuppliers(req, res) {
    try {
      const page = parseInt(req.query.page || '1', 10);
      const limit = parseInt(req.query.limit || '10', 10);
      const search = (req.query.search || '').trim();
      const status = req.query.status || 'all';
      const country = req.query.country || 'all';
      const supplier_type = req.query.supplier_type || 'all';
      const industry = req.query.industry || 'all';
      const sortBy = req.query.sortBy || 'created_at';
      const sortOrder = req.query.sortOrder === 'asc';

      const offset = (page - 1) * limit;

      let query = supabaseAdmin.from('suppliers').select('*', { count: 'exact' });

      // Status Filter
      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      // Country Filter
      if (country && country !== 'all') {
        query = query.ilike('country', `%${country}%`);
      }

      // Supplier Type Filter
      if (supplier_type && supplier_type !== 'all') {
        query = query.eq('supplier_type', supplier_type);
      }

      // Industry Filter
      if (industry && industry !== 'all') {
        query = query.eq('industry', industry);
      }

      // Search Filter
      if (search) {
        query = query.or(
          `supplier_code.ilike.%${search}%,company_name.ilike.%${search}%,legal_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,city.ilike.%${search}%,country.ilike.%${search}%`
        );
      }

      // Sorting
      query = query.order(sortBy, { ascending: sortOrder });

      // Pagination
      query = query.range(offset, offset + limit - 1);

      const { data, count, error } = await query;

      if (error) {
        console.error('Error fetching suppliers:', error);
        return res.status(500).json({
          success: false,
          error: 'InternalServerError',
          message: 'Failed to retrieve supplier list.',
        });
      }

      const total = count || 0;
      const totalPages = Math.ceil(total / limit) || 1;

      return res.status(200).json({
        success: true,
        data: data || [],
        meta: {
          page,
          limit,
          total,
          totalPages,
        },
      });
    } catch (err) {
      console.error('Supplier controller getSuppliers exception:', err);
      return res.status(500).json({
        success: false,
        error: 'InternalServerError',
        message: 'An error occurred while loading suppliers.',
      });
    }
  },

  /**
   * GET /api/suppliers/check-duplicate
   * Soft check for duplicate suppliers by company_name, email, or website
   */
  async checkDuplicate(req, res) {
    try {
      const { company_name, email, website } = req.query;

      if (!company_name && !email && !website) {
        return res.status(200).json({ success: true, duplicates: [] });
      }

      let orConditions = [];
      if (company_name) orConditions.push(`company_name.ilike.${company_name.trim()}`);
      if (email) orConditions.push(`email.ilike.${email.trim()}`);
      if (website) orConditions.push(`website.ilike.${website.trim()}`);

      const { data, error } = await supabaseAdmin
        .from('suppliers')
        .select('id, supplier_code, company_name, email, website')
        .or(orConditions.join(','));

      if (error) {
        console.error('Error checking duplicate supplier:', error);
        return res.status(500).json({ success: false, error: 'Database error checking duplicates.' });
      }

      return res.status(200).json({
        success: true,
        duplicates: data || [],
      });
    } catch (err) {
      console.error('Supplier controller checkDuplicate exception:', err);
      return res.status(500).json({ success: false, error: 'Failed to check duplicate.' });
    }
  },

  /**
   * GET /api/suppliers/:id
   * Fetch supplier profile details and business contacts
   */
  async getSupplierById(req, res) {
    try {
      const { id } = req.params;

      const { data: supplier, error: suppError } = await supabaseAdmin
        .from('suppliers')
        .select('*')
        .eq('id', id)
        .single();

      if (suppError || !supplier) {
        return res.status(404).json({
          success: false,
          error: 'NotFound',
          message: 'Supplier master record not found.',
        });
      }

      // Fetch contacts
      const { data: contacts } = await supabaseAdmin
        .from('supplier_contacts')
        .select('*')
        .eq('supplier_id', id)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: true });

      return res.status(200).json({
        success: true,
        data: {
          ...supplier,
          contacts: contacts || [],
        },
      });
    } catch (err) {
      console.error('Supplier controller getSupplierById exception:', err);
      return res.status(500).json({
        success: false,
        error: 'InternalServerError',
        message: 'Failed to load supplier profile details.',
      });
    }
  },

  /**
   * POST /api/suppliers
   * Create a new supplier master record
   */
  async createSupplier(req, res) {
    try {
      const {
        company_name,
        legal_name,
        email,
        phone,
        website,
        country,
        state,
        city,
        postal_code,
        address,
        industry,
        supplier_type,
        status,
        notes,
      } = req.body;

      if (!company_name || !company_name.trim()) {
        return res.status(400).json({
          success: false,
          error: 'ValidationError',
          message: 'Company Name is required.',
        });
      }

      const trimmedName = company_name.trim();

      if (trimmedName.length < 2) {
        return res.status(400).json({
          success: false,
          error: 'ValidationError',
          message: 'Company Name must be at least 2 characters.',
        });
      }

      // Generate sequence supplier code
      const { data: codeResult, error: codeErr } = await supabaseAdmin.rpc('generate_next_supplier_code');

      let supplier_code = codeResult;
      if (codeErr || !supplier_code) {
        const { count } = await supabaseAdmin.from('suppliers').select('*', { count: 'exact', head: true });
        supplier_code = `SUP-${String((count || 0) + 101).padStart(6, '0')}`;
      }

      const newSupplier = {
        supplier_code,
        company_name: trimmedName,
        legal_name: legal_name ? legal_name.trim() : null,
        email: email ? email.trim().toLowerCase() : null,
        phone: phone ? phone.trim() : null,
        website: website ? website.trim() : null,
        country: country ? country.trim() : 'Finland',
        state: state ? state.trim() : null,
        city: city ? city.trim() : null,
        postal_code: postal_code ? postal_code.trim() : null,
        address: address ? address.trim() : null,
        industry: industry || 'Other',
        supplier_type: supplier_type || 'COMPONENT',
        status: status || 'active',
        notes: notes ? notes.trim() : null,
        created_by: req.profile?.id || null,
        updated_by: req.profile?.id || null,
      };

      const { data: created, error } = await supabaseAdmin
        .from('suppliers')
        .insert(newSupplier)
        .select()
        .single();

      if (error) {
        console.error('Error creating supplier:', error);
        if (error.code === '23505') {
          return res.status(409).json({
            success: false,
            error: 'ConflictError',
            message: 'A supplier with this email or supplier code already exists.',
          });
        }
        return res.status(500).json({
          success: false,
          error: 'InternalServerError',
          message: 'Failed to create supplier record.',
        });
      }

      return res.status(201).json({
        success: true,
        data: created,
        message: 'Supplier master record created successfully.',
      });
    } catch (err) {
      console.error('Supplier controller createSupplier exception:', err);
      return res.status(500).json({
        success: false,
        error: 'InternalServerError',
        message: 'An error occurred while creating supplier.',
      });
    }
  },

  /**
   * PUT /api/suppliers/:id
   * Update existing supplier information
   */
  async updateSupplier(req, res) {
    try {
      const { id } = req.params;
      const {
        company_name,
        legal_name,
        email,
        phone,
        website,
        country,
        state,
        city,
        postal_code,
        address,
        industry,
        supplier_type,
        status,
        notes,
      } = req.body;

      if (!company_name || !company_name.trim()) {
        return res.status(400).json({
          success: false,
          error: 'ValidationError',
          message: 'Company Name is required.',
        });
      }

      const updates = {
        company_name: company_name.trim(),
        legal_name: legal_name ? legal_name.trim() : null,
        email: email ? email.trim().toLowerCase() : null,
        phone: phone ? phone.trim() : null,
        website: website ? website.trim() : null,
        country: country ? country.trim() : 'Finland',
        state: state ? state.trim() : null,
        city: city ? city.trim() : null,
        postal_code: postal_code ? postal_code.trim() : null,
        address: address ? address.trim() : null,
        industry: industry || 'Other',
        supplier_type: supplier_type || 'COMPONENT',
        status: status || 'active',
        notes: notes ? notes.trim() : null,
        updated_by: req.profile?.id || null,
        updated_at: new Date().toISOString(),
      };

      const { data: updated, error } = await supabaseAdmin
        .from('suppliers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating supplier:', error);
        return res.status(500).json({
          success: false,
          error: 'InternalServerError',
          message: 'Failed to update supplier details.',
        });
      }

      return res.status(200).json({
        success: true,
        data: updated,
        message: 'Supplier profile updated successfully.',
      });
    } catch (err) {
      console.error('Supplier controller updateSupplier exception:', err);
      return res.status(500).json({
        success: false,
        error: 'InternalServerError',
        message: 'An error occurred while updating supplier.',
      });
    }
  },

  /**
   * PATCH /api/suppliers/:id/status
   * Toggle supplier status (active, inactive, blocked, pending_approval)
   */
  async patchSupplierStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['active', 'inactive', 'blocked', 'pending_approval'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'ValidationError',
          message: 'Invalid status value.',
        });
      }

      const { data: updated, error } = await supabaseAdmin
        .from('suppliers')
        .update({
          status,
          updated_by: req.profile?.id || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error toggling supplier status:', error);
        return res.status(500).json({
          success: false,
          error: 'InternalServerError',
          message: 'Failed to update supplier status.',
        });
      }

      return res.status(200).json({
        success: true,
        data: updated,
        message: `Supplier status updated to ${status}.`,
      });
    } catch (err) {
      console.error('Supplier controller patchSupplierStatus exception:', err);
      return res.status(500).json({
        success: false,
        error: 'InternalServerError',
        message: 'An error occurred while toggling status.',
      });
    }
  },

  // ==============================================================================
  // SUPPLIER CONTACTS CONTROLLERS
  // ==============================================================================

  /**
   * GET /api/suppliers/:id/contacts
   * Fetch contacts for a supplier
   */
  async getContacts(req, res) {
    try {
      const { id } = req.params;

      const { data, error } = await supabaseAdmin
        .from('supplier_contacts')
        .select('*')
        .eq('supplier_id', id)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching supplier contacts:', error);
        return res.status(500).json({
          success: false,
          error: 'InternalServerError',
          message: 'Failed to retrieve contacts for this supplier.',
        });
      }

      return res.status(200).json({
        success: true,
        data: data || [],
      });
    } catch (err) {
      console.error('Supplier controller getContacts exception:', err);
      return res.status(500).json({
        success: false,
        error: 'InternalServerError',
        message: 'Failed to load contact list.',
      });
    }
  },

  /**
   * POST /api/suppliers/:id/contacts
   * Add a business contact for a supplier
   */
  async createContact(req, res) {
    try {
      const { id: supplier_id } = req.params;
      const {
        first_name,
        last_name,
        job_title,
        email,
        phone,
        mobile,
        is_primary,
        status,
      } = req.body;

      if (!first_name || !first_name.trim() || !last_name || !last_name.trim()) {
        return res.status(400).json({
          success: false,
          error: 'ValidationError',
          message: 'First Name and Last Name are required.',
        });
      }

      const newContact = {
        supplier_id,
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        job_title: job_title ? job_title.trim() : null,
        email: email ? email.trim().toLowerCase() : null,
        phone: phone ? phone.trim() : null,
        mobile: mobile ? mobile.trim() : null,
        is_primary: Boolean(is_primary),
        status: status || 'active',
        created_by: req.profile?.id || null,
        updated_by: req.profile?.id || null,
      };

      const { data: created, error } = await supabaseAdmin
        .from('supplier_contacts')
        .insert(newContact)
        .select()
        .single();

      if (error) {
        console.error('Error creating supplier contact:', error);
        return res.status(500).json({
          success: false,
          error: 'InternalServerError',
          message: 'Failed to add supplier contact.',
        });
      }

      return res.status(201).json({
        success: true,
        data: created,
        message: 'Supplier contact added successfully.',
      });
    } catch (err) {
      console.error('Supplier controller createContact exception:', err);
      return res.status(500).json({
        success: false,
        error: 'InternalServerError',
        message: 'An error occurred while creating contact.',
      });
    }
  },

  /**
   * PUT /api/suppliers/:id/contacts/:contactId
   * Update existing supplier contact
   */
  async updateContact(req, res) {
    try {
      const { contactId } = req.params;
      const {
        first_name,
        last_name,
        job_title,
        email,
        phone,
        mobile,
        is_primary,
        status,
      } = req.body;

      if (!first_name || !first_name.trim() || !last_name || !last_name.trim()) {
        return res.status(400).json({
          success: false,
          error: 'ValidationError',
          message: 'First Name and Last Name are required.',
        });
      }

      const updates = {
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        job_title: job_title ? job_title.trim() : null,
        email: email ? email.trim().toLowerCase() : null,
        phone: phone ? phone.trim() : null,
        mobile: mobile ? mobile.trim() : null,
        is_primary: Boolean(is_primary),
        status: status || 'active',
        updated_by: req.profile?.id || null,
        updated_at: new Date().toISOString(),
      };

      const { data: updated, error } = await supabaseAdmin
        .from('supplier_contacts')
        .update(updates)
        .eq('id', contactId)
        .select()
        .single();

      if (error) {
        console.error('Error updating supplier contact:', error);
        return res.status(500).json({
          success: false,
          error: 'InternalServerError',
          message: 'Failed to update contact record.',
        });
      }

      return res.status(200).json({
        success: true,
        data: updated,
        message: 'Supplier contact updated successfully.',
      });
    } catch (err) {
      console.error('Supplier controller updateContact exception:', err);
      return res.status(500).json({
        success: false,
        error: 'InternalServerError',
        message: 'An error occurred while updating contact.',
      });
    }
  },

  /**
   * PATCH /api/suppliers/:id/contacts/:contactId/status
   * Toggle supplier contact status
   */
  async patchContactStatus(req, res) {
    try {
      const { contactId } = req.params;
      const { status } = req.body;

      if (!['active', 'inactive'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'ValidationError',
          message: 'Invalid contact status.',
        });
      }

      const { data: updated, error } = await supabaseAdmin
        .from('supplier_contacts')
        .update({
          status,
          updated_by: req.profile?.id || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', contactId)
        .select()
        .single();

      if (error) {
        console.error('Error updating contact status:', error);
        return res.status(500).json({
          success: false,
          error: 'InternalServerError',
          message: 'Failed to change contact status.',
        });
      }

      return res.status(200).json({
        success: true,
        data: updated,
        message: `Contact status changed to ${status}.`,
      });
    } catch (err) {
      console.error('Supplier controller patchContactStatus exception:', err);
      return res.status(500).json({
        success: false,
        error: 'InternalServerError',
        message: 'An error occurred while changing contact status.',
      });
    }
  },
};

module.exports = supplierController;
