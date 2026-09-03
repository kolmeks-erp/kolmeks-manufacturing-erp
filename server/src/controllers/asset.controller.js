const { supabaseAdmin } = require('../config/supabase');

// Helper to generate sequential formatted numbers
const generateDocNumber = async (prefix, sequenceName, tableName, fieldName) => {
  try {
    const { data: seqData, error: seqErr } = await supabaseAdmin.rpc('nextval', { seq_name: sequenceName });
    if (!seqErr && seqData) {
      return `${prefix}-2026-${String(seqData).padStart(6, '0')}`;
    }
  } catch (err) {
    // Fallback if rpc is not available
  }
  const { count, error } = await supabaseAdmin
    .from(tableName)
    .select('id', { count: 'exact', head: true });
  const nextNum = (count || 0) + 1;
  return `${prefix}-2026-${String(nextNum).padStart(6, '0')}`;
};

// Helper to get fallback account IDs if category defaults are missing
const getAccountIds = async (cat, asset) => {
  let assetAccId = asset?.asset_account_id || cat?.default_asset_account_id;
  let accumDepAccId = asset?.accumulated_depreciation_account_id || cat?.default_accumulated_depreciation_account_id;
  let depExpAccId = asset?.depreciation_expense_account_id || cat?.default_depreciation_expense_account_id;

  const { data: accounts } = await supabaseAdmin
    .from('chart_of_accounts')
    .select('id, account_code')
    .in('account_code', ['1510', '1550', '5600', '2110', '1120', '4300', '5700']);

  const accMap = {};
  if (accounts) {
    accounts.forEach((a) => {
      accMap[a.account_code] = a.id;
    });
  }

  return {
    assetAccId: assetAccId || accMap['1510'],
    accumDepAccId: accumDepAccId || accMap['1550'],
    depExpAccId: depExpAccId || accMap['5600'],
    apPayableAccId: accMap['2110'] || accMap['1120'],
    bankAccId: accMap['1120'] || accMap['2110'],
    gainAccId: accMap['4300'],
    lossAccId: accMap['5700'],
  };
};

const assetController = {
  // ==========================================================================
  // 1. ASSET CATEGORIES MANAGEMENT
  // ==========================================================================
  getCategories: async (req, res) => {
    try {
      const { data: categories, error } = await supabaseAdmin
        .from('fixed_asset_categories')
        .select(`
          *,
          default_asset_account:chart_of_accounts!default_asset_account_id(id, account_code, account_name),
          default_accumulated_depreciation_account:chart_of_accounts!default_accumulated_depreciation_account_id(id, account_code, account_name),
          default_depreciation_expense_account:chart_of_accounts!default_depreciation_expense_account_id(id, account_code, account_name)
        `)
        .order('name', { ascending: true });

      if (error) throw error;
      return res.status(200).json({ success: true, data: categories || [] });
    } catch (error) {
      console.error('Error fetching asset categories:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  getCategoryById: async (req, res) => {
    try {
      const { id } = req.params;
      const { data: category, error } = await supabaseAdmin
        .from('fixed_asset_categories')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return res.status(200).json({ success: true, data: category });
    } catch (error) {
      return res.status(404).json({ success: false, message: 'Asset category not found.' });
    }
  },

  createCategory: async (req, res) => {
    try {
      const {
        code,
        name,
        description,
        default_asset_account_id,
        default_accumulated_depreciation_account_id,
        default_depreciation_expense_account_id,
        default_useful_life_months,
        default_depreciation_method,
      } = req.body;

      if (!code || !name) {
        return res.status(400).json({ success: false, message: 'Category code and name are required.' });
      }

      const { data: category, error } = await supabaseAdmin
        .from('fixed_asset_categories')
        .insert({
          code: code.trim().toUpperCase(),
          name: name.trim(),
          description: description ? description.trim() : null,
          default_asset_account_id,
          default_accumulated_depreciation_account_id,
          default_depreciation_expense_account_id,
          default_useful_life_months: Number(default_useful_life_months) || 60,
          default_depreciation_method: default_depreciation_method || 'STRAIGHT_LINE',
          created_by: req.user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json({ success: true, message: 'Asset category created.', data: category });
    } catch (error) {
      console.error('Error creating asset category:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  updateCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        name,
        description,
        default_asset_account_id,
        default_accumulated_depreciation_account_id,
        default_depreciation_expense_account_id,
        default_useful_life_months,
        default_depreciation_method,
        is_active,
      } = req.body;

      const { data: category, error } = await supabaseAdmin
        .from('fixed_asset_categories')
        .update({
          name: name ? name.trim() : undefined,
          description: description !== undefined ? description.trim() : undefined,
          default_asset_account_id,
          default_accumulated_depreciation_account_id,
          default_depreciation_expense_account_id,
          default_useful_life_months: default_useful_life_months ? Number(default_useful_life_months) : undefined,
          default_depreciation_method: default_depreciation_method || undefined,
          is_active: is_active !== undefined ? is_active : undefined,
          updated_at: new Date().toISOString(),
          updated_by: req.user?.id,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json({ success: true, message: 'Asset category updated.', data: category });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // ==========================================================================
  // 2. FIXED ASSET REGISTER & CAPITALIZATION
  // ==========================================================================
  getAssets: async (req, res) => {
    try {
      const { category_id, status, cost_center_id, search } = req.query;

      let query = supabaseAdmin
        .from('fixed_assets')
        .select(`
          *,
          category:fixed_asset_categories!category_id(id, code, name),
          cost_center:cost_centers!cost_center_id(id, code, name),
          operational_asset:assets!operational_asset_id(id, asset_code, name, status),
          purchase_invoice:purchase_invoices!purchase_invoice_id(id, invoice_number),
          supplier:suppliers!supplier_id(id, supplier_code, name)
        `)
        .order('created_at', { ascending: false });

      if (category_id) query = query.eq('category_id', category_id);
      if (status) query = query.eq('status', status);
      if (cost_center_id) query = query.eq('cost_center_id', cost_center_id);
      if (search) {
        query = query.or(`asset_number.ilike.%${search}%,asset_name.ilike.%${search}%`);
      }

      const { data: assets, error } = await query;
      if (error) throw error;
      return res.status(200).json({ success: true, data: assets || [] });
    } catch (error) {
      console.error('Error fetching fixed assets:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  getAssetById: async (req, res) => {
    try {
      const { id } = req.params;
      const { data: asset, error } = await supabaseAdmin
        .from('fixed_assets')
        .select(`
          *,
          category:fixed_asset_categories(*),
          cost_center:cost_centers(*),
          operational_asset:assets(*),
          purchase_invoice:purchase_invoices(*),
          supplier:suppliers(*),
          asset_account:chart_of_accounts!asset_account_id(id, account_code, account_name),
          accumulated_depreciation_account:chart_of_accounts!accumulated_depreciation_account_id(id, account_code, account_name),
          depreciation_expense_account:chart_of_accounts!depreciation_expense_account_id(id, account_code, account_name),
          capitalization_journal:journal_entries!capitalization_journal_id(id, journal_number, entry_date, status),
          disposal_journal:journal_entries!disposal_journal_id(id, journal_number, entry_date, status)
        `)
        .eq('id', id)
        .single();

      if (error || !asset) {
        return res.status(404).json({ success: false, message: 'Fixed asset not found.' });
      }

      // Fetch depreciation history entries
      const { data: depEntries } = await supabaseAdmin
        .from('fixed_asset_depreciation_entries')
        .select('*')
        .eq('asset_id', id)
        .order('depreciation_date', { ascending: false });

      // Fetch transfer history
      const { data: transfers } = await supabaseAdmin
        .from('fixed_asset_transfers')
        .select(`
          *,
          from_cost_center:cost_centers!from_cost_center_id(id, code, name),
          to_cost_center:cost_centers!to_cost_center_id(id, code, name)
        `)
        .eq('asset_id', id)
        .order('transfer_date', { ascending: false });

      // Fetch disposal history if disposed
      const { data: disposal } = await supabaseAdmin
        .from('fixed_asset_disposals')
        .select('*')
        .eq('asset_id', id)
        .order('created_at', { ascending: false })
        .maybeSingle();

      return res.status(200).json({
        success: true,
        data: {
          ...asset,
          depreciation_entries: depEntries || [],
          transfers: transfers || [],
          disposal: disposal || null,
        },
      });
    } catch (error) {
      console.error('Error fetching asset detail:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  createAsset: async (req, res) => {
    try {
      const {
        operational_asset_id,
        asset_name,
        category_id,
        description,
        acquisition_date,
        acquisition_cost,
        residual_value,
        useful_life_months,
        depreciation_method,
        cost_center_id,
        location_id,
        purchase_invoice_id,
        supplier_id,
        purchase_order_id,
        asset_account_id,
        accumulated_depreciation_account_id,
        depreciation_expense_account_id,
      } = req.body;

      if (!asset_name || !category_id || !acquisition_date || acquisition_cost === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Asset name, category, acquisition date, and acquisition cost are required.',
        });
      }

      const costNum = Number(acquisition_cost);
      const resNum = Number(residual_value || 0);
      const lifeMonths = Number(useful_life_months || 60);

      // Business Rule Validation: Useful life > 0, Residual <= Acquisition Cost
      if (costNum < 0) {
        return res.status(400).json({ success: false, message: 'Acquisition cost must be non-negative.' });
      }
      if (resNum < 0 || resNum > costNum) {
        return res.status(400).json({
          success: false,
          message: 'Residual value must be greater than or equal to 0 and less than or equal to Acquisition Cost.',
        });
      }
      if (lifeMonths <= 0) {
        return res.status(400).json({ success: false, message: 'Useful life in months must be greater than 0.' });
      }

      // Fetch category defaults for accounts if not explicitly provided
      const { data: category } = await supabaseAdmin
        .from('fixed_asset_categories')
        .select('*')
        .eq('id', category_id)
        .single();

      const accs = await getAccountIds(category, {
        asset_account_id,
        accumulated_depreciation_account_id,
        depreciation_expense_account_id,
      });

      const assetNumber = await generateDocNumber('FA', 'fixed_asset_seq', 'fixed_assets', 'asset_number');
      const netBookValue = costNum;

      const { data: asset, error } = await supabaseAdmin
        .from('fixed_assets')
        .insert({
          asset_number: assetNumber,
          operational_asset_id: operational_asset_id || null,
          asset_name: asset_name.trim(),
          category_id,
          description: description ? description.trim() : null,
          acquisition_date,
          acquisition_cost: costNum,
          residual_value: resNum,
          useful_life_months: lifeMonths,
          depreciation_method: depreciation_method || category?.default_depreciation_method || 'STRAIGHT_LINE',
          accumulated_depreciation: 0.00,
          net_book_value: netBookValue,
          status: 'ACQUIRED',
          cost_center_id: cost_center_id || null,
          location_id: location_id ? location_id.trim() : null,
          purchase_invoice_id: purchase_invoice_id || null,
          supplier_id: supplier_id || null,
          purchase_order_id: purchase_order_id || null,
          asset_account_id: accs.assetAccId,
          accumulated_depreciation_account_id: accs.accumDepAccId,
          depreciation_expense_account_id: accs.depExpAccId,
          created_by: req.user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Audit Log
      await supabaseAdmin.from('fixed_asset_audit_logs').insert({
        asset_id: asset.id,
        action: 'ASSET_CREATED',
        performed_by: req.user?.id,
        details: { asset_number: assetNumber, cost: costNum, status: 'ACQUIRED' },
      });

      return res.status(201).json({ success: true, message: 'Fixed asset registered.', data: asset });
    } catch (error) {
      console.error('Error creating fixed asset:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  updateAsset: async (req, res) => {
    try {
      const { id } = req.params;
      const { data: existingAsset } = await supabaseAdmin
        .from('fixed_assets')
        .select('*')
        .eq('id', id)
        .single();

      if (!existingAsset) {
        return res.status(404).json({ success: false, message: 'Fixed asset not found.' });
      }

      if (['CAPITALIZED', 'ACTIVE', 'FULLY_DEPRECIATED', 'DISPOSED'].includes(existingAsset.status)) {
        return res.status(400).json({
          success: false,
          message: 'Cannot modify financial core attributes of a capitalized or active fixed asset directly.',
        });
      }

      const {
        asset_name,
        category_id,
        description,
        acquisition_date,
        acquisition_cost,
        residual_value,
        useful_life_months,
        cost_center_id,
        location_id,
      } = req.body;

      const { data: updated, error } = await supabaseAdmin
        .from('fixed_assets')
        .update({
          asset_name: asset_name ? asset_name.trim() : undefined,
          category_id: category_id || undefined,
          description: description !== undefined ? description.trim() : undefined,
          acquisition_date: acquisition_date || undefined,
          acquisition_cost: acquisition_cost !== undefined ? Number(acquisition_cost) : undefined,
          residual_value: residual_value !== undefined ? Number(residual_value) : undefined,
          useful_life_months: useful_life_months !== undefined ? Number(useful_life_months) : undefined,
          cost_center_id: cost_center_id !== undefined ? cost_center_id : undefined,
          location_id: location_id !== undefined ? location_id.trim() : undefined,
          updated_at: new Date().toISOString(),
          updated_by: req.user?.id,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json({ success: true, message: 'Fixed asset updated.', data: updated });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // Atomic Capitalization with Accounting Entry
  capitalizeAsset: async (req, res) => {
    try {
      const { id } = req.params;
      const { data: asset } = await supabaseAdmin
        .from('fixed_assets')
        .select('*, category:fixed_asset_categories(*)')
        .eq('id', id)
        .single();

      if (!asset) {
        return res.status(404).json({ success: false, message: 'Fixed asset not found.' });
      }

      if (['CAPITALIZED', 'ACTIVE', 'DISPOSED'].includes(asset.status)) {
        return res.status(400).json({ success: false, message: `Asset is already ${asset.status}.` });
      }

      if (Number(asset.acquisition_cost) <= 0) {
        return res.status(400).json({ success: false, message: 'Cannot capitalize asset with zero acquisition cost.' });
      }

      // Check open financial period
      const { data: openPeriod } = await supabaseAdmin
        .from('financial_periods')
        .select('id, period_name')
        .eq('status', 'OPEN')
        .order('start_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!openPeriod) {
        return res.status(400).json({
          success: false,
          message: 'No open financial period found. Capitalization requires an OPEN financial period.',
        });
      }

      const accs = await getAccountIds(asset.category, asset);
      const journalNumber = await generateDocNumber('JE', 'journal_entry_seq', 'journal_entries', 'journal_number');

      // 1. Post Balanced Journal Entry (Debit Fixed Asset / Credit Accounts Payable)
      const { data: journalEntry, error: jeErr } = await supabaseAdmin
        .from('journal_entries')
        .insert({
          journal_number: journalNumber,
          entry_date: asset.acquisition_date || new Date().toISOString().split('T')[0],
          financial_period_id: openPeriod.id,
          reference_type: 'FIXED_ASSET_CAPITALIZATION',
          reference_id: asset.id,
          description: `Capitalization of Fixed Asset [${asset.asset_number}] - ${asset.asset_name}`,
          status: 'POSTED',
          total_debit: asset.acquisition_cost,
          total_credit: asset.acquisition_cost,
          posted_at: new Date().toISOString(),
          posted_by: req.user?.id,
          created_by: req.user?.id,
        })
        .select()
        .single();

      if (jeErr) throw jeErr;

      // Journal Entry Lines
      await supabaseAdmin.from('journal_entry_lines').insert([
        {
          journal_entry_id: journalEntry.id,
          account_id: accs.assetAccId,
          description: `Capitalize Fixed Asset ${asset.asset_number}`,
          debit: asset.acquisition_cost,
          credit: 0,
        },
        {
          journal_entry_id: journalEntry.id,
          account_id: accs.apPayableAccId,
          description: `Acquisition Payable for ${asset.asset_number}`,
          debit: 0,
          credit: asset.acquisition_cost,
        },
      ]);

      // 2. Update Asset Status to CAPITALIZED & ACTIVE
      const capitalizationDate = new Date().toISOString().split('T')[0];
      const { data: capitalizedAsset, error: capErr } = await supabaseAdmin
        .from('fixed_assets')
        .update({
          status: 'ACTIVE',
          capitalization_date: capitalizationDate,
          capitalization_journal_id: journalEntry.id,
          approved_at: new Date().toISOString(),
          approved_by: req.user?.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (capErr) throw capErr;

      // Audit log
      await supabaseAdmin.from('fixed_asset_audit_logs').insert({
        asset_id: id,
        action: 'ASSET_CAPITALIZED',
        performed_by: req.user?.id,
        details: { journal_number: journalNumber, cost: asset.acquisition_cost, capitalization_date: capitalizationDate },
      });

      return res.status(200).json({
        success: true,
        message: `Asset ${asset.asset_number} capitalized and journalized successfully.`,
        data: capitalizedAsset,
        journal_entry: journalEntry,
      });
    } catch (error) {
      console.error('Error capitalizing asset:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // ==========================================================================
  // 3. STRAIGHT-LINE DEPRECIATION ENGINE & SCHEDULE GENERATION
  // ==========================================================================
  getDepreciationSchedule: async (req, res) => {
    try {
      const { id } = req.params;
      const { data: asset } = await supabaseAdmin
        .from('fixed_assets')
        .select('*')
        .eq('id', id)
        .single();

      if (!asset) {
        return res.status(404).json({ success: false, message: 'Fixed asset not found.' });
      }

      const cost = Number(asset.acquisition_cost);
      const residual = Number(asset.residual_value);
      const usefulMonths = Number(asset.useful_life_months);

      const depreciableAmount = Math.max(0, cost - residual);
      const monthlyDepreciation = usefulMonths > 0 ? depreciableAmount / usefulMonths : 0;

      const schedule = [];
      let currentOpeningNBV = cost;
      let currentAccumDep = 0;
      const startDate = new Date(asset.capitalization_date || asset.acquisition_date || Date.now());

      for (let i = 1; i <= usefulMonths; i++) {
        const periodDate = new Date(startDate.getFullYear(), startDate.getMonth() + i - 1, 1);
        const periodName = `${periodDate.getFullYear()}-${String(periodDate.getMonth() + 1).padStart(2, '0')}`;

        // Last period adjustment to ensure NBV never goes below Residual Value
        let periodDep = monthlyDepreciation;
        if (i === usefulMonths || (currentOpeningNBV - periodDep) < residual) {
          periodDep = Math.max(0, currentOpeningNBV - residual);
        }

        const closingNBV = Math.max(residual, currentOpeningNBV - periodDep);
        currentAccumDep += periodDep;

        schedule.push({
          period_number: i,
          period_name: periodName,
          opening_nbv: Number(currentOpeningNBV.toFixed(2)),
          depreciation_amount: Number(periodDep.toFixed(2)),
          accumulated_depreciation: Number(currentAccumDep.toFixed(2)),
          closing_nbv: Number(closingNBV.toFixed(2)),
        });

        currentOpeningNBV = closingNBV;
        if (closingNBV <= residual) break;
      }

      return res.status(200).json({
        success: true,
        data: {
          asset_number: asset.asset_number,
          asset_name: asset.asset_name,
          acquisition_cost: cost,
          residual_value: residual,
          useful_life_months: usefulMonths,
          depreciable_amount: depreciableAmount,
          monthly_depreciation: Number(monthlyDepreciation.toFixed(2)),
          schedule,
        },
      });
    } catch (error) {
      console.error('Error generating depreciation schedule:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // Depreciation Run Preview
  previewDepreciationRun: async (req, res) => {
    try {
      const { period_id } = req.body;

      if (!period_id) {
        return res.status(400).json({ success: false, message: 'Financial period ID is required.' });
      }

      const { data: period } = await supabaseAdmin
        .from('financial_periods')
        .select('*')
        .eq('id', period_id)
        .single();

      if (!period) {
        return res.status(404).json({ success: false, message: 'Financial period not found.' });
      }

      // Fetch active assets eligible for depreciation
      const { data: activeAssets } = await supabaseAdmin
        .from('fixed_assets')
        .select('*, category:fixed_asset_categories(*)')
        .in('status', ['CAPITALIZED', 'ACTIVE'])
        .order('asset_number', { ascending: true });

      // Fetch existing depreciation entries for this period to prevent duplicate runs
      const { data: existingEntries } = await supabaseAdmin
        .from('fixed_asset_depreciation_entries')
        .select('asset_id')
        .eq('period_name', period.period_name);

      const existingAssetIds = new Set((existingEntries || []).map((e) => e.asset_id));

      let totalDepreciation = 0;
      const previewItems = [];

      for (const ast of activeAssets || []) {
        if (existingAssetIds.has(ast.id)) continue;

        const cost = Number(ast.acquisition_cost);
        const residual = Number(ast.residual_value);
        const currentNBV = Number(ast.net_book_value);
        const usefulMonths = Number(ast.useful_life_months);

        if (currentNBV <= residual) continue;

        const totalDepreciable = Math.max(0, cost - residual);
        const standardMonthlyDep = usefulMonths > 0 ? totalDepreciable / usefulMonths : 0;
        const maxAllowedDep = Math.max(0, currentNBV - residual);

        const periodDep = Math.min(standardMonthlyDep, maxAllowedDep);
        if (periodDep <= 0) continue;

        const closingNBV = Math.max(residual, currentNBV - periodDep);
        const newAccumDep = Number(ast.accumulated_depreciation) + periodDep;

        totalDepreciation += periodDep;
        previewItems.push({
          asset_id: ast.id,
          asset_number: ast.asset_number,
          asset_name: ast.asset_name,
          category_name: ast.category?.name || 'N/A',
          opening_nbv: Number(currentNBV.toFixed(2)),
          depreciation_amount: Number(periodDep.toFixed(2)),
          accumulated_depreciation: Number(newAccumDep.toFixed(2)),
          closing_nbv: Number(closingNBV.toFixed(2)),
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          period_id: period.id,
          period_name: period.period_name,
          total_assets_count: previewItems.length,
          total_depreciation_amount: Number(totalDepreciation.toFixed(2)),
          items: previewItems,
        },
      });
    } catch (error) {
      console.error('Error previewing depreciation run:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // Atomic Depreciation Posting with Journal Entry
  postDepreciationRun: async (req, res) => {
    try {
      const { period_id } = req.body;

      if (!period_id) {
        return res.status(400).json({ success: false, message: 'Financial period ID is required.' });
      }

      const { data: period } = await supabaseAdmin
        .from('financial_periods')
        .select('*')
        .eq('id', period_id)
        .single();

      if (!period) {
        return res.status(404).json({ success: false, message: 'Financial period not found.' });
      }

      if (period.status === 'CLOSED') {
        return res.status(400).json({
          success: false,
          message: `Financial Period '${period.period_name}' is CLOSED. Cannot post depreciation into a closed period.`,
        });
      }

      // Check if posted run already exists for period
      const { data: existingRun } = await supabaseAdmin
        .from('depreciation_runs')
        .select('id, run_number')
        .eq('period_id', period_id)
        .eq('status', 'POSTED')
        .maybeSingle();

      if (existingRun) {
        return res.status(400).json({
          success: false,
          message: `Depreciation run for period '${period.period_name}' has already been posted (${existingRun.run_number}).`,
        });
      }

      // Fetch active assets
      const { data: activeAssets } = await supabaseAdmin
        .from('fixed_assets')
        .select('*, category:fixed_asset_categories(*)')
        .in('status', ['CAPITALIZED', 'ACTIVE'])
        .order('asset_number', { ascending: true });

      const runItems = [];
      let totalDepreciation = 0;

      for (const ast of activeAssets || []) {
        const cost = Number(ast.acquisition_cost);
        const residual = Number(ast.residual_value);
        const currentNBV = Number(ast.net_book_value);
        const usefulMonths = Number(ast.useful_life_months);

        if (currentNBV <= residual) continue;

        const totalDepreciable = Math.max(0, cost - residual);
        const standardMonthlyDep = usefulMonths > 0 ? totalDepreciable / usefulMonths : 0;
        const maxAllowedDep = Math.max(0, currentNBV - residual);

        const periodDep = Math.min(standardMonthlyDep, maxAllowedDep);
        if (periodDep <= 0) continue;

        const closingNBV = Math.max(residual, currentNBV - periodDep);
        const newAccumDep = Number(ast.accumulated_depreciation) + periodDep;

        totalDepreciation += periodDep;
        runItems.push({
          asset: ast,
          opening_nbv: currentNBV,
          depreciation_amount: periodDep,
          accumulated_depreciation: newAccumDep,
          closing_nbv: closingNBV,
        });
      }

      if (runItems.length === 0 || totalDepreciation <= 0) {
        return res.status(400).json({
          success: false,
          message: 'No eligible active assets found for depreciation in this period.',
        });
      }

      const runNumber = await generateDocNumber('DEP-RUN', 'depreciation_run_seq', 'depreciation_runs', 'run_number');
      const journalNumber = await generateDocNumber('JE', 'journal_entry_seq', 'journal_entries', 'journal_number');

      // 1. Post Balanced Journal Entry (Debit Depreciation Expense 5600 / Credit Accum Dep 1550)
      const accs = await getAccountIds();
      const { data: journalEntry, error: jeErr } = await supabaseAdmin
        .from('journal_entries')
        .insert({
          journal_number: journalNumber,
          entry_date: new Date().toISOString().split('T')[0],
          financial_period_id: period.id,
          reference_type: 'FIXED_ASSET_DEPRECIATION',
          reference_id: runNumber,
          description: `Monthly Fixed Asset Depreciation Run [${runNumber}] for ${period.period_name}`,
          status: 'POSTED',
          total_debit: totalDepreciation,
          total_credit: totalDepreciation,
          posted_at: new Date().toISOString(),
          posted_by: req.user?.id,
          created_by: req.user?.id,
        })
        .select()
        .single();

      if (jeErr) throw jeErr;

      // Journal Lines
      await supabaseAdmin.from('journal_entry_lines').insert([
        {
          journal_entry_id: journalEntry.id,
          account_id: accs.depExpAccId,
          description: `Depreciation Expense for period ${period.period_name}`,
          debit: totalDepreciation,
          credit: 0,
        },
        {
          journal_entry_id: journalEntry.id,
          account_id: accs.accumDepAccId,
          description: `Accumulated Depreciation for period ${period.period_name}`,
          debit: 0,
          credit: totalDepreciation,
        },
      ]);

      // 2. Create Depreciation Run Record
      const { data: depRun, error: runErr } = await supabaseAdmin
        .from('depreciation_runs')
        .insert({
          run_number: runNumber,
          period_id: period.id,
          period_name: period.period_name,
          run_date: new Date().toISOString().split('T')[0],
          total_depreciation_amount: totalDepreciation,
          total_assets_count: runItems.length,
          status: 'POSTED',
          journal_entry_id: journalEntry.id,
          posted_at: new Date().toISOString(),
          posted_by: req.user?.id,
          created_by: req.user?.id,
        })
        .select()
        .single();

      if (runErr) throw runErr;

      // 3. Insert Depreciation Entries and Update Assets
      for (const item of runItems) {
        await supabaseAdmin.from('fixed_asset_depreciation_entries').insert({
          asset_id: item.asset.id,
          depreciation_run_id: depRun.id,
          period_name: period.period_name,
          depreciation_date: new Date().toISOString().split('T')[0],
          opening_nbv: item.opening_nbv,
          depreciation_amount: item.depreciation_amount,
          accumulated_depreciation: item.accumulated_depreciation,
          closing_nbv: item.closing_nbv,
          journal_entry_id: journalEntry.id,
          status: 'POSTED',
        });

        const newStatus = item.closing_nbv <= Number(item.asset.residual_value) ? 'FULLY_DEPRECIATED' : item.asset.status;
        await supabaseAdmin
          .from('fixed_assets')
          .update({
            accumulated_depreciation: item.accumulated_depreciation,
            net_book_value: item.closing_nbv,
            status: newStatus,
            updated_at: new Date().toISOString(),
          })
          .eq('id', item.asset.id);
      }

      return res.status(200).json({
        success: true,
        message: `Depreciation run ${runNumber} posted successfully for ${runItems.length} assets.`,
        data: depRun,
        journal_entry: journalEntry,
      });
    } catch (error) {
      console.error('Error posting depreciation run:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // ==========================================================================
  // 4. ASSET TRANSFERS
  // ==========================================================================
  getTransfers: async (req, res) => {
    try {
      const { data: transfers, error } = await supabaseAdmin
        .from('fixed_asset_transfers')
        .select(`
          *,
          asset:fixed_assets(id, asset_number, asset_name),
          from_cost_center:cost_centers!from_cost_center_id(id, code, name),
          to_cost_center:cost_centers!to_cost_center_id(id, code, name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return res.status(200).json({ success: true, data: transfers || [] });
    } catch (error) {
      console.error('Error fetching asset transfers:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  transferAsset: async (req, res) => {
    try {
      const { id } = req.params;
      const { to_cost_center_id, to_location, transfer_date, reason } = req.body;

      if (!reason) {
        return res.status(400).json({ success: false, message: 'Transfer reason is required.' });
      }

      const { data: asset } = await supabaseAdmin
        .from('fixed_assets')
        .select('*')
        .eq('id', id)
        .single();

      if (!asset) {
        return res.status(404).json({ success: false, message: 'Fixed asset not found.' });
      }

      const transferNumber = await generateDocNumber('FAT', 'asset_transfer_seq', 'fixed_asset_transfers', 'transfer_number');
      const xferDate = transfer_date || new Date().toISOString().split('T')[0];

      // 1. Create Transfer Register Entry
      const { data: xfer, error: xferErr } = await supabaseAdmin
        .from('fixed_asset_transfers')
        .insert({
          transfer_number: transferNumber,
          asset_id: id,
          from_cost_center_id: asset.cost_center_id || null,
          to_cost_center_id: to_cost_center_id || null,
          from_location: asset.location_id || null,
          to_location: to_location ? to_location.trim() : null,
          transfer_date: xferDate,
          reason: reason.trim(),
          approved_by: req.user?.id,
          approved_at: new Date().toISOString(),
          created_by: req.user?.id,
        })
        .select()
        .single();

      if (xferErr) throw xferErr;

      // 2. Update Asset Cost Center & Location
      await supabaseAdmin
        .from('fixed_assets')
        .update({
          cost_center_id: to_cost_center_id || asset.cost_center_id,
          location_id: to_location ? to_location.trim() : asset.location_id,
          updated_at: new Date().toISOString(),
          updated_by: req.user?.id,
        })
        .eq('id', id);

      // Audit Log
      await supabaseAdmin.from('fixed_asset_audit_logs').insert({
        asset_id: id,
        action: 'ASSET_TRANSFERRED',
        performed_by: req.user?.id,
        details: { transfer_number: transferNumber, to_cost_center_id, to_location },
      });

      return res.status(200).json({
        success: true,
        message: `Asset ${asset.asset_number} transferred successfully.`,
        data: xfer,
      });
    } catch (error) {
      console.error('Error transferring asset:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // ==========================================================================
  // 5. ASSET DISPOSALS & GAIN/LOSS ACCOUNTING
  // ==========================================================================
  getDisposals: async (req, res) => {
    try {
      const { data: disposals, error } = await supabaseAdmin
        .from('fixed_asset_disposals')
        .select(`
          *,
          asset:fixed_assets(id, asset_number, asset_name, acquisition_cost, net_book_value),
          journal_entry:journal_entries(id, journal_number)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return res.status(200).json({ success: true, data: disposals || [] });
    } catch (error) {
      console.error('Error fetching asset disposals:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  disposeAsset: async (req, res) => {
    try {
      const { id } = req.params;
      const { disposal_date, disposal_reason, disposal_proceeds, buyer_reference, notes } = req.body;

      if (!disposal_reason) {
        return res.status(400).json({ success: false, message: 'Disposal reason is required.' });
      }

      const { data: asset } = await supabaseAdmin
        .from('fixed_assets')
        .select('*, category:fixed_asset_categories(*)')
        .eq('id', id)
        .single();

      if (!asset) {
        return res.status(404).json({ success: false, message: 'Fixed asset not found.' });
      }

      if (asset.status === 'DISPOSED' || asset.status === 'RETIRED') {
        return res.status(400).json({ success: false, message: 'Asset is already disposed or retired.' });
      }

      const proceeds = Number(disposal_proceeds || 0);
      const cost = Number(asset.acquisition_cost);
      const accumDep = Number(asset.accumulated_depreciation);
      const bookValue = Number(asset.net_book_value);
      const gainLossAmount = proceeds - bookValue; // Positive = Gain, Negative = Loss

      const disposalNumber = await generateDocNumber('FAD', 'asset_disposal_seq', 'fixed_asset_disposals', 'disposal_number');
      const dispDate = disposal_date || new Date().toISOString().split('T')[0];

      // Check open financial period
      const { data: openPeriod } = await supabaseAdmin
        .from('financial_periods')
        .select('id, period_name')
        .eq('status', 'OPEN')
        .order('start_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!openPeriod) {
        return res.status(400).json({
          success: false,
          message: 'No open financial period found. Asset disposal requires an OPEN financial period.',
        });
      }

      const accs = await getAccountIds(asset.category, asset);
      const journalNumber = await generateDocNumber('JE', 'journal_entry_seq', 'journal_entries', 'journal_number');

      // 1. Post Balanced Disposal Journal Entry
      // Debits: AccumDep + Cash/Proceeds + Loss (if any)
      // Credits: Asset Cost + Gain (if any)
      const lines = [];
      let totalDebit = 0;
      let totalCredit = 0;

      // Debit Accumulated Depreciation (to clear asset accum dep)
      if (accumDep > 0) {
        lines.push({ account_id: accs.accumDepAccId, description: `Clear Accum Dep for ${asset.asset_number}`, debit: accumDep, credit: 0 });
        totalDebit += accumDep;
      }

      // Debit Cash/Bank/Receivable if disposal proceeds > 0
      if (proceeds > 0) {
        lines.push({ account_id: accs.bankAccId, description: `Disposal proceeds for ${asset.asset_number}`, debit: proceeds, credit: 0 });
        totalDebit += proceeds;
      }

      // Debit Loss on Disposal if Loss > 0
      if (gainLossAmount < 0) {
        const lossVal = Math.abs(gainLossAmount);
        lines.push({ account_id: accs.lossAccId, description: `Loss on Disposal of ${asset.asset_number}`, debit: lossVal, credit: 0 });
        totalDebit += lossVal;
      }

      // Credit Original Asset Cost
      lines.push({ account_id: accs.assetAccId, description: `Clear Asset Cost for ${asset.asset_number}`, debit: 0, credit: cost });
      totalCredit += cost;

      // Credit Gain on Disposal if Gain > 0
      if (gainLossAmount > 0) {
        lines.push({ account_id: accs.gainAccId, description: `Gain on Disposal of ${asset.asset_number}`, debit: 0, credit: gainLossAmount });
        totalCredit += gainLossAmount;
      }

      // Post Header
      const { data: journalEntry, error: jeErr } = await supabaseAdmin
        .from('journal_entries')
        .insert({
          journal_number: journalNumber,
          entry_date: dispDate,
          financial_period_id: openPeriod.id,
          reference_type: 'FIXED_ASSET_DISPOSAL',
          reference_id: disposalNumber,
          description: `Disposal of Fixed Asset [${asset.asset_number}] - ${asset.asset_name} (${disposal_reason})`,
          status: 'POSTED',
          total_debit: totalDebit,
          total_credit: totalCredit,
          posted_at: new Date().toISOString(),
          posted_by: req.user?.id,
          created_by: req.user?.id,
        })
        .select()
        .single();

      if (jeErr) throw jeErr;

      // Post Lines
      for (const l of lines) {
        await supabaseAdmin.from('journal_entry_lines').insert({
          journal_entry_id: journalEntry.id,
          account_id: l.account_id,
          description: l.description,
          debit: l.debit,
          credit: l.credit,
        });
      }

      // 2. Create Asset Disposal Record
      const { data: disposal, error: dispErr } = await supabaseAdmin
        .from('fixed_asset_disposals')
        .insert({
          disposal_number: disposalNumber,
          asset_id: id,
          disposal_date: dispDate,
          disposal_reason,
          disposal_proceeds: proceeds,
          book_value_at_disposal: bookValue,
          accumulated_depreciation_at_disposal: accumDep,
          gain_loss_amount: gainLossAmount,
          buyer_reference: buyer_reference ? buyer_reference.trim() : null,
          status: 'APPROVED',
          journal_entry_id: journalEntry.id,
          submitted_by: req.user?.id,
          submitted_at: new Date().toISOString(),
          approved_by: req.user?.id,
          approved_at: new Date().toISOString(),
          notes: notes ? notes.trim() : null,
        })
        .select()
        .single();

      if (dispErr) throw dispErr;

      // 3. Update Asset Status to DISPOSED
      await supabaseAdmin
        .from('fixed_assets')
        .update({
          status: 'DISPOSED',
          disposal_date: dispDate,
          disposal_value: proceeds,
          gain_loss_amount: gainLossAmount,
          disposal_journal_id: journalEntry.id,
          updated_at: new Date().toISOString(),
          updated_by: req.user?.id,
        })
        .eq('id', id);

      // Audit Log
      await supabaseAdmin.from('fixed_asset_audit_logs').insert({
        asset_id: id,
        action: 'ASSET_DISPOSED',
        performed_by: req.user?.id,
        details: { disposal_number: disposalNumber, proceeds, gain_loss: gainLossAmount },
      });

      return res.status(200).json({
        success: true,
        message: `Asset ${asset.asset_number} disposed successfully. ${gainLossAmount >= 0 ? `Gain: ₹${gainLossAmount.toLocaleString()}` : `Loss: ₹${Math.abs(gainLossAmount).toLocaleString()}`}`,
        data: disposal,
        journal_entry: journalEntry,
      });
    } catch (error) {
      console.error('Error disposing fixed asset:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // ==========================================================================
  // 6. DASHBOARD TELEMETRY & FINANCIAL REPORTS
  // ==========================================================================
  getDashboardSummary: async (req, res) => {
    try {
      const { data: assets, error: assetsErr } = await supabaseAdmin
        .from('fixed_assets')
        .select('acquisition_cost, accumulated_depreciation, net_book_value, status');

      if (assetsErr) throw assetsErr;

      let totalGrossCost = 0;
      let totalAccumDep = 0;
      let totalNBV = 0;
      let activeCount = 0;
      let fullyDepreciatedCount = 0;
      let pendingCapCount = 0;
      let disposedCount = 0;

      (assets || []).forEach((a) => {
        if (a.status !== 'DISPOSED') {
          totalGrossCost += Number(a.acquisition_cost || 0);
          totalAccumDep += Number(a.accumulated_depreciation || 0);
          totalNBV += Number(a.net_book_value || 0);
        }

        if (['CAPITALIZED', 'ACTIVE'].includes(a.status)) activeCount++;
        if (a.status === 'FULLY_DEPRECIATED') fullyDepreciatedCount++;
        if (['DRAFT', 'ACQUIRED', 'PENDING_CAPITALIZATION'].includes(a.status)) pendingCapCount++;
        if (a.status === 'DISPOSED') disposedCount++;
      });

      // Latest monthly depreciation run total
      const { data: latestRun, error: runErr } = await supabaseAdmin
        .from('depreciation_runs')
        .select('total_depreciation_amount, period_name')
        .eq('status', 'POSTED')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (runErr && runErr.code !== 'PGRST116') throw runErr;

      return res.status(200).json({
        success: true,
        data: {
          total_gross_cost: totalGrossCost,
          total_accumulated_depreciation: totalAccumDep,
          total_net_book_value: totalNBV,
          current_period_depreciation: latestRun ? Number(latestRun.total_depreciation_amount) : 0,
          latest_depreciation_period: latestRun ? latestRun.period_name : 'N/A',
          active_assets_count: activeCount,
          fully_depreciated_count: fullyDepreciatedCount,
          pending_capitalization_count: pendingCapCount,
          disposed_count: disposedCount,
        },
      });
    } catch (error) {
      console.error('Error fetching asset dashboard KPIs:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  getReports: async (req, res) => {
    try {
      // 1. Asset Register
      const { data: assets, error: assetsErr } = await supabaseAdmin
        .from('fixed_assets')
        .select(`
          *,
          category:fixed_asset_categories!category_id(name),
          cost_center:cost_centers!cost_center_id(name)
        `)
        .order('asset_number', { ascending: true });

      if (assetsErr) throw assetsErr;

      // 2. Category Summary
      const { data: categories, error: catErr } = await supabaseAdmin
        .from('fixed_asset_categories')
        .select('*');

      if (catErr) throw catErr;

      const catSummaryMap = {};
      (categories || []).forEach((c) => {
        catSummaryMap[c.id] = {
          code: c.code,
          name: c.name,
          asset_count: 0,
          gross_cost: 0,
          accumulated_depreciation: 0,
          net_book_value: 0,
        };
      });

      (assets || []).forEach((a) => {
        if (catSummaryMap[a.category_id]) {
          catSummaryMap[a.category_id].asset_count++;
          catSummaryMap[a.category_id].gross_cost += Number(a.acquisition_cost || 0);
          catSummaryMap[a.category_id].accumulated_depreciation += Number(a.accumulated_depreciation || 0);
          catSummaryMap[a.category_id].net_book_value += Number(a.net_book_value || 0);
        }
      });

      // 3. Cost Center Summary
      const { data: costCenters, error: ccErr } = await supabaseAdmin
        .from('cost_centers')
        .select('id, code, name');

      if (ccErr) throw ccErr;

      const ccSummaryMap = {};
      (costCenters || []).forEach((cc) => {
        ccSummaryMap[cc.id] = {
          cost_center_code: cc.code,
          cost_center_name: cc.name,
          asset_count: 0,
          gross_cost: 0,
          accumulated_depreciation: 0,
          net_book_value: 0,
        };
      });

      (assets || []).forEach((a) => {
        if (a.cost_center_id && ccSummaryMap[a.cost_center_id]) {
          ccSummaryMap[a.cost_center_id].asset_count++;
          ccSummaryMap[a.cost_center_id].gross_cost += Number(a.acquisition_cost || 0);
          ccSummaryMap[a.cost_center_id].accumulated_depreciation += Number(a.accumulated_depreciation || 0);
          ccSummaryMap[a.cost_center_id].net_book_value += Number(a.net_book_value || 0);
        }
      });

      return res.status(200).json({
        success: true,
        data: {
          asset_register: assets || [],
          by_category: Object.values(catSummaryMap),
          by_cost_center: Object.values(ccSummaryMap),
        },
      });
    } catch (error) {
      console.error('Error fetching asset financial reports:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = assetController;
