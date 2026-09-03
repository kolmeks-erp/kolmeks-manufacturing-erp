import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  Plus,
  X,
  Upload,
  Download,
  Eye,
  Tag,
  Calendar,
  Building,
  CheckCircle,
  Clock,
  Shield,
} from 'lucide-react';
import { documentService } from '../../../services/document.service';
import { DocumentItem, DocumentTypeItem, DocumentCategoryItem } from '../../../types/document';
import { ERP_BASE_PATH } from '../../../constants/navigation';

export const DocumentLibraryPage: React.FC = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [types, setTypes] = useState<DocumentTypeItem[]>([]);
  const [categories, setCategories] = useState<DocumentCategoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filter States
  const [search, setSearch] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [archivedFilter, setArchivedFilter] = useState<boolean>(false);

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type_id: '',
    category_id: '',
    tags: '',
    confidentiality_level: 'INTERNAL',
    effective_date: '',
    review_date: '',
    expiry_date: '',
    related_module: 'General',
    related_record_id: '',
    related_record_reference: '',
  });

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await documentService.getDocuments({
        search,
        type_id: typeFilter || undefined,
        category_id: categoryFilter || undefined,
        status: statusFilter || undefined,
        is_archived: archivedFilter,
      });
      setDocuments(res.data);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [tData, cData] = await Promise.all([
        documentService.getDocumentTypes(),
        documentService.getDocumentCategories(),
      ]);
      setTypes(tData);
      setCategories(cData);
    } catch (err) {
      console.error('Failed to fetch type/category metadata:', err);
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [search, typeFilter, categoryFilter, statusFilter, archivedFilter]);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Document title is required.');
      return;
    }

    setUploadLoading(true);
    try {
      const uploadPayload = new FormData();
      if (selectedFile) {
        uploadPayload.append('file', selectedFile);
      }
      uploadPayload.append('title', formData.title);
      uploadPayload.append('description', formData.description);
      uploadPayload.append('type_id', formData.type_id);
      uploadPayload.append('category_id', formData.category_id);
      uploadPayload.append('tags', formData.tags);
      uploadPayload.append('confidentiality_level', formData.confidentiality_level);
      uploadPayload.append('effective_date', formData.effective_date);
      uploadPayload.append('review_date', formData.review_date);
      uploadPayload.append('expiry_date', formData.expiry_date);
      uploadPayload.append('related_module', formData.related_module);
      uploadPayload.append('related_record_id', formData.related_record_id);
      uploadPayload.append('related_record_reference', formData.related_record_reference);

      await documentService.createDocument(uploadPayload);
      setShowUploadModal(false);
      setSelectedFile(null);
      setFormData({
        title: '',
        description: '',
        type_id: '',
        category_id: '',
        tags: '',
        confidentiality_level: 'INTERNAL',
        effective_date: '',
        review_date: '',
        expiry_date: '',
        related_module: 'General',
        related_record_id: '',
        related_record_reference: '',
      });
      fetchDocuments();
    } catch (err) {
      console.error('Failed to upload document:', err);
      alert('Failed to upload document. Please check inputs.');
    } finally {
      setUploadLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      DRAFT: 'bg-slate-100 text-slate-700 border-slate-200/80',
      SUBMITTED: 'bg-blue-50 text-blue-700 border-blue-200/80',
      UNDER_REVIEW: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
      APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      PUBLISHED: 'bg-teal-50 text-teal-700 border-teal-200/80',
      REJECTED: 'bg-rose-50 text-rose-700 border-rose-200/80',
      CHANGES_REQUESTED: 'bg-amber-50 text-amber-800 border-amber-200/80',
      ARCHIVED: 'bg-slate-100 text-slate-600 border-slate-200/80',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${styles[status] || styles.DRAFT}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 shadow-xs">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">ERP Document Library</h1>
              <p className="text-xs text-slate-500 font-medium">
                Search, filter, categorize, and upload enterprise documents across modules
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          Upload New Document
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search title, DOC #..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="py-2 px-3 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          >
            <option value="">All Document Types</option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="py-2 px-3 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="APPROVED">Approved</option>
            <option value="PUBLISHED">Published</option>
            <option value="REJECTED">Rejected</option>
            <option value="CHANGES_REQUESTED">Changes Requested</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          {/* Archive Toggle */}
          <button
            onClick={() => setArchivedFilter(!archivedFilter)}
            className={`py-2 px-4 text-xs font-semibold rounded-xl border transition-all flex items-center justify-center gap-2 cursor-pointer ${
              archivedFilter
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            {archivedFilter ? 'Showing Archived' : 'Show Active Only'}
          </button>
        </div>
      </div>

      {/* Document Library Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Doc #</th>
                <th className="px-5 py-3.5">Title / Description</th>
                <th className="px-5 py-3.5">Type & Category</th>
                <th className="px-5 py-3.5">Version</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Owner</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-500 font-medium">
                    Loading document library...
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-500 font-medium">
                    No documents found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-indigo-600">{doc.document_number}</td>
                    <td className="px-5 py-4 max-w-xs">
                      <div className="font-bold text-slate-900 leading-tight">{doc.title}</div>
                      {doc.description && <div className="text-xs text-slate-500 font-medium truncate mt-0.5">{doc.description}</div>}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-800">{doc.type?.name || 'General'}</div>
                      <div className="text-[11px] text-slate-500 font-medium">{doc.category?.name || 'Uncategorized'}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2 py-0.5 font-mono text-[11px] font-bold text-slate-700 bg-slate-100 border border-slate-200/80 rounded">
                        v{doc.current_version?.version_number || '1.0'}
                      </span>
                    </td>
                    <td className="px-5 py-4">{getStatusBadge(doc.status)}</td>
                    <td className="px-5 py-4 text-xs font-medium text-slate-700">{doc.owner?.full_name || doc.owner?.email || 'System Admin'}</td>
                    <td className="px-5 py-4 text-right space-x-2">
                      <button
                        onClick={() => navigate(`${ERP_BASE_PATH}/documents/${doc.id}`)}
                        className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 rounded-lg transition-all inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-2xl w-full p-6 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-500" />
                Upload New Document to ERP Vault
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Document Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Electric Motor Assembly SOP (V2)"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief summary or scope of this document..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Document Type</label>
                  <select
                    value={formData.type_id}
                    onChange={(e) => setFormData({ ...formData, type_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="">Select Type</option>
                    {types.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Document Category</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Confidentiality Level</label>
                  <select
                    value={formData.confidentiality_level}
                    onChange={(e) => setFormData({ ...formData, confidentiality_level: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="PUBLIC">Public</option>
                    <option value="INTERNAL">Internal</option>
                    <option value="CONFIDENTIAL">Confidential</option>
                    <option value="HIGHLY_CONFIDENTIAL">Highly Confidential</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Tags (Comma-separated)</label>
                  <input
                    type="text"
                    placeholder="ISO9001, Quality, Urgent"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Review Date</label>
                  <input
                    type="date"
                    value={formData.review_date}
                    onChange={(e) => setFormData({ ...formData, review_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Attachment File (.pdf, .docx, .xlsx, .dxf, etc.)</label>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadLoading}
                  className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm disabled:opacity-50"
                >
                  {uploadLoading ? 'Uploading...' : 'Save & Upload Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
