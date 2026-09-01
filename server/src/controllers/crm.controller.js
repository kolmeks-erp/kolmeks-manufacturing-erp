const { supabaseAdmin } = require('../config/supabase');

// Helper to log CRM Audit entries
const logCRMAudit = async ({ entity_type, entity_id, action, description, old_values, new_values, performed_by }) => {
  try {
    await supabaseAdmin.from('crm_audit_logs').insert([{
      entity_type,
      entity_id,
      action,
      description,
      old_values: old_values ? JSON.stringify(old_values) : null,
      new_values: new_values ? JSON.stringify(new_values) : null,
      performed_by: performed_by || null,
      created_at: new Date().toISOString()
    }]);
  } catch (err) {
    console.error('CRM Audit Log Error:', err.message);
  }
};

// ==============================================================================
// 1. CRM DASHBOARD TELEMETRY
// ==============================================================================
exports.getCRMDashboardKPIs = async (req, res, next) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    // Leads KPIs
    const { data: leads, error: leadsErr } = await supabaseAdmin
      .from('crm_leads')
      .select('id, status, expected_value');
    if (leadsErr) throw leadsErr;

    const newLeads = (leads || []).filter(l => l.status === 'NEW').length;
    const qualifiedLeads = (leads || []).filter(l => l.status === 'QUALIFIED').length;
    const totalLeads = leads ? leads.length : 0;
    const convertedLeads = (leads || []).filter(l => l.status === 'CONVERTED').length;
    const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : '0';

    // Opportunities KPIs
    const { data: opps, error: oppsErr } = await supabaseAdmin
      .from('crm_opportunities')
      .select('id, stage, expected_value, probability');
    if (oppsErr) throw oppsErr;

    const openOpps = (opps || []).filter(o => !['WON', 'LOST'].includes(o.stage));
    const openOpportunitiesCount = openOpps.length;
    const totalPipelineValue = openOpps.reduce((sum, o) => sum + (parseFloat(o.expected_value) || 0), 0);
    const weightedPipelineValue = openOpps.reduce((sum, o) => {
      const val = parseFloat(o.expected_value) || 0;
      const prob = parseFloat(o.probability) || 50;
      return sum + (val * (prob / 100));
    }, 0);

    const wonDeals = (opps || []).filter(o => o.stage === 'WON').length;
    const lostDeals = (opps || []).filter(o => o.stage === 'LOST').length;

    // Followups Overdue KPI
    const { data: followups, error: fuErr } = await supabaseAdmin
      .from('crm_followups')
      .select('id, followup_date, status');
    if (fuErr) throw fuErr;

    const overdueFollowups = (followups || []).filter(f => f.followup_date < todayStr && f.status !== 'COMPLETED').length;

    // Activities Today
    const { data: activities, error: actErr } = await supabaseAdmin
      .from('crm_activities')
      .select('id, activity_date');
    if (actErr) throw actErr;

    const activitiesToday = (activities || []).filter(a => a.activity_date === todayStr).length;

    // Recent Activities
    const { data: recentActivities } = await supabaseAdmin
      .from('crm_activities')
      .select('*, customer:customers(company_name, first_name, last_name), owner:employees(first_name, last_name)')
      .order('created_at', { ascending: false })
      .limit(5);

    // Upcoming Followups
    const { data: upcomingFollowups } = await supabaseAdmin
      .from('crm_followups')
      .select('*, customer:customers(company_name, first_name, last_name), owner:employees(first_name, last_name)')
      .gte('followup_date', todayStr)
      .neq('status', 'COMPLETED')
      .order('followup_date', { ascending: true })
      .limit(5);

    res.json({
      success: true,
      data: {
        newLeads,
        qualifiedLeads,
        totalLeads,
        convertedLeads,
        conversionRate,
        openOpportunities: openOpportunitiesCount,
        totalPipelineValue,
        weightedPipelineValue,
        wonDeals,
        lostDeals,
        overdueFollowups,
        activitiesToday,
        recentActivities: recentActivities || [],
        upcomingFollowups: upcomingFollowups || [],
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==============================================================================
// 2. LEADS MANAGEMENT
// ==============================================================================
exports.getLeads = async (req, res, next) => {
  try {
    const { status, source, priority, owner_id, search, limit = 50, page = 1 } = req.query;

    let query = supabaseAdmin
      .from('crm_leads')
      .select('*, owner:employees(id, first_name, last_name, employee_code), customer:customers(id, company_name, first_name, last_name)', { count: 'exact' });

    if (status) query = query.eq('status', status);
    if (source) query = query.eq('source', source);
    if (priority) query = query.eq('priority', priority);
    if (owner_id) query = query.eq('owner_id', owner_id);
    if (search) {
      query = query.or(`lead_number.ilike.%${search}%,lead_name.ilike.%${search}%,company_name.ilike.%${search}%,contact_person.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const from = (parseInt(page) - 1) * parseInt(limit);
    const to = from + parseInt(limit) - 1;

    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({
      success: true,
      data: data || [],
      pagination: {
        total: count || 0,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil((count || 0) / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getLeadById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: lead, error } = await supabaseAdmin
      .from('crm_leads')
      .select('*, owner:employees(id, first_name, last_name, employee_code, email), customer:customers(id, customer_code, company_name, first_name, last_name, email, phone)')
      .eq('id', id)
      .single();

    if (error || !lead) {
      return res.status(404).json({ success: false, error: { message: 'Lead not found.' } });
    }

    // Related activities, tasks, followups, audit logs
    const { data: activities } = await supabaseAdmin.from('crm_activities').select('*').eq('lead_id', id).order('created_at', { ascending: false });
    const { data: tasks } = await supabaseAdmin.from('crm_tasks').select('*').eq('lead_id', id).order('due_date', { ascending: true });
    const { data: followups } = await supabaseAdmin.from('crm_followups').select('*').eq('lead_id', id).order('followup_date', { ascending: true });
    const { data: auditLogs } = await supabaseAdmin.from('crm_audit_logs').select('*').eq('entity_id', id).order('created_at', { ascending: false });

    res.json({
      success: true,
      data: {
        lead,
        activities: activities || [],
        tasks: tasks || [],
        followups: followups || [],
        auditLogs: auditLogs || [],
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.createLead = async (req, res, next) => {
  try {
    const {
      lead_name,
      company_name,
      contact_person,
      email,
      phone,
      source = 'Website',
      owner_id,
      customer_id,
      priority = 'NORMAL',
      expected_value = 0,
      requirement,
      product_interest,
      notes,
    } = req.body;

    if (!lead_name) {
      return res.status(400).json({ success: false, error: { message: 'Lead name is required.' } });
    }

    // Sequence generator for lead_number
    const { data: numRes } = await supabaseAdmin.rpc('generate_next_lead_number');
    const lead_number = numRes || `LEAD-${Date.now()}`;

    const newLead = {
      lead_number,
      lead_name,
      company_name,
      contact_person,
      email,
      phone,
      source,
      owner_id: owner_id || null,
      customer_id: customer_id || null,
      status: 'NEW',
      priority,
      expected_value: parseFloat(expected_value) || 0,
      requirement,
      product_interest,
      notes,
      created_by: req.user?.id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin.from('crm_leads').insert([newLead]).select().single();
    if (error) throw error;

    await logCRMAudit({
      entity_type: 'LEAD',
      entity_id: data.id,
      action: 'CREATED',
      description: `Created new lead ${data.lead_number} - ${data.lead_name}`,
      new_values: data,
      performed_by: req.user?.id,
    });

    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.updateLead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      lead_name,
      company_name,
      contact_person,
      email,
      phone,
      source,
      owner_id,
      customer_id,
      status,
      priority,
      expected_value,
      requirement,
      product_interest,
      notes,
      next_followup_date,
    } = req.body;

    const { data: existing, error: getErr } = await supabaseAdmin.from('crm_leads').select('*').eq('id', id).single();
    if (getErr || !existing) {
      return res.status(404).json({ success: false, error: { message: 'Lead not found.' } });
    }

    const updates = {
      ...(lead_name !== undefined && { lead_name }),
      ...(company_name !== undefined && { company_name }),
      ...(contact_person !== undefined && { contact_person }),
      ...(email !== undefined && { email }),
      ...(phone !== undefined && { phone }),
      ...(source !== undefined && { source }),
      ...(owner_id !== undefined && { owner_id }),
      ...(customer_id !== undefined && { customer_id }),
      ...(status !== undefined && { status }),
      ...(priority !== undefined && { priority }),
      ...(expected_value !== undefined && { expected_value: parseFloat(expected_value) || 0 }),
      ...(requirement !== undefined && { requirement }),
      ...(product_interest !== undefined && { product_interest }),
      ...(notes !== undefined && { notes }),
      ...(next_followup_date !== undefined && { next_followup_date }),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin.from('crm_leads').update(updates).eq('id', id).select().single();
    if (error) throw error;

    await logCRMAudit({
      entity_type: 'LEAD',
      entity_id: id,
      action: 'UPDATED',
      description: `Updated lead ${data.lead_number}`,
      old_values: existing,
      new_values: data,
      performed_by: req.user?.id,
    });

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.qualifyLead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { qualification_status = 'QUALIFIED', expected_value, expected_close_date, requirement, product_interest, notes } = req.body;

    const { data: existing, error: getErr } = await supabaseAdmin.from('crm_leads').select('*').eq('id', id).single();
    if (getErr || !existing) {
      return res.status(404).json({ success: false, error: { message: 'Lead not found.' } });
    }

    const updates = {
      status: 'QUALIFIED',
      qualification_status,
      ...(expected_value !== undefined && { expected_value: parseFloat(expected_value) || 0 }),
      ...(expected_close_date !== undefined && { expected_close_date }),
      ...(requirement !== undefined && { requirement }),
      ...(product_interest !== undefined && { product_interest }),
      ...(notes !== undefined && { notes }),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin.from('crm_leads').update(updates).eq('id', id).select().single();
    if (error) throw error;

    await logCRMAudit({
      entity_type: 'LEAD',
      entity_id: id,
      action: 'QUALIFIED',
      description: `Qualified lead ${data.lead_number}`,
      old_values: existing,
      new_values: data,
      performed_by: req.user?.id,
    });

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// Lead Conversion Engine (With Duplicate Customer Verification & Atomic Transaction)
exports.convertLead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      customer_option = 'NEW', // 'EXISTING' or 'NEW'
      existing_customer_id,
      new_customer_data = {},
      create_opportunity = true,
      opportunity_data = {},
      force_create = false, // Override duplicate warning if user confirms
    } = req.body;

    const { data: lead, error: leadErr } = await supabaseAdmin.from('crm_leads').select('*').eq('id', id).single();
    if (leadErr || !lead) {
      return res.status(404).json({ success: false, error: { message: 'Lead not found.' } });
    }

    if (lead.status === 'CONVERTED') {
      return res.status(400).json({ success: false, error: { message: 'Lead is already converted.' } });
    }

    let finalCustomerId = existing_customer_id;
    let finalContactId = null;

    if (customer_option === 'NEW') {
      const compName = new_customer_data.company_name || lead.company_name || lead.lead_name;
      const email = new_customer_data.email || lead.email;
      const phone = new_customer_data.phone || lead.phone;

      // Duplicate Customer Check
      if (!force_create) {
        let dupQuery = supabaseAdmin.from('customers').select('id, customer_code, company_name, first_name, last_name, email, phone');
        const conditions = [];
        if (email) conditions.push(`email.ilike.${email}`);
        if (phone) conditions.push(`phone.ilike.${phone}`);
        if (compName) conditions.push(`company_name.ilike.${compName}`);

        if (conditions.length > 0) {
          dupQuery = dupQuery.or(conditions.join(','));
          const { data: dupMatches } = await dupQuery;
          if (dupMatches && dupMatches.length > 0) {
            return res.status(409).json({
              success: false,
              isDuplicateWarning: true,
              message: 'Potential duplicate customer records found matching this company name, email, or phone number.',
              duplicates: dupMatches,
            });
          }
        }
      }

      // Generate customer_code
      const { data: cusCode } = await supabaseAdmin.rpc('generate_next_customer_code');
      const newCustomer = {
        customer_code: cusCode || `CUS-${Date.now()}`,
        company_name: compName,
        first_name: new_customer_data.first_name || lead.contact_person || lead.lead_name,
        last_name: new_customer_data.last_name || '',
        email,
        phone,
        industry: new_customer_data.industry || 'Manufacturing',
        segment: new_customer_data.segment || 'SMB',
        status: 'active',
        relationship_owner_id: lead.owner_id || null,
        created_by: req.user?.id || null,
      };

      const { data: createdCus, error: cusErr } = await supabaseAdmin.from('customers').insert([newCustomer]).select().single();
      if (cusErr) throw cusErr;
      finalCustomerId = createdCus.id;

      // Create primary customer contact
      if (lead.contact_person || email || phone) {
        const contactNameParts = (lead.contact_person || lead.lead_name).split(' ');
        const { data: createdContact } = await supabaseAdmin.from('customer_contacts').insert([{
          customer_id: finalCustomerId,
          first_name: contactNameParts[0] || 'Primary',
          last_name: contactNameParts.slice(1).join(' ') || 'Contact',
          email,
          phone,
          is_primary: true,
          status: 'active',
          created_by: req.user?.id || null,
        }]).select().single();
        if (createdContact) finalContactId = createdContact.id;
      }
    }

    // Create Opportunity if requested
    let finalOppId = null;
    if (create_opportunity) {
      const { data: oppNum } = await supabaseAdmin.rpc('generate_next_opp_number');
      const newOpp = {
        opportunity_number: oppNum || `OPP-${Date.now()}`,
        name: opportunity_data.name || `${lead.company_name || lead.lead_name} - Project Opportunity`,
        customer_id: finalCustomerId,
        contact_id: finalContactId,
        lead_id: id,
        owner_id: lead.owner_id || null,
        expected_value: parseFloat(opportunity_data.expected_value || lead.expected_value) || 0,
        probability: parseFloat(opportunity_data.probability) || 50,
        expected_close_date: opportunity_data.expected_close_date || lead.expected_close_date || null,
        stage: opportunity_data.stage || 'QUALIFICATION',
        priority: opportunity_data.priority || lead.priority || 'NORMAL',
        source: lead.source || 'Website',
        notes: opportunity_data.notes || lead.notes || '',
        created_by: req.user?.id || null,
      };

      const { data: createdOpp, error: oppErr } = await supabaseAdmin.from('crm_opportunities').insert([newOpp]).select().single();
      if (oppErr) throw oppErr;
      finalOppId = createdOpp.id;
    }

    // Update Lead to CONVERTED
    const leadUpdates = {
      status: 'CONVERTED',
      converted_customer_id: finalCustomerId,
      converted_opportunity_id: finalOppId,
      converted_at: new Date().toISOString(),
      converted_by: req.user?.id || null,
      updated_at: new Date().toISOString(),
    };

    const { data: updatedLead, error: leadUpdateErr } = await supabaseAdmin.from('crm_leads').update(leadUpdates).eq('id', id).select().single();
    if (leadUpdateErr) throw leadUpdateErr;

    await logCRMAudit({
      entity_type: 'LEAD',
      entity_id: id,
      action: 'CONVERTED',
      description: `Converted lead ${lead.lead_number} to Customer and Opportunity`,
      old_values: lead,
      new_values: updatedLead,
      performed_by: req.user?.id,
    });

    res.json({
      success: true,
      message: 'Lead converted successfully!',
      data: {
        lead: updatedLead,
        customer_id: finalCustomerId,
        opportunity_id: finalOppId,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==============================================================================
// 3. OPPORTUNITIES MANAGEMENT & PIPELINE
// ==============================================================================
exports.getOpportunities = async (req, res, next) => {
  try {
    const { stage, owner_id, customer_id, priority, search, limit = 50, page = 1 } = req.query;

    let query = supabaseAdmin
      .from('crm_opportunities')
      .select('*, customer:customers(id, company_name, first_name, last_name), contact:customer_contacts(id, first_name, last_name, email, phone), owner:employees(id, first_name, last_name, employee_code), quotation:quotations(id, quotation_number), sales_order:sales_orders(id, order_number)', { count: 'exact' });

    if (stage) query = query.eq('stage', stage);
    if (owner_id) query = query.eq('owner_id', owner_id);
    if (customer_id) query = query.eq('customer_id', customer_id);
    if (priority) query = query.eq('priority', priority);
    if (search) {
      query = query.or(`opportunity_number.ilike.%${search}%,name.ilike.%${search}%`);
    }

    const from = (parseInt(page) - 1) * parseInt(limit);
    const to = from + parseInt(limit) - 1;

    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    const enriched = (data || []).map(o => {
      const expVal = parseFloat(o.expected_value) || 0;
      const prob = parseFloat(o.probability) || 0;
      return {
        ...o,
        forecast_value: expVal * (prob / 100),
      };
    });

    res.json({
      success: true,
      data: enriched,
      pagination: {
        total: count || 0,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil((count || 0) / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getOpportunityById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: opp, error } = await supabaseAdmin
      .from('crm_opportunities')
      .select('*, customer:customers(id, customer_code, company_name, first_name, last_name, email, phone), contact:customer_contacts(id, first_name, last_name, email, phone), owner:employees(id, first_name, last_name, employee_code), quotation:quotations(id, quotation_number, grand_total, status), sales_order:sales_orders(id, order_number, grand_total, status)')
      .eq('id', id)
      .single();

    if (error || !opp) {
      return res.status(404).json({ success: false, error: { message: 'Opportunity not found.' } });
    }

    const expVal = parseFloat(opp.expected_value) || 0;
    const prob = parseFloat(opp.probability) || 0;
    const enrichedOpp = {
      ...opp,
      forecast_value: expVal * (prob / 100),
    };

    const { data: activities } = await supabaseAdmin.from('crm_activities').select('*').eq('opportunity_id', id).order('created_at', { ascending: false });
    const { data: tasks } = await supabaseAdmin.from('crm_tasks').select('*').eq('opportunity_id', id).order('due_date', { ascending: true });
    const { data: followups } = await supabaseAdmin.from('crm_followups').select('*').eq('opportunity_id', id).order('followup_date', { ascending: true });
    const { data: auditLogs } = await supabaseAdmin.from('crm_audit_logs').select('*').eq('entity_id', id).order('created_at', { ascending: false });

    res.json({
      success: true,
      data: {
        opportunity: enrichedOpp,
        activities: activities || [],
        tasks: tasks || [],
        followups: followups || [],
        auditLogs: auditLogs || [],
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.createOpportunity = async (req, res, next) => {
  try {
    const {
      name,
      customer_id,
      contact_id,
      lead_id,
      owner_id,
      expected_value = 0,
      probability = 50,
      expected_close_date,
      stage = 'QUALIFICATION',
      priority = 'NORMAL',
      source = 'Direct',
      notes,
    } = req.body;

    if (!name || !customer_id) {
      return res.status(400).json({ success: false, error: { message: 'Opportunity name and customer are required.' } });
    }

    const { data: oppNum } = await supabaseAdmin.rpc('generate_next_opp_number');
    const opportunity_number = oppNum || `OPP-${Date.now()}`;

    const newOpp = {
      opportunity_number,
      name,
      customer_id,
      contact_id: contact_id || null,
      lead_id: lead_id || null,
      owner_id: owner_id || null,
      expected_value: parseFloat(expected_value) || 0,
      probability: parseFloat(probability) || 50,
      expected_close_date: expected_close_date || null,
      stage,
      priority,
      source,
      notes,
      created_by: req.user?.id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin.from('crm_opportunities').insert([newOpp]).select().single();
    if (error) throw error;

    await logCRMAudit({
      entity_type: 'OPPORTUNITY',
      entity_id: data.id,
      action: 'CREATED',
      description: `Created opportunity ${data.opportunity_number} - ${data.name}`,
      new_values: data,
      performed_by: req.user?.id,
    });

    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.updateOpportunityStage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { stage, lost_reason } = req.body;

    if (!stage) {
      return res.status(400).json({ success: false, error: { message: 'Stage is required.' } });
    }

    const { data: existing, error: getErr } = await supabaseAdmin.from('crm_opportunities').select('*').eq('id', id).single();
    if (getErr || !existing) {
      return res.status(404).json({ success: false, error: { message: 'Opportunity not found.' } });
    }

    const updates = {
      stage,
      ...(stage === 'LOST' && { lost_reason, lost_date: new Date().toISOString().split('T')[0] }),
      ...(stage === 'WON' && { probability: 100 }),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin.from('crm_opportunities').update(updates).eq('id', id).select().single();
    if (error) throw error;

    await logCRMAudit({
      entity_type: 'OPPORTUNITY',
      entity_id: id,
      action: 'STAGE_CHANGED',
      description: `Moved opportunity ${existing.opportunity_number} from ${existing.stage} to ${stage}`,
      old_values: { stage: existing.stage },
      new_values: { stage: data.stage },
      performed_by: req.user?.id,
    });

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.winOpportunity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quotation_id, sales_order_id, notes } = req.body;

    const { data: existing, error: getErr } = await supabaseAdmin.from('crm_opportunities').select('*').eq('id', id).single();
    if (getErr || !existing) {
      return res.status(404).json({ success: false, error: { message: 'Opportunity not found.' } });
    }

    const updates = {
      stage: 'WON',
      probability: 100,
      ...(quotation_id && { quotation_id }),
      ...(sales_order_id && { sales_order_id }),
      ...(notes && { notes }),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin.from('crm_opportunities').update(updates).eq('id', id).select().single();
    if (error) throw error;

    await logCRMAudit({
      entity_type: 'OPPORTUNITY',
      entity_id: id,
      action: 'WON',
      description: `Marked opportunity ${existing.opportunity_number} as WON`,
      old_values: existing,
      new_values: data,
      performed_by: req.user?.id,
    });

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.loseOpportunity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { lost_reason, notes } = req.body;

    if (!lost_reason) {
      return res.status(400).json({ success: false, error: { message: 'Lost reason is required.' } });
    }

    const { data: existing, error: getErr } = await supabaseAdmin.from('crm_opportunities').select('*').eq('id', id).single();
    if (getErr || !existing) {
      return res.status(404).json({ success: false, error: { message: 'Opportunity not found.' } });
    }

    const updates = {
      stage: 'LOST',
      probability: 0,
      lost_reason,
      lost_date: new Date().toISOString().split('T')[0],
      ...(notes && { notes }),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin.from('crm_opportunities').update(updates).eq('id', id).select().single();
    if (error) throw error;

    await logCRMAudit({
      entity_type: 'OPPORTUNITY',
      entity_id: id,
      action: 'LOST',
      description: `Marked opportunity ${existing.opportunity_number} as LOST (Reason: ${lost_reason})`,
      old_values: existing,
      new_values: data,
      performed_by: req.user?.id,
    });

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.getPipelineBoard = async (req, res, next) => {
  try {
    const STAGES = ['QUALIFICATION', 'NEEDS_ANALYSIS', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'];

    const { data: opps, error } = await supabaseAdmin
      .from('crm_opportunities')
      .select('*, customer:customers(id, company_name, first_name, last_name), owner:employees(id, first_name, last_name)')
      .order('expected_close_date', { ascending: true });

    if (error) throw error;

    const board = {};
    STAGES.forEach(stage => {
      board[stage] = {
        stage,
        count: 0,
        total_value: 0,
        weighted_value: 0,
        opportunities: [],
      };
    });

    (opps || []).forEach(o => {
      const expVal = parseFloat(o.expected_value) || 0;
      const prob = parseFloat(o.probability) || 0;
      const fVal = expVal * (prob / 100);
      const stageKey = o.stage && board[o.stage] ? o.stage : 'QUALIFICATION';

      board[stageKey].count += 1;
      board[stageKey].total_value += expVal;
      board[stageKey].weighted_value += fVal;
      board[stageKey].opportunities.push({
        ...o,
        forecast_value: fVal,
      });
    });

    res.json({ success: true, data: board });
  } catch (error) {
    next(error);
  }
};

// ==============================================================================
// 4. ACTIVITIES, TASKS & FOLLOWUPS
// ==============================================================================
exports.getActivities = async (req, res, next) => {
  try {
    const { activity_type, status, owner_id, customer_id, lead_id, opportunity_id } = req.query;

    let query = supabaseAdmin
      .from('crm_activities')
      .select('*, customer:customers(id, company_name, first_name, last_name), owner:employees(id, first_name, last_name), contact:customer_contacts(first_name, last_name)')
      .order('activity_date', { ascending: false });

    if (activity_type) query = query.eq('activity_type', activity_type);
    if (status) query = query.eq('status', status);
    if (owner_id) query = query.eq('owner_id', owner_id);
    if (customer_id) query = query.eq('customer_id', customer_id);
    if (lead_id) query = query.eq('lead_id', lead_id);
    if (opportunity_id) query = query.eq('opportunity_id', opportunity_id);

    const { data, error } = await query;
    if (error) throw error;

    res.json({ success: true, data: data || [] });
  } catch (error) {
    next(error);
  }
};

exports.createActivity = async (req, res, next) => {
  try {
    const {
      activity_type = 'CALL',
      customer_id,
      contact_id,
      lead_id,
      opportunity_id,
      owner_id,
      activity_date = new Date().toISOString().split('T')[0],
      activity_time,
      duration_minutes = 15,
      subject,
      description,
      outcome,
      status = 'COMPLETED',
    } = req.body;

    if (!subject) {
      return res.status(400).json({ success: false, error: { message: 'Activity subject is required.' } });
    }

    const newActivity = {
      activity_type,
      customer_id: customer_id || null,
      contact_id: contact_id || null,
      lead_id: lead_id || null,
      opportunity_id: opportunity_id || null,
      owner_id: owner_id || null,
      activity_date,
      activity_time: activity_time || null,
      duration_minutes: parseInt(duration_minutes) || 0,
      subject,
      description,
      outcome,
      status,
      created_by: req.user?.id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin.from('crm_activities').insert([newActivity]).select().single();
    if (error) throw error;

    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.getTasks = async (req, res, next) => {
  try {
    const { status, owner_id, customer_id, lead_id, opportunity_id } = req.query;

    let query = supabaseAdmin
      .from('crm_tasks')
      .select('*, customer:customers(company_name, first_name, last_name), owner:employees(first_name, last_name)')
      .order('due_date', { ascending: true });

    if (status) query = query.eq('status', status);
    if (owner_id) query = query.eq('owner_id', owner_id);
    if (customer_id) query = query.eq('customer_id', customer_id);
    if (lead_id) query = query.eq('lead_id', lead_id);
    if (opportunity_id) query = query.eq('opportunity_id', opportunity_id);

    const { data, error } = await query;
    if (error) throw error;

    res.json({ success: true, data: data || [] });
  } catch (error) {
    next(error);
  }
};

exports.createTask = async (req, res, next) => {
  try {
    const { task_title, lead_id, opportunity_id, customer_id, contact_id, owner_id, due_date, priority = 'NORMAL', status = 'TODO', description } = req.body;

    if (!task_title || !due_date) {
      return res.status(400).json({ success: false, error: { message: 'Task title and due date are required.' } });
    }

    const newTask = {
      task_title,
      lead_id: lead_id || null,
      opportunity_id: opportunity_id || null,
      customer_id: customer_id || null,
      contact_id: contact_id || null,
      owner_id: owner_id || null,
      due_date,
      priority,
      status,
      description,
      created_by: req.user?.id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin.from('crm_tasks').insert([newTask]).select().single();
    if (error) throw error;

    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.updateTaskStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { data, error } = await supabaseAdmin
      .from('crm_tasks')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.getFollowups = async (req, res, next) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const { status, owner_id, customer_id } = req.query;

    let query = supabaseAdmin
      .from('crm_followups')
      .select('*, customer:customers(company_name, first_name, last_name), owner:employees(first_name, last_name), opportunity:crm_opportunities(name, opportunity_number)')
      .order('followup_date', { ascending: true });

    if (status) query = query.eq('status', status);
    if (owner_id) query = query.eq('owner_id', owner_id);
    if (customer_id) query = query.eq('customer_id', customer_id);

    const { data, error } = await query;
    if (error) throw error;

    const enriched = (data || []).map(f => {
      const isOverdue = f.followup_date < todayStr && f.status !== 'COMPLETED';
      return {
        ...f,
        status: isOverdue ? 'OVERDUE' : f.status,
      };
    });

    res.json({ success: true, data: enriched });
  } catch (error) {
    next(error);
  }
};

exports.createFollowup = async (req, res, next) => {
  try {
    const { customer_id, lead_id, opportunity_id, owner_id, followup_date, purpose, notes, status = 'PLANNED' } = req.body;

    if (!followup_date || !purpose) {
      return res.status(400).json({ success: false, error: { message: 'Followup date and purpose are required.' } });
    }

    const newFU = {
      customer_id: customer_id || null,
      lead_id: lead_id || null,
      opportunity_id: opportunity_id || null,
      owner_id: owner_id || null,
      followup_date,
      purpose,
      notes,
      status,
      created_by: req.user?.id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin.from('crm_followups').insert([newFU]).select().single();
    if (error) throw error;

    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// ==============================================================================
// 5. CUSTOMER TIMELINE & NOTES
// ==============================================================================
exports.getCustomerTimeline = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verify Customer exists
    const { data: customer, error: cusErr } = await supabaseAdmin
      .from('customers')
      .select('*, contacts:customer_contacts(*), relationship_owner:employees(first_name, last_name)')
      .eq('id', id)
      .single();

    if (cusErr || !customer) {
      return res.status(404).json({ success: false, error: { message: 'Customer not found.' } });
    }

    // Fetch related records concurrently
    const [leadsRes, oppsRes, activitiesRes, tasksRes, followupsRes, notesRes, quotesRes, ordersRes, invoicesRes] = await Promise.all([
      supabaseAdmin.from('crm_leads').select('*').eq('customer_id', id),
      supabaseAdmin.from('crm_opportunities').select('*').eq('customer_id', id),
      supabaseAdmin.from('crm_activities').select('*').eq('customer_id', id),
      supabaseAdmin.from('crm_tasks').select('*').eq('customer_id', id),
      supabaseAdmin.from('crm_followups').select('*').eq('customer_id', id),
      supabaseAdmin.from('crm_customer_notes').select('*, created_by_user:profiles(full_name)').eq('customer_id', id),
      supabaseAdmin.from('quotations').select('id, quotation_number, grand_total, status, quotation_date').eq('customer_id', id),
      supabaseAdmin.from('sales_orders').select('id, order_number, grand_total, status, order_date').eq('customer_id', id),
      supabaseAdmin.from('sales_invoices').select('id, invoice_number, total_amount, status, invoice_date').eq('customer_id', id),
    ]);

    // Build Chronological Feed
    const timeline = [];

    (leadsRes.data || []).forEach(l => {
      timeline.push({ type: 'LEAD', date: l.created_at, title: `Lead Created: ${l.lead_number}`, detail: l.lead_name, record: l });
    });

    (oppsRes.data || []).forEach(o => {
      timeline.push({ type: 'OPPORTUNITY', date: o.created_at, title: `Opportunity Opened: ${o.opportunity_number}`, detail: `${o.name} (₹${o.expected_value})`, record: o });
    });

    (activitiesRes.data || []).forEach(a => {
      timeline.push({ type: 'ACTIVITY', date: a.activity_date, title: `${a.activity_type}: ${a.subject}`, detail: a.description || a.outcome, record: a });
    });

    (tasksRes.data || []).forEach(t => {
      timeline.push({ type: 'TASK', date: t.due_date, title: `Task (${t.status}): ${t.task_title}`, detail: t.description, record: t });
    });

    (followupsRes.data || []).forEach(f => {
      timeline.push({ type: 'FOLLOWUP', date: f.followup_date, title: `Follow-up (${f.status}): ${f.purpose}`, detail: f.notes, record: f });
    });

    (notesRes.data || []).forEach(n => {
      timeline.push({ type: 'NOTE', date: n.created_at, title: `Internal Customer Note`, detail: n.note, record: n });
    });

    (quotesRes.data || []).forEach(q => {
      timeline.push({ type: 'QUOTATION', date: q.quotation_date || q.created_at, title: `Quotation Issued: ${q.quotation_number}`, detail: `Total: ₹${q.grand_total} | Status: ${q.status}`, record: q });
    });

    (ordersRes.data || []).forEach(so => {
      timeline.push({ type: 'SALES_ORDER', date: so.order_date || so.created_at, title: `Sales Order Confirmed: ${so.order_number}`, detail: `Total: ₹${so.grand_total} | Status: ${so.status}`, record: so });
    });

    (invoicesRes.data || []).forEach(inv => {
      timeline.push({ type: 'INVOICE', date: inv.invoice_date || inv.created_at, title: `Commercial Invoice: ${inv.invoice_number}`, detail: `Amount: ₹${inv.total_amount} | Status: ${inv.status}`, record: inv });
    });

    // Sort descending by date
    timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    res.json({
      success: true,
      data: {
        customer,
        timeline,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.addCustomerNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    if (!note) {
      return res.status(400).json({ success: false, error: { message: 'Note text is required.' } });
    }

    const newNote = {
      customer_id: id,
      note,
      created_by: req.user?.id || null,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin.from('crm_customer_notes').insert([newNote]).select().single();
    if (error) throw error;

    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// ==============================================================================
// 6. CRM ANALYTICAL REPORTS
// ==============================================================================
exports.getCRMReports = async (req, res, next) => {
  try {
    // 1. Lead Conversion Statistics
    const { data: leads } = await supabaseAdmin.from('crm_leads').select('id, status, source');
    const totalLeads = leads ? leads.length : 0;
    const qualifiedLeads = (leads || []).filter(l => l.status === 'QUALIFIED').length;
    const convertedLeads = (leads || []).filter(l => l.status === 'CONVERTED').length;
    const lostLeads = (leads || []).filter(l => l.status === 'LOST').length;
    const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : '0';

    // 2. Sales Pipeline Stage Distribution
    const { data: opps } = await supabaseAdmin
      .from('crm_opportunities')
      .select('*, customer:customers(company_name, first_name, last_name), owner:employees(first_name, last_name)');

    const stageSummary = {};
    (opps || []).forEach(o => {
      const stg = o.stage || 'QUALIFICATION';
      if (!stageSummary[stg]) stageSummary[stg] = { count: 0, total_value: 0, weighted_value: 0 };
      const val = parseFloat(o.expected_value) || 0;
      const prob = parseFloat(o.probability) || 0;
      stageSummary[stg].count += 1;
      stageSummary[stg].total_value += val;
      stageSummary[stg].weighted_value += val * (prob / 100);
    });

    // 3. Owner Sales Performance
    const ownerPerformance = {};
    (opps || []).forEach(o => {
      const ownerName = o.owner ? `${o.owner.first_name} ${o.owner.last_name}` : 'Unassigned';
      if (!ownerPerformance[ownerName]) {
        ownerPerformance[ownerName] = { wonCount: 0, wonValue: 0, lostCount: 0, openValue: 0 };
      }
      const val = parseFloat(o.expected_value) || 0;
      if (o.stage === 'WON') {
        ownerPerformance[ownerName].wonCount += 1;
        ownerPerformance[ownerName].wonValue += val;
      } else if (o.stage === 'LOST') {
        ownerPerformance[ownerName].lostCount += 1;
      } else {
        ownerPerformance[ownerName].openValue += val;
      }
    });

    res.json({
      success: true,
      data: {
        leadConversion: {
          totalLeads,
          qualifiedLeads,
          convertedLeads,
          lostLeads,
          conversionRate,
        },
        pipelineSummary: stageSummary,
        ownerPerformance,
        rawOpportunities: opps || [],
      },
    });
  } catch (error) {
    next(error);
  }
};
