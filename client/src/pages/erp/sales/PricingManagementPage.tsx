import React, { useEffect, useState } from 'react';
import {
  DollarSign,
  Plus,
  CheckCircle,
  Tag,
  X,
  Layers,
} from 'lucide-react';
import { salesService } from '../../../services/sales.service';
import { PricingRule } from '../../../types/sales';
import api from '../../../services/api';

export const PricingManagementPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);

  const [productId, setProductId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [basePrice, setBasePrice] = useState(0);
  const [minQty, setMinQty] = useState(1);
  const [discountPct, setDiscountPct] = useState(0);
  const [creating, setCreating] = useState(false);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const data = await salesService.getPricingRules();
      setRules(data || []);
    } catch (err) {
      console.error('Failed to load pricing rules:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [prodRes, custRes] = await Promise.all([
        api.get('/products?limit=50'),
        api.get('/customers?limit=50'),
      ]);
      setProducts(prodRes.data.data || []);
      setCustomers(custRes.data.data || []);
    } catch (err) {
      console.error('Failed to load products/customers:', err);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleOpenModal = () => {
    fetchDependencies();
    setShowCreateModal(true);
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || basePrice <= 0) return;
    setCreating(true);
    try {
      await salesService.createPricingRule({
        product_id: productId,
        customer_id: customerId || undefined,
        base_price: basePrice,
        min_quantity: minQty,
        discount_percentage: discountPct,
      });
      setShowCreateModal(false);
      setProductId('');
      setCustomerId('');
      setBasePrice(0);
      setMinQty(1);
      setDiscountPct(0);
      fetchRules();
    } catch (err) {
      console.error('Failed to create pricing rule:', err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/60 shadow-lg">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
            <DollarSign className="w-7 h-7 text-purple-400" />
            <span>Customer & Product Pricing Foundation</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Configure custom customer price lists, volume tier discounts, contract prices, and date-based pricing rules.
          </p>
        </div>
        <button
          onClick={handleOpenModal}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl shadow-md transition flex items-center space-x-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Pricing Rule</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs uppercase font-semibold text-slate-400 border-b border-slate-700">
              <tr>
                <th className="px-6 py-4">Product Ref</th>
                <th className="px-6 py-4">Customer Scope</th>
                <th className="px-6 py-4">Base Unit Price</th>
                <th className="px-6 py-4">Min Quantity</th>
                <th className="px-6 py-4">Tier Discount</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    Loading pricing rules...
                  </td>
                </tr>
              ) : rules.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    No custom pricing rules configured yet.
                  </td>
                </tr>
              ) : (
                rules.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-700/30 transition">
                    <td className="px-6 py-4 font-bold text-white">{r.product_id}</td>
                    <td className="px-6 py-4 font-medium text-slate-300">
                      {r.customer_id ? `Customer: ${r.customer_id}` : 'Global Default Price'}
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-400">₹{Number(r.base_price).toFixed(2)}</td>
                    <td className="px-6 py-4 font-medium text-slate-300">{r.min_quantity} pcs</td>
                    <td className="px-6 py-4 text-purple-400 font-semibold">{r.discount_percentage}% OFF</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 inline-flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>ACTIVE</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-slate-700 pb-3">
              <h3 className="text-lg font-bold text-white">Create Pricing Matrix Rule</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-semibold text-slate-300 mb-1">Product *</label>
                <select
                  required
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-purple-500"
                >
                  <option value="">-- Choose Product --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku || 'SKU'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase font-semibold text-slate-300 mb-1">Customer Specific (Optional)</label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-purple-500"
                >
                  <option value="">-- All Customers (Global) --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs uppercase font-semibold text-slate-300 mb-1">Base Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={basePrice}
                    onChange={(e) => setBasePrice(parseFloat(e.target.value || '0'))}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-semibold text-slate-300 mb-1">Min Qty</label>
                  <input
                    type="number"
                    min="1"
                    value={minQty}
                    onChange={(e) => setMinQty(parseInt(e.target.value || '1', 10))}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-semibold text-slate-300 mb-1">Discount %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discountPct}
                    onChange={(e) => setDiscountPct(parseFloat(e.target.value || '0'))}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-xl transition shadow-md"
                >
                  {creating ? 'Saving...' : 'Save Pricing Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
