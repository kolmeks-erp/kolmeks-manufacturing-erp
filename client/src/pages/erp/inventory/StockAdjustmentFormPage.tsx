import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  SlidersHorizontal,
  ArrowLeft,
  Boxes,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Info,
  RefreshCw,
} from 'lucide-react';
import { ERP_BASE_PATH } from '../../../constants/navigation';
import { inventoryService } from '../../../services/inventory.service';
import { warehouseService } from '../../../services/warehouse.service';
import { apiClient } from '../../../services/api';
import { Warehouse, StorageLocation } from '../../../types/inventory';

export const StockAdjustmentFormPage: React.FC = () => {
  const navigate = useNavigate();

  // Master Data State
  const [products, setProducts] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [locations, setLocations] = useState<StorageLocation[]>([]);

  // Form State
  const [productId, setProductId] = useState<string>('');
  const [warehouseId, setWarehouseId] = useState<string>('');
  const [locationId, setLocationId] = useState<string>('');
  const [adjustmentType, setAdjustmentType] = useState<'ADJUSTMENT_IN' | 'ADJUSTMENT_OUT'>('ADJUSTMENT_IN');
  const [quantity, setQuantity] = useState<string>('');
  const [reason, setReason] = useState<string>('Counting Difference');
  const [notes, setNotes] = useState<string>('');

  // Balance Check & Submitting State
  const [currentOnHand, setCurrentOnHand] = useState<number | null>(null);
  const [checkingBalance, setCheckingBalance] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  useEffect(() => {
    // Load active products & warehouses
    const loadMasters = async () => {
      try {
        const [prodRes, whRes] = await Promise.all([
          apiClient.get('/products'),
          warehouseService.getWarehouses({ status: 'active' }),
        ]);
        if (prodRes.data?.data) setProducts(prodRes.data.data);
        if (whRes.success) setWarehouses(whRes.data);
      } catch (err) {
        console.error('Error loading master data:', err);
      }
    };
    loadMasters();
  }, []);

  // When warehouse changes, fetch its storage locations
  useEffect(() => {
    if (warehouseId) {
      warehouseService.getWarehouseLocations(warehouseId).then((res) => {
        if (res.success) setLocations(res.data);
      });
    } else {
      setLocations([]);
      setLocationId('');
    }
  }, [warehouseId]);

  // Check current stock balance when product, warehouse, or location changes
  useEffect(() => {
    if (productId && warehouseId) {
      setCheckingBalance(true);
      inventoryService
        .getInventory({
          product_id: productId,
          warehouse_id: warehouseId,
          location_id: locationId || undefined,
          limit: 1,
        })
        .then((res) => {
          if (res.success && res.data.length > 0) {
            const found = res.data.find(
              (item) =>
                item.product_id === productId &&
                item.warehouse_id === warehouseId &&
                (locationId ? item.location_id === locationId : !item.location_id)
            );
            setCurrentOnHand(found ? found.on_hand_quantity : 0);
          } else {
            setCurrentOnHand(0);
          }
        })
        .catch(() => setCurrentOnHand(0))
        .finally(() => setCheckingBalance(false));
    } else {
      setCurrentOnHand(null);
    }
  }, [productId, warehouseId, locationId]);

  const selectedProduct = products.find((p) => p.id === productId);
  const qtyNum = parseFloat(quantity) || 0;
  const computedNewOnHand =
    currentOnHand !== null
      ? adjustmentType === 'ADJUSTMENT_IN'
        ? currentOnHand + qtyNum
        : currentOnHand - qtyNum
      : 0;

  const handleValidateAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!productId || !warehouseId || !quantity || !reason) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    if (isNaN(qtyNum) || qtyNum <= 0) {
      setErrorMsg('Adjustment quantity must be a positive number greater than 0.');
      return;
    }

    if (adjustmentType === 'ADJUSTMENT_OUT' && currentOnHand !== null && currentOnHand < qtyNum) {
      setErrorMsg(
        `Insufficient stock! Attempted adjustment out (${qtyNum}) exceeds available on-hand quantity (${currentOnHand}).`
      );
      return;
    }

    setShowConfirmModal(true);
  };

  const confirmAdjustment = async () => {
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await inventoryService.createStockAdjustment({
        product_id: productId,
        warehouse_id: warehouseId,
        location_id: locationId || undefined,
        adjustment_type: adjustmentType,
        quantity: qtyNum,
        reason,
        notes,
      });

      if (res.success) {
        setShowConfirmModal(false);
        navigate(`${ERP_BASE_PATH}/inventory/${productId}`);
      } else {
        setErrorMsg(res.message || 'Failed to submit stock adjustment.');
      }
    } catch (err: any) {
      console.error('Error creating stock adjustment:', err);
      setErrorMsg(err.response?.data?.message || 'Server error creating stock adjustment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 text-slate-100">
      {/* Top Breadcrumb Header */}
      <button
        onClick={() => navigate(`${ERP_BASE_PATH}/inventory`)}
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Inventory Balances</span>
      </button>

      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase mb-1">
          <SlidersHorizontal className="w-4 h-4" />
          <span>Controlled Stock Adjustment</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Record Stock Adjustment</h1>
        <p className="text-sm text-slate-400 mt-1">
          Log authorized manual stock count corrections, opening balances, or damaged material write-offs.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-950/80 border border-rose-800 rounded-xl text-rose-300 text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleValidateAndSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
        {/* Adjustment Direction Toggle */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Adjustment Direction *
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setAdjustmentType('ADJUSTMENT_IN')}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-sm font-semibold transition ${
                adjustmentType === 'ADJUSTMENT_IN'
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-950/50'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-850'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>ADJUSTMENT IN (+ Stock Increase)</span>
            </button>

            <button
              type="button"
              onClick={() => setAdjustmentType('ADJUSTMENT_OUT')}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-sm font-semibold transition ${
                adjustmentType === 'ADJUSTMENT_OUT'
                  ? 'bg-rose-950/80 border-rose-500 text-rose-300 shadow-lg shadow-rose-950/50'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-850'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>ADJUSTMENT OUT (- Stock Decrease)</span>
            </button>
          </div>
        </div>

        {/* Product Picker */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Select Product *
          </label>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="">Choose a product from catalog...</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                [{p.product_code}] {p.name} ({p.unit || 'pcs'})
              </option>
            ))}
          </select>
        </div>

        {/* Warehouse & Storage Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Warehouse Facility *
            </label>
            <select
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">Choose warehouse...</option>
              {warehouses.map((wh) => (
                <option key={wh.id} value={wh.id}>
                  {wh.code} — {wh.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Storage Location / Rack Bin (Optional)
            </label>
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              disabled={!warehouseId || locations.length === 0}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 disabled:opacity-50 focus:outline-none focus:border-indigo-500"
            >
              <option value="">Default Warehouse Storage</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.location_code} — {loc.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Current Stock Balance Live Card */}
        {productId && warehouseId && (
          <div className="bg-slate-950 border border-indigo-900/50 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5 text-indigo-400 shrink-0" />
              <div>
                <span className="text-xs text-slate-400 block font-semibold uppercase tracking-wider">
                  Current Stock On-Hand
                </span>
                <span className="text-sm font-medium text-slate-300">
                  {selectedProduct?.name} @ Selected Warehouse
                </span>
              </div>
            </div>

            <div className="text-right">
              {checkingBalance ? (
                <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
              ) : (
                <>
                  <div className="text-xl font-extrabold text-white">
                    {currentOnHand !== null ? currentOnHand : 0} {selectedProduct?.unit || 'pcs'}
                  </div>
                  <div className="text-xs text-indigo-300 font-mono">
                    New Computed Balance:{' '}
                    <span
                      className={`font-bold ${
                        computedNewOnHand < 0 ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {computedNewOnHand} {selectedProduct?.unit || 'pcs'}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Quantity & Reason */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Adjustment Quantity *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="e.g. 10.00"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono font-bold"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Reason Code *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="Opening Balance">Opening Balance</option>
              <option value="Counting Difference">Counting Difference</option>
              <option value="Damage">Damage / Scrap</option>
              <option value="Loss">Loss / Theft</option>
              <option value="Correction">Data Correction</option>
              <option value="Found Stock">Found Stock</option>
              <option value="Other">Other (Specify in Notes)</option>
            </select>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Notes / Audit Explanation
          </label>
          <textarea
            rows={3}
            placeholder="Provide detail regarding physical count audit, ticket number, or damage details..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={() => navigate(`${ERP_BASE_PATH}/inventory`)}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-semibold transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition shadow-lg shadow-indigo-600/20"
          >
            Review & Record Adjustment
          </button>
        </div>
      </form>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-indigo-400" />
              <span>Confirm Stock Adjustment</span>
            </h3>

            <div className="space-y-2 text-sm text-slate-300 bg-slate-950 p-4 rounded-lg font-mono">
              <div>
                <span className="text-slate-500">Direction:</span>{' '}
                <span className={adjustmentType === 'ADJUSTMENT_IN' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {adjustmentType}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Product:</span> {selectedProduct?.name}
              </div>
              <div>
                <span className="text-slate-500">Quantity:</span> {qtyNum} {selectedProduct?.unit || 'pcs'}
              </div>
              <div>
                <span className="text-slate-500">Previous On-Hand:</span> {currentOnHand || 0}
              </div>
              <div>
                <span className="text-slate-500">New On-Hand:</span>{' '}
                <span className="text-indigo-300 font-bold">{computedNewOnHand}</span>
              </div>
              <div>
                <span className="text-slate-500">Reason:</span> {reason}
              </div>
            </div>

            <p className="text-xs text-slate-400">
              This action will update the inventory balance and append an immutable transaction log to the system ledger.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                disabled={submitting}
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-semibold transition"
              >
                Cancel
              </button>
              <button
                disabled={submitting}
                onClick={confirmAdjustment}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition"
              >
                {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                <span>Confirm & Commit</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
