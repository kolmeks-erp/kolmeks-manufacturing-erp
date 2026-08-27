import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  PackageCheck,
  ArrowLeft,
  Save,
  AlertCircle,
  Building2,
  Calendar,
  FileText,
  Warehouse,
  CheckCircle2,
  RefreshCw,
  Info,
} from 'lucide-react';
import { GrnService } from '../../../services/grn.service';
import { EligiblePO, GRNFormPayload, GoodsReceipt } from '../../../types/grn';
import { ERP_BASE_PATH } from '../../../constants/navigation';

interface LineItemRow {
  purchase_order_item_id: string;
  product_id?: string | null;
  description: string;
  ordered_quantity: number;
  previously_received_quantity: number;
  remaining_quantity: number;
  received_quantity: number;
  rejected_quantity: number;
  accepted_quantity: number;
  unit: string;
  rejection_reason: string;
  notes: string;
}

export const GoodsReceiptFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const preselectedPoId = searchParams.get('po_id');

  const isEdit = Boolean(id);

  // Form states
  const [eligiblePOs, setEligiblePOs] = useState<EligiblePO[]>([]);
  const [selectedPO, setSelectedPO] = useState<EligiblePO | null>(null);
  const [purchaseOrderId, setPurchaseOrderId] = useState<string>('');
  const [receiptDate, setReceiptDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [deliveryReference, setDeliveryReference] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [items, setItems] = useState<LineItemRow[]>([]);

  // Async & UX states
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [overReceivingError, setOverReceivingError] = useState<string | null>(null);
  const [existingGRN, setExistingGRN] = useState<GoodsReceipt | null>(null);

  // Load eligible POs or existing GRN data
  useEffect(() => {
    const initializeForm = async () => {
      try {
        setLoading(true);
        setError(null);

        const pos = await GrnService.getEligiblePurchaseOrders();
        setEligiblePOs(pos || []);

        if (isEdit && id) {
          const grnData = await GrnService.getGoodsReceiptById(id);
          setExistingGRN(grnData);
          setPurchaseOrderId(grnData.purchase_order_id);
          setReceiptDate(grnData.receipt_date || new Date().toISOString().split('T')[0]);
          setDeliveryReference(grnData.delivery_reference || '');
          setNotes(grnData.notes || '');

          // Map items for edit
          const mappedItems: LineItemRow[] = (grnData.items || []).map((it) => {
            const ord = Number(it.ordered_quantity || 0);
            const prev = Number(it.previously_received_quantity || 0);
            const rec = Number(it.received_quantity || 0);
            const rej = Number(it.rejected_quantity || 0);
            const acc = Number(it.accepted_quantity || 0);
            const rem = Math.max(0, Number((ord - prev).toFixed(2)));

            return {
              purchase_order_item_id: it.purchase_order_item_id,
              product_id: it.product_id,
              description: it.description,
              ordered_quantity: ord,
              previously_received_quantity: prev,
              remaining_quantity: rem,
              received_quantity: rec,
              rejected_quantity: rej,
              accepted_quantity: acc,
              unit: it.unit || 'pcs',
              rejection_reason: it.rejection_reason || '',
              notes: it.notes || '',
            };
          });
          setItems(mappedItems);
        } else if (preselectedPoId) {
          const matchedPO = (pos || []).find((p) => p.id === preselectedPoId);
          if (matchedPO) {
            handleSelectPO(matchedPO);
          }
        } else if (pos && pos.length > 0) {
          handleSelectPO(pos[0]);
        }
      } catch (err: any) {
        console.error('Error initializing GRN form:', err);
        setError(err.message || 'Failed to initialize Goods Receipt form data.');
      } finally {
        setLoading(false);
      }
    };

    initializeForm();
  }, [id, isEdit, preselectedPoId]);

  const handleSelectPO = (po: EligiblePO) => {
    setSelectedPO(po);
    setPurchaseOrderId(po.id);

    const initialRows: LineItemRow[] = (po.items || []).map((item) => {
      const ord = item.ordered_quantity;
      const prev = item.previously_received_quantity;
      const rem = item.remaining_quantity;
      const defaultRec = rem; // Default to full remaining quantity
      const defaultRej = 0;
      const defaultAcc = defaultRec - defaultRej;

      return {
        purchase_order_item_id: item.id,
        product_id: item.product_id,
        description: item.description,
        ordered_quantity: ord,
        previously_received_quantity: prev,
        remaining_quantity: rem,
        received_quantity: defaultRec,
        rejected_quantity: defaultRej,
        accepted_quantity: defaultAcc,
        unit: item.unit || 'pcs',
        rejection_reason: '',
        notes: '',
      };
    });

    setItems(initialRows);
    validateItemQuantities(initialRows);
  };

  const handlePOChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const poId = e.target.value;
    const po = eligiblePOs.find((p) => p.id === poId);
    if (po) {
      handleSelectPO(po);
    }
  };

  const updateItemRow = (index: number, field: keyof LineItemRow, value: any) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: value };

    if (field === 'received_quantity' || field === 'rejected_quantity') {
      const rec = Math.max(0, Number(item.received_quantity) || 0);
      const rej = Math.max(0, Number(item.rejected_quantity) || 0);

      // Clamp rejected to received
      const clampedRej = Math.min(rec, rej);
      const acc = Math.max(0, Number((rec - clampedRej).toFixed(2)));

      item.received_quantity = rec;
      item.rejected_quantity = clampedRej;
      item.accepted_quantity = acc;
    }

    updated[index] = item;
    setItems(updated);
    validateItemQuantities(updated);
  };

  const validateItemQuantities = (currentItems: LineItemRow[]) => {
    let overError: string | null = null;

    for (const item of currentItems) {
      if (item.received_quantity > item.remaining_quantity) {
        overError = `Received quantity cannot exceed remaining quantity for line item: "${item.description}". (Max remaining: ${item.remaining_quantity} ${item.unit})`;
        break;
      }
      if (item.rejected_quantity > 0 && !item.rejection_reason.trim()) {
        overError = `A rejection reason is required for line item: "${item.description}".`;
        break;
      }
    }

    setOverReceivingError(overError);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!purchaseOrderId) {
      setError('Please select a valid Purchase Order.');
      return;
    }

    if (items.length === 0) {
      setError('At least one item line is required to log a Goods Receipt.');
      return;
    }

    if (overReceivingError) {
      setError(overReceivingError);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const payload: GRNFormPayload = {
        purchase_order_id: purchaseOrderId,
        receipt_date: receiptDate,
        delivery_reference: deliveryReference,
        notes,
        items: items.map((it) => ({
          purchase_order_item_id: it.purchase_order_item_id,
          received_quantity: it.received_quantity,
          rejected_quantity: it.rejected_quantity,
          rejection_reason: it.rejected_quantity > 0 ? it.rejection_reason : undefined,
          notes: it.notes,
        })),
      };

      if (isEdit && id) {
        await GrnService.updateGoodsReceipt(id, payload);
        navigate(`${ERP_BASE_PATH}/goods-receipts/${id}`);
      } else {
        const res = await GrnService.createGoodsReceipt(payload);
        navigate(`${ERP_BASE_PATH}/goods-receipts/${res.data.id}`);
      }
    } catch (err: any) {
      console.error('Error submitting GRN form:', err);
      setError(err.response?.data?.message || err.message || 'Failed to save Goods Receipt.');
    } finally {
      setSubmitting(false);
    }
  };

  const totalOrdered = items.reduce((acc, i) => acc + i.ordered_quantity, 0);
  const totalPrevReceived = items.reduce((acc, i) => acc + i.previously_received_quantity, 0);
  const totalCurrentReceived = items.reduce((acc, i) => acc + i.received_quantity, 0);
  const totalRejected = items.reduce((acc, i) => acc + i.rejected_quantity, 0);
  const totalAccepted = items.reduce((acc, i) => acc + i.accepted_quantity, 0);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-slate-900" />
        <p className="text-sm font-semibold">Loading Goods Receipt Form...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* TOP ACTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(`${ERP_BASE_PATH}/goods-receipts`)}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="p-2.5 bg-slate-900 text-white rounded-xl">
            <PackageCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {isEdit ? `Edit Goods Receipt (${existingGRN?.grn_number})` : 'Create Goods Receipt Note (GRN)'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Record physical incoming material delivery against an approved Purchase Order.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(`${ERP_BASE_PATH}/goods-receipts`)}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || Boolean(overReceivingError)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <Save className="w-4 h-4 text-emerald-400" />
            {submitting ? 'Saving...' : isEdit ? 'Update GRN' : 'Save & Review GRN'}
          </button>
        </div>
      </div>

      {/* ERROR ALERT */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <p className="font-semibold">{error}</p>
        </div>
      )}

      {/* OVER RECEIVING WARNING ALERT */}
      {overReceivingError && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-amber-600" />
          <p className="font-bold">{overReceivingError}</p>
        </div>
      )}

      {/* HEADER FORM SECTION */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <FileText className="w-4 h-4 text-emerald-600" />
          Receipt Metadata & Commercial References
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* PURCHASE ORDER SELECTOR */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Purchase Order <span className="text-rose-500">*</span>
            </label>
            {isEdit ? (
              <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800">
                {existingGRN?.purchase_order?.po_number || purchaseOrderId}
              </div>
            ) : (
              <select
                value={purchaseOrderId}
                onChange={handlePOChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
              >
                {eligiblePOs.length === 0 ? (
                  <option value="">No eligible POs available for receiving</option>
                ) : (
                  eligiblePOs.map((po) => (
                    <option key={po.id} value={po.id}>
                      {po.po_number} — {po.supplier?.name || 'Vendor'} ({po.currency} {po.total})
                    </option>
                  ))
                )}
              </select>
            )}
          </div>

          {/* RECEIPT DATE */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Physical Receipt Date <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={receiptDate}
                onChange={(e) => setReceiptDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
              />
            </div>
          </div>

          {/* DELIVERY REFERENCE / CHALLAN # */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Delivery Challan / Invoice Ref
            </label>
            <input
              type="text"
              placeholder="e.g. INV-2026-8891 or DC-4590"
              value={deliveryReference}
              onChange={(e) => setDeliveryReference(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
            />
          </div>
        </div>

        {/* DERIVED SUPPLIER CARD */}
        {(selectedPO?.supplier || existingGRN?.supplier) && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-700">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">
                  {selectedPO?.supplier?.name || existingGRN?.supplier?.name}
                </div>
                <div className="text-slate-500 font-mono text-[11px]">
                  Code: {selectedPO?.supplier?.supplier_code || existingGRN?.supplier?.supplier_code}
                </div>
              </div>
            </div>

            <div className="text-slate-600 space-y-0.5 sm:text-right">
              <div>Email: {selectedPO?.supplier?.email || existingGRN?.supplier?.email || 'N/A'}</div>
              <div>Phone: {selectedPO?.supplier?.phone || existingGRN?.supplier?.phone || 'N/A'}</div>
            </div>
          </div>
        )}
      </div>

      {/* ITEM RECEIVING TABLE BUILDER */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <PackageCheck className="w-4 h-4 text-emerald-600" />
            Line Items Receiving & Inspection Breakdown
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            {items.length} line {items.length === 1 ? 'item' : 'items'} to receive
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-3">Item Description</th>
                <th className="py-3 px-3 text-center">Ordered</th>
                <th className="py-3 px-3 text-center">Prev Rec</th>
                <th className="py-3 px-3 text-center">Remaining</th>
                <th className="py-3 px-3 text-center w-28">Curr Rec</th>
                <th className="py-3 px-3 text-center w-28">Rejected</th>
                <th className="py-3 px-3 text-center">Accepted</th>
                <th className="py-3 px-3">Rejection Reason</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 text-xs text-slate-700">
              {items.map((row, idx) => {
                const isOver = row.received_quantity > row.remaining_quantity;

                return (
                  <tr key={idx} className={isOver ? 'bg-rose-50/50' : 'hover:bg-slate-50/60'}>
                    {/* DESCRIPTION */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{row.description}</div>
                      <div className="text-[10px] text-slate-400">Unit: {row.unit}</div>
                    </td>

                    {/* ORDERED */}
                    <td className="py-3 px-3 text-center font-semibold text-slate-700">
                      {row.ordered_quantity}
                    </td>

                    {/* PREVIOUSLY RECEIVED */}
                    <td className="py-3 px-3 text-center font-medium text-slate-500">
                      {row.previously_received_quantity}
                    </td>

                    {/* REMAINING */}
                    <td className="py-3 px-3 text-center font-bold text-blue-700">
                      {row.remaining_quantity}
                    </td>

                    {/* CURRENT RECEIVED INPUT */}
                    <td className="py-3 px-3 text-center">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={row.received_quantity}
                        onChange={(e) => updateItemRow(idx, 'received_quantity', e.target.value)}
                        className={`w-full px-2 py-1.5 text-center font-bold border rounded-lg focus:ring-2 focus:outline-hidden text-xs ${
                          isOver
                            ? 'bg-rose-100 border-rose-400 text-rose-800 focus:ring-rose-500'
                            : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-slate-900'
                        }`}
                      />
                    </td>

                    {/* REJECTED INPUT */}
                    <td className="py-3 px-3 text-center">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={row.rejected_quantity}
                        onChange={(e) => updateItemRow(idx, 'rejected_quantity', e.target.value)}
                        className="w-full px-2 py-1.5 text-center font-bold bg-rose-50/60 border border-rose-200 text-rose-700 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-hidden text-xs"
                      />
                    </td>

                    {/* ACCEPTED (AUTO-CALCULATED) */}
                    <td className="py-3 px-3 text-center font-extrabold text-emerald-700">
                      <span className="inline-block px-2 py-1 bg-emerald-50 border border-emerald-200 rounded-lg">
                        {row.accepted_quantity}
                      </span>
                    </td>

                    {/* REJECTION REASON */}
                    <td className="py-3 px-3">
                      <input
                        type="text"
                        placeholder={row.rejected_quantity > 0 ? 'Reason required...' : 'Optional notes'}
                        value={row.rejection_reason}
                        onChange={(e) => updateItemRow(idx, 'rejection_reason', e.target.value)}
                        className={`w-full px-3 py-1.5 border rounded-lg text-xs focus:ring-2 focus:outline-hidden ${
                          row.rejected_quantity > 0 && !row.rejection_reason.trim()
                            ? 'bg-rose-50 border-rose-300 placeholder-rose-400 text-rose-900 focus:ring-rose-500'
                            : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-slate-900'
                        }`}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* TOTALS SUMMARY BAR */}
        <div className="p-4 bg-slate-900 text-white rounded-xl flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold text-slate-300">Receiving Summary Totals:</span>
          </div>

          <div className="flex items-center gap-6 font-mono">
            <div>
              <span className="text-slate-400">Total Ordered:</span>{' '}
              <span className="font-bold">{totalOrdered}</span>
            </div>
            <div>
              <span className="text-slate-400">Prev Rec:</span>{' '}
              <span className="font-bold">{totalPrevReceived}</span>
            </div>
            <div>
              <span className="text-slate-400">Curr Rec:</span>{' '}
              <span className="font-bold text-blue-400">{totalCurrentReceived}</span>
            </div>
            <div>
              <span className="text-slate-400">Rejected:</span>{' '}
              <span className="font-bold text-rose-400">{totalRejected}</span>
            </div>
            <div>
              <span className="text-slate-400">Accepted:</span>{' '}
              <span className="font-bold text-emerald-400">{totalAccepted}</span>
            </div>
          </div>
        </div>

        {/* NOTES SECTION */}
        <div className="pt-2">
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Receiving Notes & Quality Remarks
          </label>
          <textarea
            rows={3}
            placeholder="Add any additional remarks regarding packaging, inspection findings, carrier details..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
          />
        </div>
      </div>
    </form>
  );
};
