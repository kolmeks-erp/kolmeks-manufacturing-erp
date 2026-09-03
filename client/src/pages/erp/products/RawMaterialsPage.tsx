import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Boxes,
  Plus,
  Search,
  RefreshCw,
  Download,
  AlertTriangle,
  CheckCircle,
  Package,
  Layers,
  IndianRupee,
  ShoppingCart,
  SlidersHorizontal,
  XCircle,
  ArrowUpDown,
  ArrowLeftRight,
  Building2,
  Tag,
} from 'lucide-react';
import { ProductService } from '../../../services/product.service';
import { Product, ProductCategory } from '../../../types/product';
import { ERP_BASE_PATH } from '../../../constants/navigation';

export interface RawMaterialItem {
  id: string;
  code: string;
  name: string;
  category: string;
  grade: string;
  specification: string;
  warehouse: string;
  binLocation: string;
  currentStock: number;
  minStock: number;
  reorderPoint: number;
  unit: string;
  unitPrice: number;
  status: 'in_stock' | 'low_stock' | 'reorder_required' | 'out_of_stock';
  lastRestocked: string;
}

const INITIAL_DEMO_MATERIALS: RawMaterialItem[] = [
  {
    id: 'rm-001',
    code: 'RM-STEEL-316L',
    name: 'Stainless Steel Sheet (Grade 316L)',
    category: 'Metals & Alloys',
    grade: 'SS 316L',
    specification: '2.5mm Thickness x 1250mm x 2500mm',
    warehouse: 'Main Metal Depot',
    binLocation: 'Rack A-12',
    currentStock: 1450,
    minStock: 500,
    reorderPoint: 750,
    unit: 'kg',
    unitPrice: 285,
    status: 'in_stock',
    lastRestocked: '2026-08-28',
  },
  {
    id: 'rm-002',
    code: 'RM-COPPER-ETP',
    name: 'Electrolytic Tough Pitch Copper Wire',
    category: 'Electrical & Wiring',
    grade: 'ETP C11000',
    specification: '1.2mm Diameter Enamelled Winding Wire',
    warehouse: 'Electrical Store B',
    binLocation: 'Spool Shelf 04',
    currentStock: 320,
    minStock: 400,
    reorderPoint: 600,
    unit: 'kg',
    unitPrice: 740,
    status: 'low_stock',
    lastRestocked: '2026-08-15',
  },
  {
    id: 'rm-003',
    code: 'RM-ALU-6061-T6',
    name: 'Aluminum Alloy Round Bar',
    category: 'Metals & Alloys',
    grade: '6061-T6',
    specification: 'OD 50mm x 3000mm Length',
    warehouse: 'Main Metal Depot',
    binLocation: 'Rack B-08',
    currentStock: 2100,
    minStock: 800,
    reorderPoint: 1000,
    unit: 'kg',
    unitPrice: 220,
    status: 'in_stock',
    lastRestocked: '2026-08-30',
  },
  {
    id: 'rm-004',
    code: 'RM-POLY-NYLON66',
    name: 'Polyamide Nylon 6/6 Granules',
    category: 'Plastics & Polymers',
    grade: 'PA66 GF30',
    specification: '30% Glass Fiber Reinforced Injection Grade',
    warehouse: 'Plastics Bay C',
    binLocation: 'Silo Tank 02',
    currentStock: 150,
    minStock: 600,
    reorderPoint: 800,
    unit: 'kg',
    unitPrice: 310,
    status: 'reorder_required',
    lastRestocked: '2026-07-10',
  },
  {
    id: 'rm-005',
    code: 'RM-FAST-M8-SS',
    name: 'Hex Head Bolts M8 x 40mm',
    category: 'Fasteners & Hardware',
    grade: 'A4-70 Stainless',
    specification: 'Full Thread DIN 933 Stainless Steel',
    warehouse: 'Small Parts Room',
    binLocation: 'Bin C-102',
    currentStock: 8500,
    minStock: 2000,
    reorderPoint: 3500,
    unit: 'pcs',
    unitPrice: 12.5,
    status: 'in_stock',
    lastRestocked: '2026-08-20',
  },
  {
    id: 'rm-006',
    code: 'RM-CAST-IRON-FG260',
    name: 'Grey Iron Pump Housing Castings',
    category: 'Castings & Forgings',
    grade: 'FG 260 IS:210',
    specification: 'Pre-machined Sub-Assembly Blank',
    warehouse: 'Foundry Yard',
    binLocation: 'Pallet Zone 05',
    currentStock: 85,
    minStock: 100,
    reorderPoint: 150,
    unit: 'pcs',
    unitPrice: 1850,
    status: 'low_stock',
    lastRestocked: '2026-08-05',
  },
  {
    id: 'rm-007',
    code: 'RM-CHEM-COOLANT-V',
    name: 'Semi-Synthetic Metalworking Fluid',
    category: 'Chemical & Fluids',
    grade: 'ISO VG 46',
    specification: 'Soluble CNC Cutting Oil - 210L Drum',
    warehouse: 'Chemical Yard',
    binLocation: 'Drum Bay D-01',
    currentStock: 12,
    minStock: 5,
    reorderPoint: 8,
    unit: 'drums',
    unitPrice: 14500,
    status: 'in_stock',
    lastRestocked: '2026-08-25',
  },
];

export const RawMaterialsPage: React.FC = () => {
  const navigate = useNavigate();

  // State Management
  const [materials, setMaterials] = useState<RawMaterialItem[]>(INITIAL_DEMO_MATERIALS);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [reorderModalItem, setReorderModalItem] = useState<RawMaterialItem | null>(null);
  const [reorderQty, setReorderQty] = useState<number>(0);

  // Scroll Synchronization refs for Header, Mid-Line Scrollbar, and Data Table
  const headerScrollRef = React.useRef<HTMLDivElement>(null);
  const topScrollRef = React.useRef<HTMLDivElement>(null);
  const tableScrollRef = React.useRef<HTMLDivElement>(null);
  const tableElRef = React.useRef<HTMLTableElement>(null);
  const [tableWidth, setTableWidth] = useState<number>(1250);

  // Sync scroll width dynamically
  useEffect(() => {
    const updateWidth = () => {
      if (tableElRef.current) {
        setTableWidth(Math.max(tableElRef.current.scrollWidth, 1250));
      }
    };
    updateWidth();
    const timer = setTimeout(updateWidth, 100);
    window.addEventListener('resize', updateWidth);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateWidth);
    };
  }, [materials]);

  const handleTopScroll = () => {
    if (topScrollRef.current) {
      const scrollLeft = topScrollRef.current.scrollLeft;
      if (headerScrollRef.current) headerScrollRef.current.scrollLeft = scrollLeft;
      if (tableScrollRef.current) tableScrollRef.current.scrollLeft = scrollLeft;
    }
  };

  const handleTableScroll = () => {
    if (tableScrollRef.current) {
      const scrollLeft = tableScrollRef.current.scrollLeft;
      if (headerScrollRef.current) headerScrollRef.current.scrollLeft = scrollLeft;
      if (topScrollRef.current) topScrollRef.current.scrollLeft = scrollLeft;
    }
  };

  // Load Real Raw Material Products from API if available
  const fetchRawMaterials = useCallback(async () => {
    setIsLoading(true);
    try {
      const [apiProducts, catData] = await Promise.all([
        ProductService.getProducts({ product_type: 'raw_material', limit: 50 }).catch(() => null),
        ProductService.getCategories().catch(() => []),
      ]);

      if (catData && catData.length > 0) {
        setCategories(catData);
      }

      if (apiProducts?.data && apiProducts.data.length > 0) {
        const mappedApiItems: RawMaterialItem[] = apiProducts.data.map((p: Product, idx: number) => {
          const stock = p.current_stock ?? p.stock_quantity ?? (100 + idx * 50);
          const minStk = p.min_stock_level ?? p.reorder_level ?? 200;
          let status: RawMaterialItem['status'] = 'in_stock';
          if (stock <= 0) status = 'out_of_stock';
          else if (stock < minStk / 2) status = 'reorder_required';
          else if (stock < minStk) status = 'low_stock';

          return {
            id: p.id,
            code: p.product_code || `RM-${idx + 100}`,
            name: p.name,
            category: p.category?.name || 'Metals & Alloys',
            grade: p.material || p.grade || 'Standard Grade',
            specification: p.part_number || p.description || 'Industrial Specification',
            warehouse: 'Main Metal Depot',
            binLocation: `Bin #${(idx % 10) + 1}`,
            currentStock: stock,
            minStock: minStk,
            reorderPoint: minStk * 1.5,
            unit: p.unit || 'kg',
            unitPrice: p.cost_price || p.unit_price || 250,
            status,
            lastRestocked: p.updated_at ? new Date(p.updated_at).toISOString().split('T')[0] : '2026-08-25',
          };
        });
        setMaterials(mappedApiItems);
      }
    } catch (err) {
      console.error('Failed to load raw materials from API, using demo dataset:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRawMaterials();
  }, [fetchRawMaterials]);

  // Filtered Materials
  const filteredMaterials = materials.filter((item) => {
    const matchesSearch =
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.specification.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || item.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate High-level Telemetry KPIs
  const totalValuation = materials.reduce((acc, m) => acc + m.currentStock * m.unitPrice, 0);
  const lowStockCount = materials.filter((m) => m.status === 'low_stock' || m.status === 'reorder_required').filter(Boolean).length;
  const criticalCount = materials.filter((m) => m.status === 'reorder_required' || m.status === 'out_of_stock').length;

  // Export CSV Handler
  const handleExportCSV = () => {
    const headers = ['Code', 'Material Name', 'Category', 'Grade', 'Specification', 'Warehouse', 'Current Stock', 'Min Stock', 'Unit', 'Unit Cost (INR)', 'Total Valuation (INR)', 'Status'];
    const rows = filteredMaterials.map((m) => [
      m.code,
      `"${m.name}"`,
      `"${m.category}"`,
      `"${m.grade}"`,
      `"${m.specification}"`,
      `"${m.warehouse}"`,
      m.currentStock,
      m.minStock,
      m.unit,
      m.unitPrice,
      m.currentStock * m.unitPrice,
      m.status.toUpperCase(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Kolmeks_Raw_Materials_Stock_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Open Reorder Modal
  const handleOpenReorder = (item: RawMaterialItem) => {
    setReorderModalItem(item);
    setReorderQty(Math.max(item.reorderPoint - item.currentStock, item.minStock));
  };

  // Confirm Reorder PR Navigation
  const handleConfirmReorder = () => {
    if (!reorderModalItem) return;
    navigate(`${ERP_BASE_PATH}/purchase-requisitions/new`, {
      state: {
        item_code: reorderModalItem.code,
        item_name: reorderModalItem.name,
        quantity: reorderQty,
        unit: reorderModalItem.unit,
        category: reorderModalItem.category,
      },
    });
  };

  return (
    <div className="space-y-4">
      {/* Top Banner Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 shadow-2xs shrink-0">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Raw Materials & Stock Master
              </h1>
              <span className="px-2.5 py-0.5 text-[10px] font-extrabold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
                Inventory & Procurement
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Real-time monitoring of raw material stock balances, material grade specifications, minimum reorder thresholds, and inventory valuation
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={fetchRawMaterials}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer border border-slate-200/70"
            title="Refresh Telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200/70"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => navigate(`${ERP_BASE_PATH}/purchase-requisitions/new`)}
            className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>New Requisition</span>
          </button>
          <button
            onClick={() => navigate(`${ERP_BASE_PATH}/products/new`)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Register Material</span>
          </button>
        </div>
      </div>

      {/* KPI Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Raw Materials Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between min-h-[120px]">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider truncate">
              Total Raw Materials
            </span>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 shrink-0">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight flex items-baseline gap-1.5">
              <span>{materials.length}</span>
              <span className="text-xs font-semibold text-slate-400">SKUs</span>
            </div>
            <div className="text-[11px] font-medium text-slate-500 mt-1 truncate">Active stock items</div>
          </div>
        </div>

        {/* Stock Valuation Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between min-h-[120px]">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider truncate">
              Stock Valuation
            </span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 shrink-0">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono tracking-tight flex items-baseline gap-1.5">
              <span>₹{(totalValuation / 100000).toFixed(2)}</span>
              <span className="text-xs font-semibold text-emerald-600">Lakh</span>
            </div>
            <div className="text-[11px] font-medium text-emerald-600 mt-1 truncate">Current inventory worth</div>
          </div>
        </div>

        {/* Low Stock Alerts Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-amber-300 transition-all flex flex-col justify-between min-h-[120px]">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider truncate">
              Low Stock Alerts
            </span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-100 shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-amber-600 font-mono tracking-tight flex items-baseline gap-1.5">
              <span>{lowStockCount}</span>
              <span className="text-xs font-semibold text-amber-600">Items</span>
            </div>
            <div className="text-[11px] font-medium text-amber-600 mt-1 truncate">Near min reorder point</div>
          </div>
        </div>

        {/* Critical Reorders Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-rose-300 transition-all flex flex-col justify-between min-h-[120px]">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider truncate">
              Critical Reorders
            </span>
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 shrink-0">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-rose-600 font-mono tracking-tight flex items-baseline gap-1.5">
              <span>{criticalCount}</span>
              <span className="text-xs font-semibold text-rose-600">Action Req.</span>
            </div>
            <div className="text-[11px] font-medium text-rose-600 mt-1 truncate">Immediate PR required</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by material code, name, grade, or specs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-9 py-2 text-xs bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold mr-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters:</span>
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="Metals & Alloys">Metals & Alloys</option>
              <option value="Electrical & Wiring">Electrical & Wiring</option>
              <option value="Plastics & Polymers">Plastics & Polymers</option>
              <option value="Fasteners & Hardware">Fasteners & Hardware</option>
              <option value="Castings & Forgings">Castings & Forgings</option>
              <option value="Chemical & Fluids">Chemical & Fluids</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium cursor-pointer"
            >
              <option value="all">All Stock Statuses</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock Warning</option>
              <option value="reorder_required">Reorder Required</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>

            {(searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedStatus('all');
                }}
                className="px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Materials Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* 1. TABLE HEADER (FIXED ALIGNMENT) */}
        <div
          ref={headerScrollRef}
          className="overflow-x-hidden bg-slate-50 border-b border-slate-200/80"
        >
          <table className="w-full text-left text-xs min-w-[1250px] table-fixed">
            <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4 font-bold w-[140px]">Material Code</th>
                <th className="py-3.5 px-4 font-bold w-[260px]">Material Name & Specification</th>
                <th className="py-3.5 px-4 font-bold w-[170px]">Category & Grade</th>
                <th className="py-3.5 px-4 font-bold w-[160px]">Warehouse / Bin</th>
                <th className="py-3.5 px-4 font-bold w-[150px]">Stock Balance</th>
                <th className="py-3.5 px-4 font-bold w-[120px]">Unit Price</th>
                <th className="py-3.5 px-4 font-bold w-[120px]">Valuation</th>
                <th className="py-3.5 px-4 font-bold w-[130px]">Status</th>
                <th className="py-3.5 px-4 text-right font-bold w-[100px]">Action</th>
              </tr>
            </thead>
          </table>
        </div>

        {/* 2. HIGH-VISIBILITY SCROLLBAR LINE LOCATED IN BETWEEN HEADER AND BODY */}
        <div
          ref={topScrollRef}
          onScroll={handleTopScroll}
          className="overflow-x-auto custom-table-scrollbar bg-slate-100/90 border-b border-slate-200/80 py-1 px-1"
        >
          <div style={{ width: `${tableWidth}px` }} className="h-2" />
        </div>

        {/* 3. TABLE BODY DATA ROWS */}
        <div
          ref={tableScrollRef}
          onScroll={handleTableScroll}
          className="overflow-x-auto custom-table-scrollbar"
        >
          <table ref={tableElRef} className="w-full text-left text-xs min-w-[1250px] table-fixed">
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredMaterials.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Package className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-slate-600">No raw material items found</p>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting your search query or filters.</p>
                  </td>
                </tr>
              ) : (
                filteredMaterials.map((row) => {
                  const pctOfMin = Math.min(Math.round((row.currentStock / row.minStock) * 100), 100);
                  const valuation = row.currentStock * row.unitPrice;

                  return (
                    <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Code */}
                      <td className="py-3.5 px-4 font-mono font-extrabold text-indigo-600 whitespace-nowrap w-[140px]">
                        <span className="bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                          {row.code}
                        </span>
                      </td>

                      {/* Name & Specification */}
                      <td className="py-3.5 px-4 w-[260px]">
                        <div className="font-extrabold text-slate-900 leading-tight truncate" title={row.name}>
                          {row.name}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 truncate" title={row.specification}>
                          {row.specification}
                        </div>
                      </td>

                      {/* Category & Grade */}
                      <td className="py-3.5 px-4 whitespace-nowrap w-[170px]">
                        <div className="font-bold text-slate-800 flex items-center gap-1.5 truncate">
                          <Tag className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{row.category}</span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 mt-0.5 truncate">Grade: {row.grade}</div>
                      </td>

                      {/* Warehouse & Bin */}
                      <td className="py-3.5 px-4 whitespace-nowrap w-[160px]">
                        <div className="text-slate-800 font-medium flex items-center gap-1.5 truncate">
                          <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{row.warehouse}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">{row.binLocation}</div>
                      </td>

                      {/* Stock Balance & Gauge */}
                      <td className="py-3.5 px-4 w-[150px]">
                        <div className="flex items-center justify-between font-mono font-bold text-slate-900">
                          <span>
                            {row.currentStock.toLocaleString()}{' '}
                            <span className="text-[10px] text-slate-400 font-normal">{row.unit}</span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal">Min: {row.minStock}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${
                              row.status === 'in_stock'
                                ? 'bg-emerald-500'
                                : row.status === 'low_stock'
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${pctOfMin}%` }}
                          />
                        </div>
                      </td>

                      {/* Unit Price */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-700 whitespace-nowrap w-[120px]">
                        ₹{row.unitPrice.toLocaleString()} / {row.unit}
                      </td>

                      {/* Total Valuation */}
                      <td className="py-3.5 px-4 font-mono font-extrabold text-slate-900 whitespace-nowrap w-[120px]">
                        ₹{valuation.toLocaleString()}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap w-[130px]">
                        {row.status === 'in_stock' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                            <CheckCircle className="w-3 h-3" /> In Stock
                          </span>
                        )}
                        {row.status === 'low_stock' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200/80">
                            <AlertTriangle className="w-3 h-3" /> Low Stock
                          </span>
                        )}
                        {row.status === 'reorder_required' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200/80">
                            <ShoppingCart className="w-3 h-3" /> Reorder Req.
                          </span>
                        )}
                        {row.status === 'out_of_stock' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-600 border border-slate-300">
                            Out of Stock
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap w-[100px]">
                        <button
                          onClick={() => handleOpenReorder(row)}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Reorder</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div>
            Showing <span className="font-bold text-slate-800">{filteredMaterials.length}</span> of{' '}
            <span className="font-bold text-slate-800">{materials.length}</span> raw material items
          </div>
          <div className="font-mono text-slate-700 font-bold">
            Total Valuation: ₹{totalValuation.toLocaleString()} INR
          </div>
        </div>
      </div>

      {/* Quick Reorder Modal */}
      {reorderModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-extrabold text-slate-900">Initiate Purchase Requisition</h3>
              </div>
              <button
                onClick={() => setReorderModalItem(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                <div className="font-bold text-slate-900 text-sm">{reorderModalItem.name}</div>
                <div className="font-mono text-indigo-600 font-extrabold">{reorderModalItem.code}</div>
                <div className="text-slate-500">Grade: {reorderModalItem.grade} • Category: {reorderModalItem.category}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-slate-400 font-bold text-[10px] uppercase">Current Stock</div>
                  <div className="text-base font-black font-mono text-slate-800">
                    {reorderModalItem.currentStock} {reorderModalItem.unit}
                  </div>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                  <div className="text-amber-600 font-bold text-[10px] uppercase">Min Stock Level</div>
                  <div className="text-base font-black font-mono text-amber-700">
                    {reorderModalItem.minStock} {reorderModalItem.unit}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Requisition Order Quantity ({reorderModalItem.unit})
                </label>
                <input
                  type="number"
                  value={reorderQty}
                  onChange={(e) => setReorderQty(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-slate-600 text-[11px]">
                Estimated Purchase Cost:{' '}
                <span className="font-extrabold text-indigo-700 font-mono">
                  ₹{(reorderQty * reorderModalItem.unitPrice).toLocaleString()} INR
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setReorderModalItem(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReorder}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Proceed to Requisition</span>
                <ShoppingCart className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
