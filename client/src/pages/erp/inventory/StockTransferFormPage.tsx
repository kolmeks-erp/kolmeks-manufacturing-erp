import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftRight,
  ArrowLeft,
  Building2,
  AlertTriangle,
  Info,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import { ERP_BASE_PATH } from '../../../constants/navigation';
import { inventoryService } from '../../../services/inventory.service';
import { warehouseService } from '../../../services/warehouse.service';
import { apiClient } from '../../../services/api';
import { Warehouse, StorageLocation } from '../../../types/inventory';

export const StockTransferFormPage: React.FC = () => {
  const navigate = useNavigate();

  // Master Data State
  const [products, setProducts] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [sourceLocations, setSourceLocations] = useState<StorageLocation[]>([]);
  const [destLocations, setDestLocations] = useState<StorageLocation[]>([]);

  // Form State
  const [productId, setProductId] = useState<string>('');
  const [sourceWarehouseId, setSourceWarehouseId] = useState<string>('');
  const [sourceLocationId, setSourceLocationId] = useState<string>('');
  const [destWarehouseId, setDestWarehouseId] = useState<string>('');
  const [destLocationId, setDestLocationId] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [reason, setReason] = useState<string>('Warehouse Transfer');
  const [notes, setNotes] = useState<string>('');

  // Source stock check state
  const [sourceOnHand, setSourceOnHand] = useState<number | null>(null);
  const [checkingSource, setCheckingSource] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  useEffect(() => {
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

  // When source warehouse changes, load its locations
  useEffect(() => {
    if (sourceWarehouseId) {
      warehouseService.getWarehouseLocations(sourceWarehouseId).then((res) => {
        if (res.success) setSourceLocations(res.data);
      });
    } else {
      setSourceLocations([]);
      setSourceLocationId('');
    }
  }, [sourceWarehouseId]);

  // When destination warehouse changes, load its locations
  useEffect(() => {
    if (destWarehouseId) {
      warehouseService.getWarehouseLocations(destWarehouseId).then((res) => {
        if (res.success) setDestLocations(res.data);
      });
    } else {
      setDestLocations([]);
      setDestLocationId('');
    }
  }, [destWarehouseId]);

  // Check source location available stock
  useEffect(() => {
    if (productId && sourceWarehouseId) {
      setCheckingSource(true);
      inventoryService
        .getInventory({
          product_id: productId,
          warehouse_id: sourceWarehouseId,
          location_id: sourceLocationId || undefined,
          limit: 1,
        })
        .then((res) => {
          if (res.success && res.data.length > 0) {
            const found = res.data.find(
              (item: any) =>
                item.product_id === productId &&
                item.warehouse_id === sourceWarehouseId &&
                (sourceLocationId ? item.location_id === sourceLocationId : !item.location_id)
            );
            setSourceOnHand(found ? found.on_hand_quantity : 0);
          } else {
            setSourceOnHand(0);
          }
        })
        .catch(() => setSourceOnHand(0))
        .finally(() => setCheckingSource(false));
    } else {
      setSourceOnHand(null);
    }
  }, [productId, sourceWarehouseId, sourceLocationId]);

  const selectedProduct = products.find((p) => p.id === productId);
  const sourceWh = warehouses.find((w) => w.id === sourceWarehouseId);
  const destWh = warehouses.find((w) => w.id === destWarehouseId);
  const qtyNum = parseFloat(quantity) || 0;

  const handleValidateAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!productId || !sourceWarehouseId || !destWarehouseId || !quantity) {
      setErrorMsg('Please select Product, Source Warehouse, Destination Warehouse, and Quantity.');
      return;
    }

    if (
      sourceWarehouseId === destWarehouseId &&
      (sourceLocationId || '') === (destLocationId || '')
    ) {
      setErrorMsg('Source and Destination locations must be different.');
      return;
    }

    if (isNaN(qtyNum) || qtyNum <= 0) {
      setErrorMsg('Transfer quantity must be a positive number greater than 0.');
      return;
    }

    if (sourceOnHand !== null && sourceOnHand < qtyNum) {
      setErrorMsg(
        `Insufficient stock at source! Available on-hand quantity is ${sourceOnHand}, but attempted transfer is ${qtyNum}.`
      );
      return;
    }

    setShowConfirmModal(true);
  };

  const confirmTransfer = async () => {
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await inventoryService.createStockTransfer({
        product_id: productId,
        source_warehouse_id: sourceWarehouseId,
        source_location_id: sourceLocationId || undefined,
        destination_warehouse_id: destWarehouseId,
        destination_location_id: destLocationId || undefined,
        quantity: qtyNum,
        reason,
        notes,
      });

      if (res.success) {
        setShowConfirmModal(false);
        navigate(`${ERP_BASE_PATH}/inventory/${productId}`);
      } else {
        setErrorMsg(res.message || 'Failed to complete stock transfer.');
      }
    } catch (err: any) {
      console.error('Error completing stock transfer:', err);
      setErrorMsg(err.response?.data?.message || 'Server error creating stock transfer.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-800 w-full max-w-5xl mx-auto">
      {/* Top Breadcrumb */}
      <button
        onClick={() => navigate(`${ERP_BASE_PATH}/inventory`)}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Inventory Balances</span>
      </button>

      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 text-cyan-700 font-bold text-xs tracking-wider uppercase mb-1">
          <ArrowLeftRight className="w-4 h-4" />
          <span>Inter-Warehouse & Location Transfer</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Record Stock Transfer</h1>
        <p className="text-sm text-slate-500 mt-1">
          Relocate stock between manufacturing depots or bin storage locations with atomic movement logging.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleValidateAndSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xs">
        {/* Product Picker */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Select Product to Transfer *
          </label>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-cyan-500"
          >
            <option value="">Choose product...</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                [{p.product_code}] {p.name} ({p.unit || 'pcs'})
              </option>
            ))}
          </select>
        </div>

        {/* Source vs Destination Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-200">
          {/* Source Location Box */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-xs uppercase tracking-wider">
              <Building2 className="w-4 h-4" />
              <span>1. SOURCE LOCATION (TRANSFER OUT)</span>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">Source Warehouse *</label>
              <select
                value={sourceWarehouseId}
                onChange={(e) => setSourceWarehouseId(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-rose-500"
              >
                <option value="">Select Source Warehouse</option>
                {warehouses.map((wh) => (
                  <option key={wh.id} value={wh.id}>
                    {wh.code} — {wh.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">Source Storage Rack (Optional)</label>
              <select
                value={sourceLocationId}
                onChange={(e) => setSourceLocationId(e.target.value)}
                disabled={!sourceWarehouseId || sourceLocations.length === 0}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 disabled:opacity-50 focus:outline-none focus:border-rose-500"
              >
                <option value="">Default Warehouse Storage</option>
                {sourceLocations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.location_code} — {loc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Source Stock Indicator */}
            {productId && sourceWarehouseId && (
              <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Available at Source:</span>
                {checkingSource ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-600" />
                ) : (
                  <span className="font-bold text-slate-900 text-sm">
                    {sourceOnHand !== null ? sourceOnHand : 0} {selectedProduct?.unit || 'pcs'}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Destination Location Box */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider">
              <Building2 className="w-4 h-4" />
              <span>2. DESTINATION LOCATION (TRANSFER IN)</span>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">Destination Warehouse *</label>
              <select
                value={destWarehouseId}
                onChange={(e) => setDestWarehouseId(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
              >
                <option value="">Select Destination Warehouse</option>
                {warehouses.map((wh) => (
                  <option key={wh.id} value={wh.id}>
                    {wh.code} — {wh.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">Destination Storage Rack (Optional)</label>
              <select
                value={destLocationId}
                onChange={(e) => setDestLocationId(e.target.value)}
                disabled={!destWarehouseId || destLocations.length === 0}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 disabled:opacity-50 focus:outline-none focus:border-emerald-500"
              >
                <option value="">Default Warehouse Storage</option>
                {destLocations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.location_code} — {loc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Transfer Quantity & Reason */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Transfer Quantity *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="e.g. 50.00"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500 font-mono font-bold"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Reason / Transfer Purpose
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-cyan-500"
            >
              <option value="Warehouse Transfer">Warehouse Transfer</option>
              <option value="Production Staging">Production Staging</option>
              <option value="Logistics Relocation">Logistics Relocation</option>
              <option value="Quality Inspection Transfer">Quality Inspection Transfer</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Transfer Notes
          </label>
          <textarea
            rows={2}
            placeholder="Inter-facility dispatch notes, driver reference, or rack reallocation detail..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => navigate(`${ERP_BASE_PATH}/inventory`)}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-semibold transition shadow-xs"
          >
            Review & Transfer Stock
          </button>
        </div>
      </form>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ArrowLeftRight className="w-5 h-5 text-cyan-600" />
              <span>Confirm Stock Transfer</span>
            </h3>

            <div className="space-y-3 text-xs text-slate-700 bg-slate-50 p-4 rounded-xl font-mono">
              <div>
                <span className="text-slate-500">Product:</span> {selectedProduct?.name}
              </div>
              <div>
                <span className="text-slate-500">Quantity:</span>{' '}
                <span className="text-cyan-700 font-bold">
                  {qtyNum} {selectedProduct?.unit || 'pcs'}
                </span>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-slate-200 text-xs">
                <span className="text-rose-700 font-bold">{sourceWh?.code}</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
                <span className="text-emerald-700 font-bold">{destWh?.code}</span>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              Executing this transfer will instantly deduct quantity from the source depot and add it to the destination depot, creating paired TRANSFER_OUT and TRANSFER_IN ledger entries.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                disabled={submitting}
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                disabled={submitting}
                onClick={confirmTransfer}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition"
              >
                {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                <span>Execute Transfer</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
