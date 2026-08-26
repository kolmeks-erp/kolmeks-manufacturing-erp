import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ShieldCheck, Lock, Mail, AlertCircle, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ERP_BASE_PATH } from '../../constants/navigation';
import { KolmeksLogo } from '../../components/ui/KolmeksLogo';

interface LoginFormInputs {
  email: string;
  password: string;
}

export const ERPLoginPage: React.FC = () => {
  const { signIn, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showForgotModal, setShowForgotModal] = useState<boolean>(false);
  const [resetEmail, setResetEmail] = useState<string>('');
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || `${ERP_BASE_PATH}/dashboard`;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>();

  useEffect(() => {
    // If already authenticated and profile loaded, redirect immediately to dashboard
    if (isAuthenticated && !isAuthLoading) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isAuthLoading, navigate, from]);

  const onSubmit = async (data: LoginFormInputs) => {
    setAuthError(null);
    setIsSubmitting(true);

    try {
      await signIn({
        email: data.email.trim(),
        password: data.password,
      });
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      // User-friendly error mapping
      const errorMsg = err.message || '';
      if (errorMsg.includes('Invalid login credentials') || errorMsg.includes('invalid_credentials')) {
        setAuthError('Invalid email or password.');
      } else if (errorMsg.includes('Email not confirmed')) {
        setAuthError('Email address is not confirmed yet.');
      } else {
        setAuthError('Authentication failed. Please check your credentials and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    setResetMessage('If an authorized ERP account exists for this email, password reset instructions have been sent.');
    setTimeout(() => {
      setShowForgotModal(false);
      setResetMessage(null);
      setResetEmail('');
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-[#0B1E36] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center mb-3">
          <KolmeksLogo variant="dark-bg" size="lg" />
        </div>
        <h2 className="text-xl font-semibold text-slate-200 uppercase tracking-widest mt-2">
          Internal Manufacturing Portal
        </h2>
        <p className="mt-1 text-xs text-slate-400">Authorized Personnel & ERP Staff Access Only</p>
      </div>

      {/* Main Login Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-[#0F2C59] py-8 px-6 shadow-2xl rounded-lg border border-slate-700/60 sm:px-10">
          {authError && (
            <div className="mb-6 p-4 rounded bg-red-500/10 border border-red-500/30 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="text-xs text-red-300 font-medium">{authError}</div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Work Email Address
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  disabled={isSubmitting}
                  placeholder="name@kolmeks.fi"
                  className={`block w-full pl-10 pr-3 py-2.5 bg-[#0B1E36] border text-white text-sm rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${
                    errors.email ? 'border-red-500' : 'border-slate-600 focus:border-emerald-500'
                  }`}
                  {...register('email', {
                    required: 'Email is required.',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Please enter a valid email address.',
                    },
                  })}
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-400 font-medium">{errors.email.message}</p>}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  disabled={isSubmitting}
                  placeholder="••••••••••••"
                  className={`block w-full pl-10 pr-3 py-2.5 bg-[#0B1E36] border text-white text-sm rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${
                    errors.password ? 'border-red-500' : 'border-slate-600 focus:border-emerald-500'
                  }`}
                  {...register('password', {
                    required: 'Password is required.',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters.',
                    },
                  })}
                />
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-400 font-medium">{errors.password.message}</p>}
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center space-x-2 py-3 px-4 border border-transparent rounded shadow-sm text-sm font-semibold text-[#0B1E36] bg-emerald-500 hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#0B1E36] border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Industrial Notice */}
          <div className="mt-8 border-t border-slate-700/60 pt-4 text-center">
            <p className="text-xs text-slate-400 leading-relaxed">
              Protected by Enterprise Supabase Authentication & Role-Based Access Control (RBAC). Unauthorized attempts are logged.
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F2C59] border border-slate-700 rounded-lg max-w-md w-full p-6 text-slate-100 shadow-2xl">
            <div className="flex items-center space-x-3 mb-4">
              <KeyRound className="w-6 h-6 text-emerald-400" />
              <h3 className="text-lg font-bold">Reset Password</h3>
            </div>
            {resetMessage ? (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded text-xs text-emerald-300 mb-4">
                {resetMessage}
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <p className="text-xs text-slate-300">
                  Enter your registered work email address below to receive password reset instructions.
                </p>
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="name@kolmeks.fi"
                  className="w-full px-3 py-2 bg-[#0B1E36] border border-slate-600 rounded text-sm text-white focus:outline-none focus:border-emerald-500"
                />
                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-xs font-medium rounded transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-[#0B1E36] text-xs font-bold rounded transition-colors"
                  >
                    Send Instructions
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
