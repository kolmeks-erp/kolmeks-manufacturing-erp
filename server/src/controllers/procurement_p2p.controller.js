const { supabaseAdmin: supabase } = require('../config/supabase');

// Helper to handle error responses safely
const handleError = (res, error, customMessage = 'Procurement P2P operation failed.') => {
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
// 1. PROCUREMENT TELEMETRY & DASHBOARD METRICS
// ==============================================================================
exports.getProcurementTelemetry = async (req, res) => {
  try {
    const [
      reqsRes,
      rfqsRes,
      quotesRes,
      posRes,
      grnsRes,
      holdsRes,
      returnsRes,
      apRes,
    ] = await Promise.all([
      supabase.from('purchase_requisitions').select('id, status', { count: 'exact' }).in('status', ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW']),
      supabase.from('rfqs').select('id, status', { count: 'exact' }).in('status', ['NEW', 'SUBMITTED', 'DRAFT', 'SENT']),
      supabase.from('supplier_quotations').select('id, status', { count: 'exact' }).eq('status', 'RECEIVED'),
      supabase.from('purchase_orders').select('id, status', { count: 'exact' }).in('status', ['PENDING_APPROVAL', 'APPROVED', 'SENT', 'PARTIALLY_RECEIVED']),
      supabase.from('goods_receipts').select('id, status', { count: 'exact' }).in('status', ['DRAFT', 'IN_PROGRESS']),
      supabase.from('goods_receipt_items').select('id', { count: 'exact' }).gt('rejected_quantity', 0),
      supabase.from('supplier_returns').select('id, status', { count: 'exact' }).in('status', ['REQUESTED', 'APPROVED', 'DISPATCHED']),
      supabase.from('purchase_invoices').select('outstanding_amount').neq('status', 'PAID'),
    ]);

    const totalOutstandingAP = (apRes.data || []).reduce((acc, curr) => acc + Number(curr.outstanding_amount || 0), 0);

    return res.status(200).json({
      success: true,
      data: {
        openRequisitionsCount: reqsRes.count || 0,
        openRFQsCount: rfqsRes.count || 0,
        pendingQuotesCount: quotesRes.count || 0,
        openPOsCount: posRes.count || 0,
        pendingReceiptsCount: grnsRes.count || 0,
        qualityHoldsCount: holdsRes.count || 0,
        supplierReturnsCount: returnsRes.count || 0,
        outstandingAPAmount: totalOutstandingAP,
      },
    });
  } catch (err) {
    return handleError(res, err, 'Failed to fetch procurement telemetry.');
  }
};

// ==============================================================================
// 2. SUPPLIER EVALUATION & PERFORMANCE RATING
// ==============================================================================
exports.evaluateSupplier = async (req, res) => {
  try {
    const { id } = req.params; // supplier_id
    const { quality_score, delivery_score, price_score, service_score, remarks } = req.body;

    const qScore = Number(quality_score || 100);
    const dScore = Number(delivery_score || 100);
    const pScore = Number(price_score || 100);
    const sScore = Number(service_score || 100);

    const overallScore = Number(((qScore + dScore + pScore + sScore) / 4).toFixed(2));
    const rating = Number((overallScore / 20).toFixed(2)); // Scale 1 to 5

    // Insert Evaluation
    const { data: evalData, error: evalErr } = await supabase
      .from('supplier_evaluations')
      .insert({
        supplier_id: id,
        evaluator_id: req.user?.id || null,
        quality_score: qScore,
        delivery_score: dScore,
        price_score: pScore,
        service_score: sScore,
        overall_score: overallScore,
        remarks,
      })
      .select()
      .single();

    if (evalErr) throw evalErr;

    // Update Supplier master summary scores
    await supabase
      .from('suppliers')
      .update({
        quality_score: qScore,
        delivery_score: dScore,
        price_score: pScore,
        service_score: sScore,
        overall_score: overallScore,
        rating: rating,
      })
      .eq('id', id);

    return res.status(201).json({
      success: true,
      message: 'Supplier evaluated successfully.',
      data: evalData,
    });
  } catch (err) {
    return handleError(res, err, 'Failed to evaluate supplier.');
  }
};

exports.getSupplierEvaluations = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('supplier_evaluations')
      .select('*, evaluator:evaluator_id(full_name, email)')
      .eq('supplier_id', id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data: data || [],
    });
  } catch (err) {
    return handleError(res, err, 'Failed to load supplier evaluations.');
  }
};

// ==============================================================================
// 3. SUPPLIER DOCUMENTS & ONBOARDING
// ==============================================================================
exports.addSupplierDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { document_name, category, file_path, expiry_date } = req.body;

    let docStatus = 'VALID';
    if (expiry_date) {
      const exp = new Date(expiry_date);
      const now = new Date();
      const diffDays = (exp.getTime() - now.getTime()) / (1000 * 3600 * 24);
      if (diffDays < 0) docStatus = 'EXPIRED';
      else if (diffDays <= 30) docStatus = 'EXPIRING_SOON';
    }

    const { data, error } = await supabase
      .from('supplier_documents')
      .insert({
        supplier_id: id,
        document_name,
        category: category || 'Other',
        file_path,
        expiry_date: expiry_date || null,
        status: docStatus,
        uploaded_by: req.user?.id || null,
      })
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      message: 'Document added to supplier vault.',
      data,
    });
  } catch (err) {
    return handleError(res, err, 'Failed to upload supplier document.');
  }
};

exports.getSupplierDocuments = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('supplier_documents')
      .select('*')
      .eq('supplier_id', id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data: data || [],
    });
  } catch (err) {
    return handleError(res, err, 'Failed to load supplier documents.');
  }
};

exports.updateSupplierOnboardingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { onboarding_status, remarks } = req.body;

    const updatePayload = {
      onboarding_status,
      onboarding_remarks: remarks || null,
      updated_at: new Date().toISOString(),
    };

    if (onboarding_status === 'APPROVED') {
      updatePayload.approved_by = req.user?.id || null;
      updatePayload.approved_at = new Date().toISOString();
      updatePayload.status = 'active';
    } else if (onboarding_status === 'REJECTED' || onboarding_status === 'SUSPENDED') {
      updatePayload.status = 'inactive';
    }

    const { data, error } = await supabase
      .from('suppliers')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: `Supplier onboarding status updated to ${onboarding_status}.`,
      data,
    });
  } catch (err) {
    return handleError(res, err, 'Failed to update supplier onboarding status.');
  }
};

// ==============================================================================
// 4. SUPPLIER QUOTATION & COMPARISON
// ==============================================================================
exports.createSupplierQuotation = async (req, res) => {
  try {
    const {
      rfq_id,
      supplier_id,
      supplier_reference,
      validity_date,
      lead_time_days,
      delivery_date,
      payment_terms,
      currency,
      items,
      remarks,
    } = req.body;

    // Generate unique Quotation Number: SQ-2026-XXXXXX
    const yearStr = new Date().getFullYear();
    const randNum = Math.floor(100000 + Math.random() * 900000);
    const quotationNumber = `SQ-${yearStr}-${randNum}`;

    let subtotal = 0;
    const processedItems = (items || []).map((item) => {
      const lineSubtotal = Number(item.quantity || 1) * Number(item.unit_price || 0) * (1 - Number(item.discount_percentage || 0) / 100);
      subtotal += lineSubtotal;
      return {
        product_id: item.product_id || null,
        description: item.description || 'Quoted Item',
        quantity: Number(item.quantity || 1),
        unit: item.unit || 'pcs',
        unit_price: Number(item.unit_price || 0),
        discount_percentage: Number(item.discount_percentage || 0),
        line_subtotal: lineSubtotal,
      };
    });

    const totalAmount = subtotal;

    const { data: quoteHeader, error: quoteErr } = await supabase
      .from('supplier_quotations')
      .insert({
        quotation_number: quotationNumber,
        supplier_reference,
        rfq_id: rfq_id || null,
        supplier_id,
        validity_date: validity_date || null,
        lead_time_days: Number(lead_time_days || 7),
        delivery_date: delivery_date || null,
        currency: currency || 'INR',
        payment_terms: payment_terms || 'Net 30 Days',
        subtotal,
        total_amount: totalAmount,
        status: 'RECEIVED',
        remarks,
        created_by: req.user?.id || null,
      })
      .select()
      .single();

    if (quoteErr) throw quoteErr;

    if (processedItems.length > 0) {
      const itemsToInsert = processedItems.map((pi) => ({
        ...pi,
        supplier_quotation_id: quoteHeader.id,
      }));
      await supabase.from('supplier_quotation_items').insert(itemsToInsert);
    }

    // Update RFQ status to RESPONDED or PARTIALLY_RESPONDED if linked
    if (rfq_id) {
      await supabase.from('rfqs').update({ status: 'RESPONDED' }).eq('id', rfq_id);
    }

    return res.status(201).json({
      success: true,
      message: 'Supplier quotation recorded.',
      data: quoteHeader,
    });
  } catch (err) {
    return handleError(res, err, 'Failed to create supplier quotation.');
  }
};

exports.getQuotationComparison = async (req, res) => {
  try {
    const { rfq_id } = req.query;
    if (!rfq_id) {
      return res.status(400).json({ success: false, error: { message: 'rfq_id is required.' } });
    }

    const { data: quotes, error } = await supabase
      .from('supplier_quotations')
      .select('*, supplier:supplier_id(*), items:supplier_quotation_items(*)')
      .eq('rfq_id', rfq_id);

    if (error) throw error;

    // Determine lowest price analytically
    let minPrice = Infinity;
    (quotes || []).forEach((q) => {
      if (q.total_amount < minPrice) minPrice = q.total_amount;
    });

    const formattedQuotes = (quotes || []).map((q) => ({
      ...q,
      isLowestPrice: q.total_amount === minPrice && minPrice !== Infinity,
    }));

    return res.status(200).json({
      success: true,
      data: formattedQuotes,
    });
  } catch (err) {
    return handleError(res, err, 'Failed to generate quotation comparison.');
  }
};

exports.selectSupplierForRFQ = async (req, res) => {
  try {
    const { quotation_id } = req.params;
    const { rfq_id, supplier_id, reason } = req.body;

    if (!reason) {
      return res.status(400).json({ success: false, error: { message: 'Reason for selection is required.' } });
    }

    // Record selection decision
    const { data: selectionData, error: selErr } = await supabase
      .from('supplier_selections')
      .insert({
        rfq_id: rfq_id || null,
        selected_quotation_id: quotation_id,
        selected_supplier_id: supplier_id,
        reason,
        selected_by: req.user?.id || null,
      })
      .select()
      .single();

    if (selErr) throw selErr;

    // Update Quotation status
    await supabase.from('supplier_quotations').update({ status: 'SELECTED' }).eq('id', quotation_id);
    if (rfq_id) {
      await supabase.from('rfqs').update({ status: 'AWARDED' }).eq('id', rfq_id);
    }

    return res.status(200).json({
      success: true,
      message: 'Supplier selected and award recorded.',
      data: selectionData,
    });
  } catch (err) {
    return handleError(res, err, 'Failed to select supplier.');
  }
};

// ==============================================================================
// 5. CONTROLLED PURCHASE ORDER AMENDMENTS
// ==============================================================================
exports.amendPurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params; // purchase_order_id
    const { field_name, old_value, new_value, reason } = req.body;

    if (!field_name || !reason) {
      return res.status(400).json({ success: false, error: { message: 'Field name and amendment reason are required.' } });
    }

    // Check PO exists
    const { data: po, error: poErr } = await supabase.from('purchase_orders').select('id, status').eq('id', id).single();
    if (poErr || !po) {
      return res.status(404).json({ success: false, error: { message: 'Purchase Order not found.' } });
    }

    const { data: amendData, error: amendErr } = await supabase
      .from('purchase_order_amendments')
      .insert({
        purchase_order_id: id,
        field_name,
        old_value: String(old_value || ''),
        new_value: String(new_value || ''),
        reason,
        changed_by: req.user?.id || null,
        approved_by: req.user?.id || null,
      })
      .select()
      .single();

    if (amendErr) throw amendErr;

    // Apply amendment to PO field dynamically
    const updateObj = { [field_name]: new_value, updated_at: new Date().toISOString() };
    await supabase.from('purchase_orders').update(updateObj).eq('id', id);

    return res.status(200).json({
      success: true,
      message: `Purchase Order amended for ${field_name}.`,
      data: amendData,
    });
  } catch (err) {
    return handleError(res, err, 'Failed to amend Purchase Order.');
  }
};

// ==============================================================================
// 6. SUPPLIER RETURNS & QUALITY RMA
// ==============================================================================
exports.createSupplierReturn = async (req, res) => {
  try {
    const { supplier_id, goods_receipt_id, purchase_order_id, reason, notes, items } = req.body;

    if (!supplier_id || !reason) {
      return res.status(400).json({ success: false, error: { message: 'Supplier and Reason are required.' } });
    }

    let totalAmount = 0;
    const processedItems = (items || []).map((i) => {
      const lineTotal = Number(i.quantity || 0) * Number(i.unit_price || 0);
      totalAmount += lineTotal;
      return {
        product_id: i.product_id || null,
        description: i.description || 'Returned Item',
        quantity: Number(i.quantity || 1),
        unit_price: Number(i.unit_price || 0),
        line_total: lineTotal,
        reason: i.reason || reason,
      };
    });

    const { data: returnHeader, error: retErr } = await supabase
      .from('supplier_returns')
      .insert({
        supplier_id,
        goods_receipt_id: goods_receipt_id || null,
        purchase_order_id: purchase_order_id || null,
        reason,
        status: 'REQUESTED',
        total_amount: totalAmount,
        notes,
        created_by: req.user?.id || null,
      })
      .select()
      .single();

    if (retErr) throw retErr;

    if (processedItems.length > 0) {
      const itemsToInsert = processedItems.map((pi) => ({
        ...pi,
        supplier_return_id: returnHeader.id,
      }));
      await supabase.from('supplier_return_items').insert(itemsToInsert);
    }

    return res.status(201).json({
      success: true,
      message: 'Supplier return request created.',
      data: returnHeader,
    });
  } catch (err) {
    return handleError(res, err, 'Failed to create supplier return.');
  }
};

exports.getSupplierReturns = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('supplier_returns')
      .select('*, supplier:supplier_id(company_name, supplier_code), items:supplier_return_items(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data: data || [],
    });
  } catch (err) {
    return handleError(res, err, 'Failed to load supplier returns.');
  }
};

exports.updateSupplierReturnStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { data, error } = await supabase
      .from('supplier_returns')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: `Supplier return status updated to ${status}.`,
      data,
    });
  } catch (err) {
    return handleError(res, err, 'Failed to update supplier return status.');
  }
};

// ==============================================================================
// 7. THREE-WAY MATCHING (PO + GRN + INVOICE)
// ==============================================================================
exports.performThreeWayMatch = async (req, res) => {
  try {
    const { invoiceId } = req.params;

    const { data: inv, error: invErr } = await supabase
      .from('purchase_invoices')
      .select('*, purchase_order:purchase_order_id(*), grn:grn_id(*), lines:purchase_invoice_lines(*)')
      .eq('id', invoiceId)
      .single();

    if (invErr || !inv) {
      return res.status(404).json({ success: false, error: { message: 'Purchase Invoice not found.' } });
    }

    let hasPriceVariance = false;
    let hasQtyVariance = false;

    // Verify PO total vs Invoice total
    if (inv.purchase_order) {
      const poTotal = Number(inv.purchase_order.total_amount || 0);
      const invTotal = Number(inv.total_amount || 0);
      if (Math.abs(poTotal - invTotal) > 0.01) {
        hasPriceVariance = true;
      }
    }

    // Verify GRN items vs Invoice lines
    (inv.lines || []).forEach((line) => {
      if (Number(line.ordered_quantity || 0) !== Number(line.quantity || 0)) {
        hasQtyVariance = true;
      }
      if (Number(line.po_unit_price || 0) !== Number(line.unit_price || 0)) {
        hasPriceVariance = true;
      }
    });

    let matchStatus = 'MATCHED';
    if (hasPriceVariance && hasQtyVariance) matchStatus = 'BOTH_VARIANCE';
    else if (hasPriceVariance) matchStatus = 'PRICE_VARIANCE';
    else if (hasQtyVariance) matchStatus = 'QUANTITY_VARIANCE';

    // Update Purchase Invoice match_status
    await supabase.from('purchase_invoices').update({ match_status: matchStatus }).eq('id', invoiceId);

    return res.status(200).json({
      success: true,
      data: {
        invoiceId,
        matchStatus,
        hasPriceVariance,
        hasQtyVariance,
        poReference: inv.purchase_order?.po_number || 'N/A',
        grnReference: inv.grn?.grn_number || 'N/A',
      },
    });
  } catch (err) {
    return handleError(res, err, 'Failed to perform three-way match.');
  }
};

// ==============================================================================
// 8. PROCUREMENT ANALYTICS & REPORTS
// ==============================================================================
exports.getProcurementReports = async (req, res) => {
  try {
    const [suppliersRes, posRes, grnsRes, returnsRes, invoicesRes] = await Promise.all([
      supabase.from('suppliers').select('*'),
      supabase.from('purchase_orders').select('*, supplier:supplier_id(company_name)'),
      supabase.from('goods_receipts').select('*, supplier:supplier_id(company_name), purchase_order:purchase_order_id(po_number)'),
      supabase.from('supplier_returns').select('*, supplier:supplier_id(company_name)'),
      supabase.from('purchase_invoices').select('*, supplier:supplier_id(company_name)'),
    ]);

    const suppliers = suppliersRes.data || [];
    const pos = posRes.data || [];
    const grns = grnsRes.data || [];
    const returns = returnsRes.data || [];
    const invoices = invoicesRes.data || [];

    // Calculate Supplier Performance metrics
    const supplierPerformance = suppliers.map((s) => {
      const suppPOs = pos.filter((p) => p.supplier_id === s.id);
      const totalPOs = suppPOs.length;
      const totalValue = suppPOs.reduce((acc, curr) => acc + Number(curr.total_amount || 0), 0);
      const suppReturns = returns.filter((r) => r.supplier_id === s.id).length;

      return {
        id: s.id,
        supplier_code: s.supplier_code,
        name: s.company_name,
        totalOrders: totalPOs,
        totalValue: totalValue,
        onTimeDeliveryPct: s.delivery_score || 100.0,
        qualityAcceptancePct: s.quality_score || 100.0,
        returnsCount: suppReturns,
        rating: s.rating ? s.rating.toFixed(1) : 'N/A',
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        totalPOsCount: pos.length,
        totalGRNsCount: grns.length,
        totalReturnsCount: returns.length,
        supplierPerformance,
        recentPOs: pos.slice(0, 10),
        recentGRNs: grns.slice(0, 10),
        recentReturns: returns.slice(0, 10),
        recentInvoices: invoices.slice(0, 10),
      },
    });
  } catch (err) {
    return handleError(res, err, 'Failed to generate procurement reports.');
  }
};
