const { supabaseAdmin } = require('../config/supabase');

/**
 * Controller for Customer & Customer Contacts Management
 */
const customerController = {
  /**
   * GET /api/customers
   * Fetch customer list with server pagination, search, multi-field filtering, and sorting.
   */
  async getCustomers(req, res) {
    try {
      const page = parseInt(req.query.page || '1', 10);
      const limit = parseInt(req.query.limit || '10', 10);
      const search = (req.query.search || '').trim();
      const status = req.query.status || 'all';
      const country = req.query.country || 'all';
      const industry = req.query.industry || 'all';
      const sortBy = req.query.sortBy || 'created_at';
      const sortOrder = req.query.sortOrder === 'asc';

      const offset = (page - 1) * limit;

      let query = supabaseAdmin.from('customers').select('*', { count: 'exact' });

      // Apply Status Filter
      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      // Apply Country Filter
      if (country && country !== 'all') {
        query = query.ilike('country', `%${country}%`);
      }

      // Apply Industry Filter
      if (industry && industry !== 'all') {
        query = query.eq('industry', industry);
      }

      // Apply Search Filter across multiple fields
      if (search) {
        query = query.or(
          `customer_code.ilike.%${search}%,company_name.ilike.%${search}%,legal_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,city.ilike.%${search}%,country.ilike.%${search}%`
        );
      }

      // Apply Sorting
      query = query.order(sortBy, { ascending: sortOrder });

      // Apply Pagination Range
      query = query.range(offset, offset + limit - 1);

      const { data, count, error } = await query;

      if (error) {
        console.error('Error fetching customers:', error);
        return res.status(500).json({
          success: false,
          error: 'InternalServerError',
          message: 'Failed to retrieve customer list.',
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
      console.error('Customer controller getCustomers exception:', err);
      return res.status(500).json({
        success: false,
        error: 'InternalServerError',
        message: 'An error occurred while loading customers.',
      });
    }
  },

  /**
   * GET /api/customers/check-duplicate
   * Check for potential duplicate customers by company_name, email, or website
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
        .from('customers')
        .select('id, customer_code, company_name, email, website')
        .or(orConditions.join(','));

      if (error) {
        console.error('Error checking duplicate customer:', error);
        return res.status(500).json({ success: false, error: 'Database error checking duplicates.' });
      }

      return res.status(200).json({
        success: true,
        duplicates: data || [],
      });
    } catch (err) {
      console.error('Customer controller checkDuplicate exception:', err);
      return res.status(500).json({ success: false, error: 'Failed to check duplicate.' });
    }
  },

  /**
   * GET /api/customers/:id
   * Fetch customer profile, contacts list, and recent linked RFQs
   */
  async getCustomerById(req, res) {
    try {
      const { id } = req.params;

      const { data: customer, error: custError } = await supabaseAdmin
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();

      if (custError || !customer) {
        return res.status(404).json({
          success: false,
          error: 'NotFound',
          message: 'Customer record not found.',
        });
      }

      // Fetch customer contacts
      const { data: contacts } = await supabaseAdmin
        .from('customer_contacts')
        .select('*')
        .eq('customer_id', id)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: true });

      // Fetch recent linked RFQs safely
      const { data: rfqs } = await supabaseAdmin
        .from('rfqs')
        .select('id, rfq_number, component_name, requirement_type, status, created_at')
        .eq('customer_id', id)
        .order('created_at', { ascending: false })
        .limit(5);

      return res.status(200).json({
        success: true,
        data: {
          ...customer,
          contacts: contacts || [],
          rfqs: rfqs || [],
        },
      });
    } catch (err) {
      console.error('Customer controller getCustomerById exception:', err);
      return res.status(500).json({
        success: false,
        error: 'InternalServerError',
        message: 'Failed to load customer profile details.',
      });
    }
  },

  /**
   * POST /api/customers
   * Create a new customer master record
   */
  async createCustomer(req, res) {
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
        status,
        notes,
      } = req.body;

      // Validation
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

      // Generate sequence customer code
      const { data: codeResult, error: codeErr } = await supabaseAdmin.rpc('generate_next_customer_code');
      
      let customer_code = codeResult;
      if (codeErr || !customer_code) {
        const { count } = await supabaseAdmin.from('customers').select('*', { count: 'exact', head: true });
        customer_code = `CUS-${String((count || 0) + 101).padStart(6, '0')}`;
      }

      const newCustomer = {
        customer_code,
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
        status: status || 'active',
        notes: notes ? notes.trim() : null,
        created_by: req.profile?.id || null,
        updated_by: req.profile?.id || null,
      };

      const { data: created, error } = await supabaseAdmin
        .from('customers')
        .insert(newCustomer)
        .select()
        .single();

      if (error) {
        console.error('Error creating customer:', error);
        if (error.code === '23505') {
          return res.status(409).json({
            success: false,
            error: 'ConflictError',
            message: 'A customer with this email or customer code already exists.',
          });
        }
        return res.status(500).json({
          success: false,
          error: 'InternalServerError',
          message: 'Failed to create customer record.',
        });
      }

      return res.status(201).json({
        success: true,
        data: created,
        message: 'Customer master record created successfully.',
      });
    } catch (err) {
      console.error('Customer controller createCustomer exception:', err);
      return res.status(500).json({
        success: false,
        error: 'InternalServerError',
        message: 'An error occurred while creating customer.',
      });
    }
  },

  /**
   * PUT /api/customers/:id
   * Update existing customer information
   */
  async updateCustomer(req, res) {
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
        status: status || 'active',
        notes: notes ? notes.trim() : null,
        updated_by: req.profile?.id || null,
        updated_at: new Date().toISOString(),
      };

      const { data: updated, error } = await supabaseAdmin
        .from('customers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating customer:', error);
        return res.status(500).json({
          success: false,
          error: 'InternalServerError',
          message: 'Failed to update customer details.',
        });
      }

      return res.status(200).json({
        success: true,
        data: updated,
        message: 'Customer profile updated successfully.',
      });
    } catch (err) {
      console.error('Customer controller updateCustomer exception:', err);
      return res.status(500).json({
        success: false,
        error: 'InternalServerError',
        message: 'An error occurred while updating customer.',
      });
    }
  },

  /**
   * PATCH /api/customers/:id/status
   * Activate or Deactivate customer record
   */
  async patchCustomerStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['active', 'inactive', 'blocked'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'ValidationError',
          message: 'Invalid status value. Must be active, inactive, or blocked.',
        });
      }

      const { data: updated, error } = await supabaseAdmin
        .from('customers')
        .update({
          status,
          updated_by: req.profile?.id || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error toggling customer status:', error);
        return res.status(500).json({
          success: false,
          error: 'InternalServerError',
          message: 'Failed to update customer status.',
        });
      }

      return res.status(200).json({
        success: true,
        data: updated,
        message: `Customer status updated to ${status}.`,
      });
    } catch (err) {
      console.error('Customer controller patchCustomerStatus exception:', err);
      return res.status(500).json({
        success: false,
        error: 'InternalServerError',
        message: 'An error occurred while toggling status.',
      });
    }
  },

  // ==============================================================================
  // CUSTOMER CONTACTS CONTROLLERS
  // ==============================================================================

  /**
   * GET /api/customers/:id/contacts
   * Fetch all contacts for a specific customer
   */
  async getContacts(req, res) {
    try {
      const { id } = req.params;

      const { data, error } = await supabaseAdmin
        .from('customer_contacts')
        .select('*')
        .eq('customer_id', id)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching customer contacts:', error);
        return res.status(500).json({
          success: false,
          error: 'InternalServerError',
          message: 'Failed to retrieve contacts for this customer.',
        });
      }

      return res.status(200).json({
        success: true,
        data: data || [],
      });
    } catch (err) {
      console.error('Customer controller getContacts exception:', err);
      return res.status(500).json({
        success: false,
        error: 'InternalServerError',
        message: 'Failed to load contact list.',
      });
    }
  },

  /**
   * POST /api/customers/:id/contacts
   * Add a new business contact for a customer
   */
  async createContact(req, res) {
    try {
      const { id: customer_id } = req.params;
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
        customer_id,
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
        .from('customer_contacts')
        .insert(newContact)
        .select()
        .single();

      if (error) {
        console.error('Error creating customer contact:', error);
        return res.status(500).json({
          success: false,
          error: 'InternalServerError',
          message: 'Failed to add customer contact.',
        });
      }

      return res.status(201).json({
        success: true,
        data: created,
        message: 'Contact added successfully.',
      });
    } catch (err) {
      console.error('Customer controller createContact exception:', err);
      return res.status(500).json({
        success: false,
        error: 'InternalServerError',
        message: 'An error occurred while creating contact.',
      });
    }
  },

  /**
   * PUT /api/customers/:id/contacts/:contactId
   * Update existing customer contact details
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
        .from('customer_contacts')
        .update(updates)
        .eq('id', contactId)
        .select()
        .single();

      if (error) {
        console.error('Error updating customer contact:', error);
        return res.status(500).json({
          success: false,
          error: 'InternalServerError',
          message: 'Failed to update contact record.',
        });
      }

      return res.status(200).json({
        success: true,
        data: updated,
        message: 'Contact updated successfully.',
      });
    } catch (err) {
      console.error('Customer controller updateContact exception:', err);
      return res.status(500).json({
        success: false,
        error: 'InternalServerError',
        message: 'An error occurred while updating contact.',
      });
    }
  },

  /**
   * PATCH /api/customers/:id/contacts/:contactId/status
   * Toggle contact status (active/inactive)
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
        .from('customer_contacts')
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
      console.error('Customer controller patchContactStatus exception:', err);
      return res.status(500).json({
        success: false,
        error: 'InternalServerError',
        message: 'An error occurred while changing contact status.',
      });
    }
  },
};

module.exports = customerController;
