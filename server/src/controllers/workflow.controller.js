const workflowService = require('../services/workflow.service');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
let supabaseAdmin = null;
if (supabaseUrl && supabaseServiceKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
}

exports.getDashboardTelemetry = async (req, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    const data = await workflowService.getDashboardTelemetry(userId, role);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('getDashboardTelemetry error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.getWorkflowDefinitions = async (req, res) => {
  try {
    const { data: defs, error } = await supabaseAdmin
      .from('workflow_definitions')
      .select('*, workflow_versions(id, version_number, status)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.status(200).json({ success: true, data: defs });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.getWorkflowDefinitionById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: def, error } = await supabaseAdmin
      .from('workflow_definitions')
      .select('*, workflow_versions(*, workflow_stages(*, workflow_steps(*), workflow_conditions(*)))')
      .eq('id', id)
      .single();

    if (error) throw error;
    return res.status(200).json({ success: true, data: def });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.createWorkflowDefinition = async (req, res) => {
  try {
    const { code, name, description, module, entity_type, stages } = req.body;
    const userId = req.user?.id;

    // Create definition
    const { data: def, error: defErr } = await supabaseAdmin
      .from('workflow_definitions')
      .insert({
        code,
        name,
        description,
        module,
        entity_type,
        status: 'Draft',
        active_version_number: 1,
        owner_id: userId
      })
      .select()
      .single();

    if (defErr) throw defErr;

    // Create Draft Version 1
    const { data: version, error: verErr } = await supabaseAdmin
      .from('workflow_versions')
      .insert({
        workflow_id: def.id,
        version_number: 1,
        change_summary: 'Initial draft configuration',
        status: 'Draft',
        created_by: userId
      })
      .select()
      .single();

    if (verErr) throw verErr;

    // Create Stages & Steps if provided
    if (stages && stages.length > 0) {
      for (let i = 0; i < stages.length; i++) {
        const stg = stages[i];
        const { data: stage } = await supabaseAdmin
          .from('workflow_stages')
          .insert({
            version_id: version.id,
            sequence: i + 1,
            name: stg.name,
            description: stg.description,
            approval_mode: stg.approval_mode || 'SINGLE',
            rejection_behavior: stg.rejection_behavior || 'REJECT_WORKFLOW',
            deadline_hours: stg.deadline_hours || 48
          })
          .select()
          .single();

        if (stg.steps && stg.steps.length > 0) {
          for (let j = 0; j < stg.steps.length; j++) {
            const stp = stg.steps[j];
            await supabaseAdmin.from('workflow_steps').insert({
              stage_id: stage.id,
              sequence: j + 1,
              step_name: stp.step_name || `Step ${j + 1}`,
              approver_type: stp.approver_type,
              approver_value: stp.approver_value
            });
          }
        }
      }
    }

    return res.status(201).json({ success: true, data: def });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.activateWorkflowDefinition = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: def, error } = await supabaseAdmin
      .from('workflow_definitions')
      .update({ status: 'Active', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return res.status(200).json({ success: true, data: def });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.getWorkflowInstances = async (req, res) => {
  try {
    const { module, entity_type, status, search, page = 1, limit = 20 } = req.query;

    let query = supabaseAdmin
      .from('workflow_instances')
      .select('*, workflow_definitions(name, module), workflow_stages(name)', { count: 'exact' });

    if (entity_type) query = query.eq('entity_type', entity_type);
    if (status) query = query.eq('status', status);
    if (search) query = query.ilike('instance_number', `%${search}%`);

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to).order('started_at', { ascending: false });

    const { data: instances, count, error } = await query;
    if (error) throw error;

    return res.status(200).json({
      success: true,
      data: instances,
      pagination: { total: count, page: Number(page), limit: Number(limit) }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.getWorkflowInstanceById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: instance, error } = await supabaseAdmin
      .from('workflow_instances')
      .select('*, workflow_definitions(*), workflow_stages(*), workflow_tasks(*, profiles:assignee_id(full_name, role, email)), workflow_history(*, profiles:actor_id(full_name))')
      .eq('id', id)
      .single();

    if (error) throw error;
    return res.status(200).json({ success: true, data: instance });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.startWorkflowInstance = async (req, res) => {
  try {
    const { entity_type, entity_id, entity_reference, module, priority, entity_data } = req.body;
    const userId = req.user?.id;

    const result = await workflowService.startWorkflow({
      entity_type,
      entity_id,
      entity_reference,
      module,
      started_by: userId,
      priority,
      entity_data
    });

    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.getUserTasks = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { tab = 'pending', page = 1, limit = 20 } = req.query;

    let query = supabaseAdmin
      .from('workflow_tasks')
      .select('*, workflow_instances(*, workflow_definitions(name, module)), workflow_stages(name)', { count: 'exact' });

    if (tab === 'pending') {
      query = query.eq('assignee_id', userId).eq('status', 'Pending');
    } else if (tab === 'overdue') {
      const now = new Date().toISOString();
      query = query.eq('assignee_id', userId).eq('status', 'Pending').lt('due_date', now);
    } else if (tab === 'completed') {
      query = query.eq('assignee_id', userId).eq('status', 'Completed');
    } else {
      query = query.eq('assignee_id', userId);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to).order('assigned_at', { ascending: false });

    const { data: tasks, count, error } = await query;
    if (error) throw error;

    return res.status(200).json({
      success: true,
      data: tasks,
      pagination: { total: count, page: Number(page), limit: Number(limit) }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.processTaskDecision = async (req, res) => {
  try {
    const { id } = req.params;
    const { decision, comments } = req.body;
    const userId = req.user?.id;

    if (!['Approved', 'Rejected', 'Changes Requested'].includes(decision)) {
      return res.status(400).json({ success: false, error: 'Invalid decision type' });
    }

    const result = await workflowService.processTaskDecision({
      task_id: id,
      user_id: userId,
      decision,
      comments
    });

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.resubmitWorkflowInstance = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const userId = req.user?.id;

    const result = await workflowService.resubmitInstance({ instance_id: id, user_id: userId, message });
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.cancelWorkflowInstance = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user?.id;

    const result = await workflowService.cancelInstance({ instance_id: id, user_id: userId, reason });
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.reassignTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { new_assignee_id, reason } = req.body;
    const userId = req.user?.id;

    const result = await workflowService.reassignTask({
      task_id: id,
      user_id: userId,
      new_assignee_id,
      reason
    });

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.getWorkflowHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: history, count, error } = await supabaseAdmin
      .from('workflow_history')
      .select('*, workflow_instances(instance_number, entity_type, entity_reference), profiles:actor_id(full_name, role)', { count: 'exact' })
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data: history,
      pagination: { total: count, page: Number(page), limit: Number(limit) }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.getWorkflowReports = async (req, res) => {
  try {
    const { data: instances } = await supabaseAdmin
      .from('workflow_instances')
      .select('module:workflow_definitions(module), status, started_at, completed_at');

    const moduleCounts = {};
    let totalCompletedDurationMs = 0;
    let completedCount = 0;

    if (instances) {
      instances.forEach((inst) => {
        const mod = inst.module?.module || 'General';
        moduleCounts[mod] = (moduleCounts[mod] || 0) + 1;
        if (inst.status === 'Approved' && inst.completed_at && inst.started_at) {
          const duration = new Date(inst.completed_at).getTime() - new Date(inst.started_at).getTime();
          totalCompletedDurationMs += duration;
          completedCount++;
        }
      });
    }

    const avgApprovalHours = completedCount > 0 ? (totalCompletedDurationMs / completedCount / (1000 * 60 * 60)).toFixed(1) : 'N/A';

    return res.status(200).json({
      success: true,
      data: {
        moduleCounts,
        avgApprovalHours,
        totalCompleted: completedCount
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.getApprovalGroups = async (req, res) => {
  try {
    const { data: groups, error } = await supabaseAdmin
      .from('approval_groups')
      .select('*, approval_group_members(*, profiles:user_id(full_name, email, role))')
      .order('name', { ascending: true });

    if (error) throw error;
    return res.status(200).json({ success: true, data: groups });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.getWorkflowDelegations = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { data: delegations, error } = await supabaseAdmin
      .from('workflow_delegations')
      .select('*, delegator:delegator_id(full_name), delegate:delegate_id(full_name)')
      .or(`delegator_id.eq.${userId},delegate_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.status(200).json({ success: true, data: delegations });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
