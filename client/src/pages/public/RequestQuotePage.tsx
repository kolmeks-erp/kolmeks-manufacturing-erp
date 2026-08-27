import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  FileText,
  Building2,
  User,
  Mail,
  Phone,
  Globe,
  Layers,
  Calendar,
  UploadCloud,
  FileCheck,
  X,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  HelpCircle,
  Clock,
  Lock,
} from 'lucide-react';
import { SEO } from '../../components/public/SEO';
import { Container } from '../../components/ui/Container';
import { Button } from '../../components/ui/Button';
import { submitRFQPayload, RFQResponseData } from '../../services/rfq.service';

interface RFQFormInputs {
  full_name: string;
  company: string;
  email: string;
  phone?: string;
  country: string;
  requirement_type: string;
  other_requirement?: string;
  project_name: string;
  description: string;
  estimated_quantity: number;
  unit: string;
  target_delivery_date?: string;
  material?: string;
  surface_finish?: string;
  tolerance_requirements?: string;
  hp_field?: string;
}

const REQUIREMENT_OPTIONS = [
  'CNC Machining',
  'Contract Manufacturing',
  'Assembly',
  'Electric Motor Components',
  'Supply Chain',
  'Other',
];

const UNIT_OPTIONS = ['Pcs', 'Sets', 'Kg', 'Meters', 'Hours', 'Batches'];

const ALLOWED_EXTENSIONS = [
  '.pdf',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.dxf',
  '.step',
  '.stp',
  '.iges',
  '.igs',
  '.dwg',
];

const PROHIBITED_EXTENSIONS = ['.exe', '.bat', '.cmd', '.sh', '.js', '.html', '.php', '.vbs', '.ps1'];

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB
const MAX_FILES_COUNT = 5;

export const RequestQuotePage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<RFQResponseData | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm<RFQFormInputs>({
    defaultValues: {
      country: 'Finland',
      requirement_type: 'CNC Machining',
      unit: 'Pcs',
      estimated_quantity: 100,
    },
  });

  const watchRequirementType = watch('requirement_type');
  const formValues = watch();

  // Handle File Drag & Drop / Selection
  const handleFileSelection = (newFiles: FileList | File[] | null) => {
    setFileError(null);
    if (!newFiles || newFiles.length === 0) return;

    const fileArray = Array.from(newFiles);
    const validFiles: File[] = [];

    if (selectedFiles.length + fileArray.length > MAX_FILES_COUNT) {
      setFileError(`You can attach a maximum of ${MAX_FILES_COUNT} supporting files per quote request.`);
      return;
    }

    for (const file of fileArray) {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();

      if (PROHIBITED_EXTENSIONS.includes(ext)) {
        setFileError(`Executable/script file '${file.name}' is prohibited for security reasons.`);
        return;
      }

      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        setFileError(`Unsupported file format '${ext}'. Allowed types: PDF, CAD (STEP, STP, DXF, DWG, IGES), PNG, JPG, WEBP.`);
        return;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        setFileError(`File '${file.name}' exceeds the maximum allowed size of 15MB.`);
        return;
      }

      validFiles.push(file);
    }

    setSelectedFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFileError(null);
  };

  // Step Validation & Navigation
  const handleNextStep = async () => {
    let isValid = false;
    if (currentStep === 1) {
      isValid = await trigger(['full_name', 'company', 'email', 'phone', 'country']);
    } else if (currentStep === 2) {
      isValid = await trigger(['requirement_type', 'other_requirement']);
    } else if (currentStep === 3) {
      isValid = await trigger([
        'project_name',
        'description',
        'estimated_quantity',
        'unit',
        'target_delivery_date',
        'material',
        'surface_finish',
        'tolerance_requirements',
      ]);
    } else if (currentStep === 4) {
      isValid = true; // Files are optional
    }

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  // Final Form Submission
  const onSubmit = async (data: RFQFormInputs) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await submitRFQPayload({
        ...data,
        files: selectedFiles,
      });

      if (response.success && response.data) {
        setSuccessData(response.data);
        setCurrentStep(6); // Move to Success state
        window.scrollTo({ top: 200, behavior: 'smooth' });
      } else {
        throw new Error(response.message || 'Submission failed.');
      }
    } catch (err: any) {
      console.error('RFQ submission error:', err);
      const msg =
        err.response?.data?.error?.message ||
        err.message ||
        'We encountered a problem submitting your quotation request. Please verify your details and try again.';
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <>
      <SEO
        title="Kolmeks | Request a Quote"
        description="Submit your industrial contract manufacturing, precision CNC machining, sub-assembly, or electric motor component requirements for technical evaluation."
      />

      {/* Page Header / Hero */}
      <section className="bg-[#0B1E36] text-white py-16 lg:py-20 relative overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/40 to-slate-950/60 pointer-events-none" />
        <Container className="relative z-10">
          <div className="max-w-3xl">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded border border-emerald-500/30 inline-block mb-4">
              REQUEST A QUOTE
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white mb-4">
              Tell Us What You Need to Manufacture.
            </h1>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              Provide your manufacturing requirements and technical specifications for engineering evaluation.
              Our engineering team will review your drawings, tolerances, and volume targets to formulate a tailored production offer.
            </p>
          </div>
        </Container>
      </section>

      {/* Main Section */}
      <section className="py-12 lg:py-16 bg-slate-50 min-h-screen">
        <Container>
          {/* SUCCESS STATE */}
          {currentStep === 6 && successData ? (
            <div className="max-w-2xl mx-auto bg-white rounded-2xl p-8 sm:p-12 border border-slate-200 shadow-xl text-center">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded border border-emerald-200">
                REQUEST RECEIVED
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0B1E36] mt-4 mb-2">
                Request Submitted Successfully
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
                Thank you. Your manufacturing requirement has been safely submitted to our engineering team for evaluation.
              </p>

              {/* Request Reference Badge */}
              <div className="bg-slate-900 text-white rounded-xl p-6 mb-8 border border-slate-800 shadow-inner">
                <div className="text-xs uppercase font-mono tracking-wider text-slate-400 mb-1">
                  Official Request Reference Number
                </div>
                <div className="text-2xl sm:text-3xl font-black font-mono tracking-wider text-emerald-400">
                  {successData.requestNumber}
                </div>
                <div className="text-xs text-slate-400 mt-2">
                  {successData.filesAttachedCount} file attachment(s) uploaded securely to Cloudinary storage.
                </div>
              </div>

              <p className="text-xs text-slate-500 mb-8 leading-relaxed">
                Our sales and production engineering staff will review your component specifications, material grade, and delivery timelines.
                You will be contacted at <strong className="text-slate-800">{formValues.email}</strong> once evaluation is complete.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/">
                  <Button variant="outline" className="w-full sm:w-auto">
                    Back to Home
                  </Button>
                </Link>
                <Link to="/contract-manufacturing">
                  <Button variant="primary" className="w-full sm:w-auto">
                    Explore Capabilities
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              {/* STEP PROGRESS BAR */}
              <div className="bg-white rounded-xl p-4 sm:p-6 border border-slate-200 shadow-xs mb-8">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  <span className={currentStep >= 1 ? 'text-[#0B1E36]' : ''}>01. Contact</span>
                  <span className={currentStep >= 2 ? 'text-[#0B1E36]' : ''}>02. Capability</span>
                  <span className={currentStep >= 3 ? 'text-[#0B1E36]' : ''}>03. Details</span>
                  <span className={currentStep >= 4 ? 'text-[#0B1E36]' : ''}>04. Files</span>
                  <span className={currentStep >= 5 ? 'text-[#0B1E36]' : ''}>05. Review</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#0F2C59] h-full transition-all duration-300 ease-out"
                    style={{ width: `${(currentStep / 5) * 100}%` }}
                  />
                </div>
              </div>

              {/* ERROR STATE BANNER */}
              {submitError && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-sm">
                  <AlertTriangle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
                  <div>
                    <h4 className="font-bold">We couldn't submit your request</h4>
                    <p className="text-xs mt-1 text-red-600">{submitError}</p>
                  </div>
                </div>
              )}

              {/* FORM CARD */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 sm:p-10">
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                  {/* HONEYPOT BOT FIELD (HIDDEN) */}
                  <input
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    className="hidden"
                    style={{ display: 'none' }}
                    {...register('hp_field')}
                  />

                  {/* STEP 1: CONTACT INFORMATION */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <div className="border-b border-slate-100 pb-4">
                        <span className="text-xs font-mono font-bold text-slate-600 uppercase tracking-widest block mb-1">
                          SECTION 01
                        </span>
                        <h2 className="text-xl font-bold text-[#0B1E36] flex items-center gap-2">
                          <User className="w-5 h-5 text-blue-600" />
                          Contact & Business Information
                        </h2>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Full Name */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                            <input
                              type="text"
                              placeholder="e.g. Matti Virtanen"
                              className={`w-full pl-10 pr-3 py-2.5 bg-slate-50 border rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                                errors.full_name ? 'border-red-500' : 'border-slate-300'
                              }`}
                              {...register('full_name', { required: 'Full name is required.' })}
                            />
                          </div>
                          {errors.full_name && (
                            <p className="text-xs text-red-500 mt-1">{errors.full_name.message}</p>
                          )}
                        </div>

                        {/* Company */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                            Company Name <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                            <input
                              type="text"
                              placeholder="e.g. Valmet Industrial Oy"
                              className={`w-full pl-10 pr-3 py-2.5 bg-slate-50 border rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                                errors.company ? 'border-red-500' : 'border-slate-300'
                              }`}
                              {...register('company', { required: 'Company name is required.' })}
                            />
                          </div>
                          {errors.company && (
                            <p className="text-xs text-red-500 mt-1">{errors.company.message}</p>
                          )}
                        </div>

                        {/* Business Email */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                            Business Email <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                            <input
                              type="email"
                              placeholder="name@company.com"
                              className={`w-full pl-10 pr-3 py-2.5 bg-slate-50 border rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                                errors.email ? 'border-red-500' : 'border-slate-300'
                              }`}
                              {...register('email', {
                                required: 'Business email is required.',
                                pattern: {
                                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                  message: 'Please enter a valid email address.',
                                },
                              })}
                            />
                          </div>
                          {errors.email && (
                            <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
                          )}
                        </div>

                        {/* Phone */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                            Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
                          </label>
                          <div className="relative">
                            <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                            <input
                              type="tel"
                              placeholder="+358 40 123 4567"
                              className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                              {...register('phone')}
                            />
                          </div>
                        </div>

                        {/* Country */}
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                            Country <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                            <input
                              type="text"
                              placeholder="Finland"
                              className={`w-full pl-10 pr-3 py-2.5 bg-slate-50 border rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                                errors.country ? 'border-red-500' : 'border-slate-300'
                              }`}
                              {...register('country', { required: 'Country is required.' })}
                            />
                          </div>
                          {errors.country && (
                            <p className="text-xs text-red-500 mt-1">{errors.country.message}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: MANUFACTURING REQUIREMENT */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div className="border-b border-slate-100 pb-4">
                        <span className="text-xs font-mono font-bold text-slate-600 uppercase tracking-widest block mb-1">
                          SECTION 02
                        </span>
                        <h2 className="text-xl font-bold text-[#0B1E36] flex items-center gap-2">
                          <Layers className="w-5 h-5 text-blue-600" />
                          Manufacturing Capability Selection
                        </h2>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                          Select Capability Required <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {REQUIREMENT_OPTIONS.map((opt) => (
                            <label
                              key={opt}
                              className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                                watchRequirementType === opt
                                  ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20'
                                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                              }`}
                            >
                              <input
                                type="radio"
                                value={opt}
                                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                {...register('requirement_type', { required: 'Please select a requirement type.' })}
                              />
                              <span className="ml-3 font-semibold text-sm text-slate-800">{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {watchRequirementType === 'Other' && (
                        <div className="pt-2">
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                            Specify Custom Requirement Details <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="Describe your custom fabrication requirement..."
                            className={`w-full px-4 py-2.5 bg-slate-50 border rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                              errors.other_requirement ? 'border-red-500' : 'border-slate-300'
                            }`}
                            {...register('other_requirement', {
                              required: watchRequirementType === 'Other' ? 'Please specify custom requirement.' : false,
                            })}
                          />
                          {errors.other_requirement && (
                            <p className="text-xs text-red-500 mt-1">{errors.other_requirement.message}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* STEP 3: PROJECT DETAILS */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div className="border-b border-slate-100 pb-4">
                        <span className="text-xs font-mono font-bold text-slate-600 uppercase tracking-widest block mb-1">
                          SECTION 03
                        </span>
                        <h2 className="text-xl font-bold text-[#0B1E36] flex items-center gap-2">
                          <FileText className="w-5 h-5 text-blue-600" />
                          Component & Volume Specifications
                        </h2>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Project Name */}
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                            Part / Project Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Pump Housing Flange DN200"
                            className={`w-full px-4 py-2.5 bg-slate-50 border rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                              errors.project_name ? 'border-red-500' : 'border-slate-300'
                            }`}
                            {...register('project_name', { required: 'Part/project name is required.' })}
                          />
                          {errors.project_name && (
                            <p className="text-xs text-red-500 mt-1">{errors.project_name.message}</p>
                          )}
                        </div>

                        {/* Description */}
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                            Description & Detailed Requirement <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            rows={4}
                            placeholder="Provide component specs, application context, machining operations, special inspection needs..."
                            className={`w-full px-4 py-2.5 bg-slate-50 border rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                              errors.description ? 'border-red-500' : 'border-slate-300'
                            }`}
                            {...register('description', { required: 'Project description is required.' })}
                          />
                          {errors.description && (
                            <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>
                          )}
                        </div>

                        {/* Estimated Quantity */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                            Estimated Quantity <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            min="1"
                            placeholder="100"
                            className={`w-full px-4 py-2.5 bg-slate-50 border rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                              errors.estimated_quantity ? 'border-red-500' : 'border-slate-300'
                            }`}
                            {...register('estimated_quantity', {
                              required: 'Quantity is required.',
                              min: { value: 1, message: 'Quantity must be at least 1.' },
                              valueAsNumber: true,
                            })}
                          />
                          {errors.estimated_quantity && (
                            <p className="text-xs text-red-500 mt-1">{errors.estimated_quantity.message}</p>
                          )}
                        </div>

                        {/* Unit */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                            Unit <span className="text-red-500">*</span>
                          </label>
                          <select
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                            {...register('unit')}
                          >
                            {UNIT_OPTIONS.map((u) => (
                              <option key={u} value={u}>
                                {u}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Target Delivery Date */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                            Target Delivery Date <span className="text-slate-400 font-normal">(Optional)</span>
                          </label>
                          <div className="relative">
                            <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                            <input
                              type="date"
                              className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                              {...register('target_delivery_date')}
                            />
                          </div>
                        </div>

                        {/* Material */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                            Material Grade <span className="text-slate-400 font-normal">(Optional)</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Stainless Steel 316L, Cast Iron"
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                            {...register('material')}
                          />
                        </div>

                        {/* Surface Finish */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                            Surface Finish <span className="text-slate-400 font-normal">(Optional)</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Ra 1.6 µm, Anodized, Powder Coated"
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                            {...register('surface_finish')}
                          />
                        </div>

                        {/* Tolerances */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                            Tolerances <span className="text-slate-400 font-normal">(Optional)</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. ±0.005 mm, ISO 2768-mK"
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                            {...register('tolerance_requirements')}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: FILE UPLOAD */}
                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <div className="border-b border-slate-100 pb-4">
                        <span className="text-xs font-mono font-bold text-slate-600 uppercase tracking-widest block mb-1">
                          SECTION 04
                        </span>
                        <h2 className="text-xl font-bold text-[#0B1E36] flex items-center gap-2">
                          <UploadCloud className="w-5 h-5 text-blue-600" />
                          Technical Drawings & File Uploads
                        </h2>
                      </div>

                      {/* Dropzone */}
                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          handleFileSelection(e.dataTransfer.files);
                        }}
                        className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/20 rounded-2xl p-8 text-center transition-colors cursor-pointer"
                      >
                        <UploadCloud className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                        <h3 className="font-bold text-slate-800 text-base mb-1">
                          Drag and drop technical files here
                        </h3>
                        <p className="text-xs text-slate-500 mb-4">
                          or click to browse your workstation files
                        </p>
                        <input
                          type="file"
                          multiple
                          id="file-input"
                          className="hidden"
                          onChange={(e) => handleFileSelection(e.target.files)}
                          accept=".pdf,.png,.jpg,.jpeg,.webp,.dxf,.step,.stp,.iges,.igs,.dwg"
                        />
                        <label htmlFor="file-input">
                          <span className="inline-flex items-center px-4 py-2 bg-[#0B1E36] hover:bg-[#0F2C59] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors">
                            Browse Workstation
                          </span>
                        </label>
                        <div className="mt-4 pt-4 border-t border-slate-200 text-[11px] text-slate-500 space-y-1">
                          <div>
                            <strong>Supported file formats:</strong> PDF, PNG, JPG, WEBP, DXF, STEP (.step / .stp), IGES (.iges / .igs), DWG
                          </div>
                          <div>
                            <strong>Maximum size limit:</strong> 15 MB per file (Up to {MAX_FILES_COUNT} files)
                          </div>
                        </div>
                      </div>

                      {/* File error message */}
                      {fileError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                          <span>{fileError}</span>
                        </div>
                      )}

                      {/* Selected Files List */}
                      {selectedFiles.length > 0 && (
                        <div className="space-y-3 pt-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                            Attached Files ({selectedFiles.length}/{MAX_FILES_COUNT})
                          </h4>
                          <div className="space-y-2">
                            {selectedFiles.map((file, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-3 bg-slate-100 rounded-lg border border-slate-200 text-xs"
                              >
                                <div className="flex items-center gap-3 overflow-hidden">
                                  <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                                  <span className="font-semibold text-slate-800 truncate">{file.name}</span>
                                  <span className="text-slate-400 font-mono">({formatFileSize(file.size)})</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeFile(idx)}
                                  className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                                  title="Remove attachment"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* STEP 5: REVIEW & CONFIRMATION */}
                  {currentStep === 5 && (
                    <div className="space-y-6">
                      <div className="border-b border-slate-100 pb-4">
                        <span className="text-xs font-mono font-bold text-slate-600 uppercase tracking-widest block mb-1">
                          SECTION 05
                        </span>
                        <h2 className="text-xl font-bold text-[#0B1E36] flex items-center gap-2">
                          <ShieldCheck className="w-5 h-5 text-emerald-600" />
                          Review Your Request Details
                        </h2>
                      </div>

                      <p className="text-xs text-slate-500 leading-relaxed">
                        Please inspect your quote request details before final submission to our production engineers.
                      </p>

                      <div className="space-y-4">
                        {/* Contact Card Summary */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                              Contact Information
                            </h4>
                            <button
                              type="button"
                              onClick={() => setCurrentStep(1)}
                              className="text-xs font-bold text-blue-600 hover:underline"
                            >
                              Edit
                            </button>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-600">
                            <div>
                              <span className="block text-[10px] text-slate-400">Name</span>
                              <strong className="text-slate-800">{formValues.full_name}</strong>
                            </div>
                            <div>
                              <span className="block text-[10px] text-slate-400">Company</span>
                              <strong className="text-slate-800">{formValues.company}</strong>
                            </div>
                            <div>
                              <span className="block text-[10px] text-slate-400">Email</span>
                              <strong className="text-slate-800">{formValues.email}</strong>
                            </div>
                            <div>
                              <span className="block text-[10px] text-slate-400">Phone</span>
                              <span className="text-slate-800">{formValues.phone || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="block text-[10px] text-slate-400">Country</span>
                              <span className="text-slate-800">{formValues.country}</span>
                            </div>
                          </div>
                        </div>

                        {/* Capability Summary */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                              Capability Selected
                            </h4>
                            <button
                              type="button"
                              onClick={() => setCurrentStep(2)}
                              className="text-xs font-bold text-blue-600 hover:underline"
                            >
                              Edit
                            </button>
                          </div>
                          <div className="text-xs text-slate-800 font-semibold">
                            {formValues.requirement_type}
                            {formValues.requirement_type === 'Other' && formValues.other_requirement && (
                              <span className="block font-normal text-slate-600 mt-1">
                                Spec: {formValues.other_requirement}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Project Details Summary */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                              Project Specifications
                            </h4>
                            <button
                              type="button"
                              onClick={() => setCurrentStep(3)}
                              className="text-xs font-bold text-blue-600 hover:underline"
                            >
                              Edit
                            </button>
                          </div>
                          <div className="space-y-2 text-xs">
                            <div>
                              <span className="block text-[10px] text-slate-400">Project Name</span>
                              <strong className="text-slate-800">{formValues.project_name}</strong>
                            </div>
                            <div>
                              <span className="block text-[10px] text-slate-400">Quantity</span>
                              <span className="text-slate-800 font-bold">
                                {formValues.estimated_quantity} {formValues.unit}
                              </span>
                            </div>
                            <div>
                              <span className="block text-[10px] text-slate-400">Description</span>
                              <p className="text-slate-700 whitespace-pre-wrap">{formValues.description}</p>
                            </div>
                          </div>
                        </div>

                        {/* Attachments Summary */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                              Files Attached ({selectedFiles.length})
                            </h4>
                            <button
                              type="button"
                              onClick={() => setCurrentStep(4)}
                              className="text-xs font-bold text-blue-600 hover:underline"
                            >
                              Edit
                            </button>
                          </div>
                          {selectedFiles.length === 0 ? (
                            <span className="text-xs text-slate-400 italic">No files attached</span>
                          ) : (
                            <div className="space-y-1">
                              {selectedFiles.map((f, i) => (
                                <div key={i} className="text-xs font-mono text-slate-700">
                                  • {f.name} ({formatFileSize(f.size)})
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* NAVIGATION BUTTONS */}
                  <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                    {currentStep > 1 && currentStep < 6 ? (
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Previous Step
                      </button>
                    ) : (
                      <div />
                    )}

                    {currentStep < 5 && (
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0B1E36] hover:bg-[#0F2C59] text-white text-xs font-bold rounded-lg transition-colors"
                      >
                        Continue to Next Step
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}

                    {currentStep === 5 && (
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Submitting to Backend...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Submit Request</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* HELPFUL FAQ CARDS */}
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 text-slate-600 space-y-2">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm text-[#0B1E36]">Evaluation Process</h4>
                  <p className="text-xs leading-relaxed text-slate-500">
                    Our quotation team reviews component drawings, material specifications, and production routing.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 text-slate-600 space-y-2">
                  <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                    <Lock className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm text-[#0B1E36]">Strict Confidentiality</h4>
                  <p className="text-xs leading-relaxed text-slate-500">
                    All technical CAD drawings and component details are stored under secure server controls.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 text-slate-600 space-y-2">
                  <div className="w-8 h-8 bg-slate-100 text-slate-700 rounded-lg flex items-center justify-center">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm text-[#0B1E36]">Need Assistance?</h4>
                  <p className="text-xs leading-relaxed text-slate-500">
                    Contact our customer technical support at sales@kolmeks.com for urgent inquiries.
                  </p>
                </div>
              </div>
            </div>
          )}
        </Container>
      </section>
    </>
  );
};
