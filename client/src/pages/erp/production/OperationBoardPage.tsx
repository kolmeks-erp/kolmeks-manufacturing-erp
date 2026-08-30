import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GitFork, Play, CheckCircle2, Factory, Cpu, Layers } from 'lucide-react';
import { ERP_BASE_PATH } from '../../../constants/navigation';
import { productionService } from '../../../services/production.service';
import { ProductionOrder } from '../../../types/production';

export const OperationBoardPage: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchActiveOrders();
  }, []);

  const fetchActiveOrders = async () => {
    try {
      setLoading(true);
      const res = await productionService.getOrders({ status: 'IN_PROGRESS' });
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStepStatus = async (opId: string, status: string) => {
    try {
      await productionService.updateOperationStatus(opId, { status });
      fetchActiveOrders();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
            <GitFork className="w-3.5 h-3.5" />
            <span>Shop Floor Dispatch</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Active Operation Dispatch Board</h1>
          <p className="text-slate-500 text-sm">Real-time status updates for in-progress shop floor machine operations.</p>
        </div>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200 shadow-sm">Loading shop floor jobs...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200 shadow-sm">
            No active in-progress production orders on the shop floor right now.
          </div>
        ) : (
          orders.map((ord) => (
            <div key={ord.id} className="bg-white border border-slate-200 p-6 rounded-xl space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-lg font-bold text-indigo-600">{ord.production_order_number}</span>
                  <span className="text-slate-900 font-semibold text-sm">{ord.product?.name}</span>
                </div>
                <button
                  onClick={() => navigate(`${ERP_BASE_PATH}/production/orders/${ord.id}`)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200 transition-colors"
                >
                  View Order Detail
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {ord.operations?.map((op) => (
                  <div key={op.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="w-6 h-6 rounded bg-indigo-100 text-indigo-700 font-mono font-bold text-xs flex items-center justify-center">
                        {op.sequence}
                      </span>
                      <span className="text-[11px] font-mono font-semibold text-slate-600">{op.status}</span>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{op.operation_name}</h4>
                      <p className="text-xs text-slate-500 mt-1">{op.work_center?.name || 'Unassigned WC'}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
                      {op.status !== 'IN_PROGRESS' && op.status !== 'COMPLETED' && (
                        <button
                          onClick={() => handleStepStatus(op.id, 'IN_PROGRESS')}
                          className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium shadow-sm"
                        >
                          Start
                        </button>
                      )}
                      {op.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => handleStepStatus(op.id, 'COMPLETED')}
                          className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium shadow-sm"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
