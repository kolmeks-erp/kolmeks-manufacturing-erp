const { createClient } = require('@supabase/supabase-js');
const notificationService = require('./notification.service');

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseAdmin = null;
if (supabaseUrl && supabaseServiceKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
}

class WorkflowEngineService {
  /**
   * Helper to ensure Supabase admin client is initialized
   */
  _getAdminClient() {
    if (!supabaseAdmin) {
      const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
      const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (url && key) {
        supabaseAdmin = createClient(url, key);
      } else {
        throw new Error('Supabase admin credentials missing on server');
      }
    }
    return supabaseAdmin;
  }

  /**
   * Evaluate simple safe workflow conditions against entity data
   */
  _evaluateCondition(condition, entityData) {
    if (!entityData || !condition.field_name) return true;
    const val = entityData[condition.field_name];
    const target = condition.value_text;

    switch (condition.operator) {
      case 'equals':
        return String(val) === String(target);
      case 'not_equals':
        return String(val) !== String(target);
      case 'greater_than':
        return Number(val) > Number(target);
      case 'less_than':
        return Number(val) < Number(target);
      case 'greater_equal':
        return Number(val) >= Number(target);
      case 'less_equal':
        return Number(val) <= Number(target);
      case 'contains':
        return String(val || '').toLowerCase().includes(String(target).toLowerCase());
      case 'is_empty':
        return val === null || val === undefined || val === '';
      case 'is_not_empty':
        return val !== null && val !== undefined && val !== '';
      default:
        return true;
    }
  }

  /**
   * Resolve step approvers dynamically using role, user, department, or approval group
   */
  async _resolveStepApprovers(step, startedBy, entityData) {
    const supabase = this._getAdminClient();
    const assignees = [];

    if (step.approver_type === 'SPECIFIC_USER') {
      assignees.push({ id: step.approver_value, role: 'Approver' });
    } else if (step.approver_type === 'RECORD_OWNER') {
      if (startedBy) assignees.push({ id: startedBy, role: 'Record Owner' });
    } else if (step.approver_type === 'EMPLOYEE_ROLE') {
      const { data: users } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('role', step.approver_value);
      if (users && users.length > 0) {
        users.forEach((u) => assignees.push({ id: u.id, role: u.role }));
      }
    } else if (step.approver_type === 'APPROVAL_GROUP') {
      const { data: group } = await supabase
        .from('approval_groups')
        .select('id')
        .eq('code', step.approver_value)
        .single();

      if (group) {
        const { data: members } = await supabase
          .from('approval_group_members')
          .select('user_id, role')
          .eq('group_id', group.id);
        if (members && members.length > 0) {
          members.forEach((m) => assignees.push({ id: m.user_id, role: m.role }));
        }
      }
    }

    // Check for active delegations for resolved assignees
    const finalAssignees = [];
    const now = new Date().toISOString();

    for (const a of assignees) {
      const { data: del } = await supabase
        .from('workflow_delegations')
        .select('delegate_id')
        .eq('delegator_id', a.id)
        .eq('status', 'ACTIVE')
        .lte('start_date', now)
        .gte('end_date', now)
        .maybeSingle();

      if (del && del.delegate_id) {
        finalAssignees.push({ id: del.delegate_id, role: `${a.role} (Delegate)` });
      } else {
        finalAssignees.push(a);
      }
    }

    return finalAssignees;
  }

  /**
   * Start a new workflow instance for a business record
   */
  async startWorkflow({ entity_type, entity_id, entity_reference, module, started_by, priority = 'NORMAL', entity_data = {} }) {
    const supabase = this._getAdminClient();

    // 1. Idempotency Check: Prevent duplicate active workflow instances for the same entity
    const { data: existingActive } = await supabase
      .from('workflow_instances')
      .select('id, instance_number, status')
      .eq('entity_type', entity_type)
      .eq('entity_id', entity_id)
      .in('status', ['Pending', 'In Progress', 'Changes Requested'])
      .maybeSingle();

    if (existingActive) {
      return { instance: existingActive, duplicate: true };
    }

    // 2. Resolve Active Workflow Definition & Version
    let def = null;
    const { data: matchedDefs } = await supabase
      .from('workflow_definitions')
      .select('id, code, name, active_version_number')
      .eq('entity_type', entity_type)
      .eq('status', 'Active');

    if (matchedDefs && matchedDefs.length > 0) {
      def = matchedDefs[0];
    } else {
      // Fallback lookup by module
      const { data: moduleDefs } = await supabase
        .from('workflow_definitions')
        .select('id, code, name, active_version_number')
        .eq('module', module || 'General')
        .eq('status', 'Active');
      if (moduleDefs && moduleDefs.length > 0) def = moduleDefs[0];
    }

    if (!def) {
      throw new Error(`No active workflow definition configured for entity '${entity_type}'`);
    }

    // Fetch active version
    const { data: version } = await supabase
      .from('workflow_versions')
      .select('id')
      .eq('workflow_id', def.id)
      .eq('version_number', def.active_version_number)
      .single();

    if (!version) {
      throw new Error(`Active version v${def.active_version_number} not found for workflow ${def.name}`);
    }

    // 3. Fetch Stages ordered by sequence
    const { data: stages } = await supabase
      .from('workflow_stages')
      .select('*')
      .eq('version_id', version.id)
      .order('sequence', { ascending: true });

    if (!stages || stages.length === 0) {
      throw new Error(`Workflow definition '${def.name}' has no defined approval stages`);
    }

    // Filter stages by conditions
    const validStages = [];
    for (const stage of stages) {
      const { data: conditions } = await supabase
        .from('workflow_conditions')
        .select('*')
        .eq('stage_id', stage.id);

      let stageValid = true;
      if (conditions && conditions.length > 0) {
        stageValid = conditions.every((c) => this._evaluateCondition(c, entity_data));
      }
      if (stageValid) validStages.push(stage);
    }

    const firstStage = validStages[0] || stages[0];

    // Calculate due date
    const dueDate = new Date();
    dueDate.setHours(dueDate.getHours() + (firstStage.deadline_hours || 48));

    // 4. Create Workflow Instance
    const { data: instance, error: instError } = await supabase
      .from('workflow_instances')
      .insert({
        workflow_id: def.id,
        version_id: version.id,
        entity_type,
        entity_id,
        entity_reference,
        current_stage_id: firstStage.id,
        status: 'In Progress',
        attempt_number: 1,
        started_by,
        due_date: dueDate.toISOString(),
        priority
      })
      .select()
      .single();

    if (instError) throw instError;

    // 5. Fetch steps for first stage and assign tasks
    const { data: steps } = await supabase
      .from('workflow_steps')
      .select('*')
      .eq('stage_id', firstStage.id)
      .order('sequence', { ascending: true });

    let taskCount = 0;
    if (steps && steps.length > 0) {
      for (const step of steps) {
        const assignees = await this._resolveStepApprovers(step, started_by, entity_data);
        for (const assignee of assignees) {
          const { data: task } = await supabase
            .from('workflow_tasks')
            .insert({
              instance_id: instance.id,
              stage_id: firstStage.id,
              step_id: step.id,
              assignee_id: assignee.id,
              assignee_role: assignee.role,
              status: 'Pending',
              due_date: dueDate.toISOString()
            })
            .select()
            .single();

          taskCount++;

          // Dispatch Notification to Approver
          if (assignee.id) {
            await notificationService.dispatchNotification({
              type_code: 'APPROVAL_REQUIRED',
              recipient_id: assignee.id,
              sender_id: started_by,
              title: `Approval Required: ${entity_reference || entity_type}`,
              message: `You have been assigned an approval task for ${def.name} (${entity_reference || entity_id}).`,
              category: 'Approvals',
              priority,
              related_module: module || 'General',
              related_record_id: entity_id,
              related_record_reference: entity_reference,
              related_route: `/secure-kolmeks-x0y0/workflows/tasks`,
              event_key: `WF_TASK_${task.id}`
            });
          }
        }
      }
    }

    if (taskCount === 0) {
      // Create Workflow Exception if no assignees could be resolved
      await supabase.from('workflow_exceptions').insert({
        instance_id: instance.id,
        error_code: 'NO_APPROVER_FOUND',
        message: `No active approvers resolved for stage '${firstStage.name}' in workflow '${def.name}'`,
        severity: 'HIGH'
      });
    }

    // 6. Record Workflow History Audit
    await supabase.from('workflow_history').insert({
      instance_id: instance.id,
      event_type: 'WORKFLOW_STARTED',
      actor_id: started_by,
      stage_id: firstStage.id,
      notes: `Workflow ${def.name} started for ${entity_reference || entity_type}`,
      metadata: { entity_type, entity_id, priority, task_count: taskCount }
    });

    return { instance, stage: firstStage, taskCount };
  }

  /**
   * Execute an approval decision (Approve, Reject, Request Changes) on a pending task
   */
  async processTaskDecision({ task_id, user_id, decision, comments }) {
    const supabase = this._getAdminClient();

    // 1. Concurrency & Stale Task Check
    const { data: task, error: taskError } = await supabase
      .from('workflow_tasks')
      .select('*, workflow_instances!inner(*)')
      .eq('id', task_id)
      .single();

    if (taskError || !task) {
      throw new Error('Workflow task not found');
    }

    if (task.status !== 'Pending' && task.status !== 'In Progress') {
      return { success: false, stale: true, message: `Task has already been processed with status '${task.status}'` };
    }

    const instance = task.workflow_instances;
    if (instance.status === 'Cancelled' || instance.status === 'Completed' || instance.status === 'Approved') {
      return { success: false, stale: true, message: `Workflow instance is no longer active (status: ${instance.status})` };
    }

    const now = new Date().toISOString();

    // 2. Mark Task Completed
    await supabase
      .from('workflow_tasks')
      .update({
        status: 'Completed',
        decision,
        comments,
        decided_by: user_id,
        completed_at: now
      })
      .eq('id', task_id);

    // 3. Record History Audit
    await supabase.from('workflow_history').insert({
      instance_id: instance.id,
      event_type: decision === 'Approved' ? 'APPROVED' : decision === 'Rejected' ? 'REJECTED' : 'CHANGES_REQUESTED',
      actor_id: user_id,
      stage_id: task.stage_id,
      task_id: task.id,
      notes: comments || `Decision: ${decision}`,
      metadata: { decision, comments }
    });

    // 4. Fetch Current Stage info
    const { data: currentStage } = await supabase
      .from('workflow_stages')
      .select('*')
      .eq('id', task.stage_id)
      .single();

    if (decision === 'Rejected' || decision === 'Changes Requested') {
      const isRejection = decision === 'Rejected';
      const instanceNewStatus = isRejection ? 'Rejected' : 'Changes Requested';

      // Cancel remaining pending tasks for this instance
      await supabase
        .from('workflow_tasks')
        .update({ status: 'Cancelled' })
        .eq('instance_id', instance.id)
        .eq('status', 'Pending');

      // Update Instance status
      await supabase
        .from('workflow_instances')
        .update({
          status: instanceNewStatus,
          completed_at: isRejection ? now : null
        })
        .eq('id', instance.id);

      // Update underlying business record if applicable
      await this._syncBusinessEntityStatus(instance.entity_type, instance.entity_id, instanceNewStatus.toUpperCase());

      // Dispatch Notification to Workflow Requester
      if (instance.started_by) {
        await notificationService.dispatchNotification({
          type_code: isRejection ? 'APPROVAL_REJECTED' : 'CHANGES_REQUESTED',
          recipient_id: instance.started_by,
          sender_id: user_id,
          title: `Workflow ${instanceNewStatus}: ${instance.entity_reference || instance.entity_type}`,
          message: `Your request for ${instance.entity_reference} was set to ${instanceNewStatus} by approver. Comments: ${comments || 'None'}`,
          category: 'Approvals',
          priority: 'HIGH',
          related_module: 'General',
          related_record_id: instance.entity_id,
          related_record_reference: instance.entity_reference,
          related_route: `/secure-kolmeks-x0y0/workflows/instances/${instance.id}`,
          event_key: `WF_DECISION_${instance.id}_${now}`
        });
      }

      return { success: true, instanceStatus: instanceNewStatus };
    }

    // Decision is 'Approved' -> Check Stage Completion Rule
    const { data: siblingTasks } = await supabase
      .from('workflow_tasks')
      .select('id, status, decision')
      .eq('instance_id', instance.id)
      .eq('stage_id', task.stage_id);

    const mode = currentStage?.approval_mode || 'SINGLE';
    let stageCompleted = false;

    if (mode === 'SINGLE' || mode === 'ANY_ONE') {
      stageCompleted = true;
      // Cancel remaining sibling pending tasks
      await supabase
        .from('workflow_tasks')
        .update({ status: 'Cancelled' })
        .eq('instance_id', instance.id)
        .eq('stage_id', task.stage_id)
        .eq('status', 'Pending');
    } else if (mode === 'ALL_REQUIRED' || mode === 'PARALLEL') {
      stageCompleted = siblingTasks.every((t) => t.status === 'Completed' && t.decision === 'Approved');
    } else {
      stageCompleted = true;
    }

    if (!stageCompleted) {
      return { success: true, stageProgress: 'Awaiting remaining approvers' };
    }

    // Stage completed! Check if there are next stages
    const { data: allStages } = await supabase
      .from('workflow_stages')
      .select('*')
      .eq('version_id', instance.version_id)
      .order('sequence', { ascending: true });

    const currentSeq = currentStage ? currentStage.sequence : 1;
    const nextStage = allStages.find((s) => s.sequence > currentSeq);

    if (nextStage) {
      // Advance Instance to Next Stage
      const dueDate = new Date();
      dueDate.setHours(dueDate.getHours() + (nextStage.deadline_hours || 48));

      await supabase
        .from('workflow_instances')
        .update({
          current_stage_id: nextStage.id,
          due_date: dueDate.toISOString()
        })
        .eq('id', instance.id);

      // Create Tasks for Next Stage
      const { data: nextSteps } = await supabase
        .from('workflow_steps')
        .select('*')
        .eq('stage_id', nextStage.id)
        .order('sequence', { ascending: true });

      if (nextSteps && nextSteps.length > 0) {
        for (const step of nextSteps) {
          const assignees = await this._resolveStepApprovers(step, instance.started_by, {});
          for (const assignee of assignees) {
            const { data: newTask } = await supabase
              .from('workflow_tasks')
              .insert({
                instance_id: instance.id,
                stage_id: nextStage.id,
                step_id: step.id,
                assignee_id: assignee.id,
                assignee_role: assignee.role,
                status: 'Pending',
                due_date: dueDate.toISOString()
              })
              .select()
              .single();

            if (assignee.id) {
              await notificationService.dispatchNotification({
                type_code: 'APPROVAL_REQUIRED',
                recipient_id: assignee.id,
                sender_id: user_id,
                title: `Approval Required: ${instance.entity_reference || instance.entity_type}`,
                message: `Workflow advanced to Stage '${nextStage.name}'. Your approval sign-off is required.`,
                category: 'Approvals',
                priority: 'HIGH',
                related_module: 'General',
                related_record_id: instance.entity_id,
                related_record_reference: instance.entity_reference,
                related_route: `/secure-kolmeks-x0y0/workflows/tasks`,
                event_key: `WF_TASK_${newTask.id}`
              });
            }
          }
        }
      }

      await supabase.from('workflow_history').insert({
        instance_id: instance.id,
        event_type: 'STAGE_STARTED',
        actor_id: user_id,
        stage_id: nextStage.id,
        notes: `Advanced to stage '${nextStage.name}'`
      });

      return { success: true, instanceStatus: 'In Progress', currentStage: nextStage.name };
    }

    // No next stage -> Workflow Completely APPROVED!
    await supabase
      .from('workflow_instances')
      .update({
        status: 'Approved',
        completed_at: now
      })
      .eq('id', instance.id);

    // Sync underlying business record
    await this._syncBusinessEntityStatus(instance.entity_type, instance.entity_id, 'APPROVED');

    // Record Completion Audit & Notify Requester
    await supabase.from('workflow_history').insert({
      instance_id: instance.id,
      event_type: 'COMPLETED',
      actor_id: user_id,
      notes: `Workflow successfully completed and approved.`
    });

    if (instance.started_by) {
      await notificationService.dispatchNotification({
        type_code: 'APPROVAL_COMPLETED',
        recipient_id: instance.started_by,
        sender_id: user_id,
        title: `Workflow Approved: ${instance.entity_reference || instance.entity_type}`,
        message: `Your approval workflow for ${instance.entity_reference} has completed successfully with full sign-off.`,
        category: 'Approvals',
        priority: 'NORMAL',
        related_module: 'General',
        related_record_id: instance.entity_id,
        related_record_reference: instance.entity_reference,
        related_route: `/secure-kolmeks-x0y0/workflows/instances/${instance.id}`,
        event_key: `WF_COMPLETED_${instance.id}`
      });
    }

    return { success: true, instanceStatus: 'Approved' };
  }

  /**
   * Helper to sync business record status across ERP modules
   */
  async _syncBusinessEntityStatus(entityType, entityId, status) {
    const supabase = this._getAdminClient();
    try {
      if (entityType === 'document') {
        await supabase
          .from('documents')
          .update({ status: status === 'APPROVED' ? 'APPROVED' : status === 'REJECTED' ? 'REJECTED' : 'DRAFT' })
          .eq('id', entityId);
      } else if (entityType === 'purchase_order') {
        await supabase
          .from('purchase_orders')
          .update({ status: status === 'APPROVED' ? 'APPROVED' : status === 'REJECTED' ? 'CANCELLED' : 'DRAFT' })
          .eq('id', entityId);
      } else if (entityType === 'purchase_requisition') {
        await supabase
          .from('purchase_requisitions')
          .update({ status: status === 'APPROVED' ? 'APPROVED' : status === 'REJECTED' ? 'REJECTED' : 'DRAFT' })
          .eq('id', entityId);
      }
    } catch (err) {
      console.error('Failed to sync business record status:', err);
    }
  }

  /**
   * Resubmit workflow instance after changes requested
   */
  async resubmitInstance({ instance_id, user_id, message }) {
    const supabase = this._getAdminClient();

    const { data: instance } = await supabase
      .from('workflow_instances')
      .select('*')
      .eq('id', instance_id)
      .single();

    if (!instance) throw new Error('Workflow instance not found');

    const nextAttempt = instance.attempt_number + 1;

    // Reset status and attempt
    await supabase
      .from('workflow_instances')
      .update({
        status: 'In Progress',
        attempt_number: nextAttempt
      })
      .eq('id', instance.id);

    // Fetch initial stage
    const { data: stages } = await supabase
      .from('workflow_stages')
      .select('*')
      .eq('version_id', instance.version_id)
      .order('sequence', { ascending: true });

    const firstStage = stages[0];

    // Create new tasks for initial stage
    const { data: steps } = await supabase
      .from('workflow_steps')
      .select('*')
      .eq('stage_id', firstStage.id);

    if (steps && steps.length > 0) {
      for (const step of steps) {
        const assignees = await this._resolveStepApprovers(step, user_id, {});
        for (const assignee of assignees) {
          await supabase.from('workflow_tasks').insert({
            instance_id: instance.id,
            stage_id: firstStage.id,
            step_id: step.id,
            assignee_id: assignee.id,
            assignee_role: assignee.role,
            status: 'Pending'
          });
        }
      }
    }

    await supabase.from('workflow_history').insert({
      instance_id: instance.id,
      event_type: 'RESUBMITTED',
      actor_id: user_id,
      stage_id: firstStage.id,
      notes: message || `Resubmitted for approval (Attempt ${nextAttempt})`
    });

    return { success: true, attempt: nextAttempt };
  }

  /**
   * Cancel running workflow instance
   */
  async cancelInstance({ instance_id, user_id, reason }) {
    const supabase = this._getAdminClient();

    await supabase
      .from('workflow_tasks')
      .update({ status: 'Cancelled' })
      .eq('instance_id', instance_id)
      .eq('status', 'Pending');

    await supabase
      .from('workflow_instances')
      .update({
        status: 'Cancelled',
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason
      })
      .eq('id', instance_id);

    await supabase.from('workflow_history').insert({
      instance_id,
      event_type: 'CANCELLED',
      actor_id: user_id,
      notes: reason || 'Workflow cancelled by user'
    });

    return { success: true };
  }

  /**
   * Reassign a task to another user
   */
  async reassignTask({ task_id, user_id, new_assignee_id, reason }) {
    const supabase = this._getAdminClient();

    const { data: task } = await supabase
      .from('workflow_tasks')
      .select('id, instance_id')
      .eq('id', task_id)
      .single();

    if (!task) throw new Error('Task not found');

    await supabase
      .from('workflow_tasks')
      .update({ assignee_id: new_assignee_id })
      .eq('id', task_id);

    await supabase.from('workflow_history').insert({
      instance_id: task.instance_id,
      event_type: 'REASSIGNED',
      actor_id: user_id,
      task_id,
      notes: reason || `Reassigned to user ${new_assignee_id}`
    });

    return { success: true };
  }

  /**
   * Get Workflow Dashboard telemetry
   */
  async getDashboardTelemetry(userId, role) {
    const supabase = this._getAdminClient();

    const { count: activeCount } = await supabase
      .from('workflow_instances')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'In Progress');

    const { count: myPendingCount } = await supabase
      .from('workflow_tasks')
      .select('id', { count: 'exact', head: true })
      .eq('assignee_id', userId)
      .eq('status', 'Pending');

    const now = new Date().toISOString();
    const { count: overdueCount } = await supabase
      .from('workflow_tasks')
      .select('id', { count: 'exact', head: true })
      .eq('assignee_id', userId)
      .eq('status', 'Pending')
      .lt('due_date', now);

    const { count: rejectedCount } = await supabase
      .from('workflow_instances')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'Rejected');

    const { count: changesCount } = await supabase
      .from('workflow_instances')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'Changes Requested');

    const { count: exceptionCount } = await supabase
      .from('workflow_exceptions')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'OPEN');

    return {
      activeWorkflows: activeCount || 0,
      myPendingTasks: myPendingCount || 0,
      overdueTasks: overdueCount || 0,
      rejectedWorkflows: rejectedCount || 0,
      changesRequested: changesCount || 0,
      exceptions: exceptionCount || 0
    };
  }
}

module.exports = new WorkflowEngineService();
