import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Briefcase, Building, Boxes, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import authService from '../services/authService';
import { useToast } from '../components/Toast';
import axios from 'axios';
import { BASE_URL } from '../services/api';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  
  const isRegister = location.pathname === '/register';
  const isForgotPassword = location.pathname === '/forgot-password';

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  // Reset form when changing routes
  useEffect(() => {
    reset();
  }, [location.pathname, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (isRegister) {
        // Register flow
        const payload = {
          name: data.name,
          email: data.email,
          password: data.password,
          role: 'Employee',
          designation: null,
          department_id: null,
        };
        await authService.register(payload);
        showToast('Registration successful! Please wait for an administrator to approve your account.', 'success');
        navigate('/login');
      } else if (isForgotPassword) {
        // Forgot password flow
        await authService.forgotPassword(data.email);
        showToast('If the email exists, a password reset link has been sent.', 'success');
        navigate('/login');
      } else {
        // Login flow
        const res = await authService.login(data.email, data.password);
        showToast(`Welcome back, ${res.user.name}!`, 'success');
        
        if (res.user.role === 'Admin') {
          navigate('/admin-dashboard');
        } else {
          navigate('/employee-dashboard');
        }
      }
    } catch (err) {
      showToast(err.message || 'Action failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg px-4 py-8">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[480px] w-[480px] rounded-full bg-brand/20 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[480px] w-[480px] rounded-full bg-blue-700/20 blur-[140px]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(#374151 1px, transparent 1px), linear-gradient(90deg, #374151 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative z-10 grid w-full max-w-4xl overflow-hidden rounded-2xl border border-white/10 shadow-popover lg:grid-cols-2">
        {/* Brand panel */}
        <div className="relative hidden flex-col justify-between bg-gradient-to-br from-bg-surface to-bg p-10 lg:flex">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-blue-700 text-sm font-bold text-white shadow-glow">
              AF
            </div>
            <span className="text-lg font-semibold text-text">AssetFlow</span>
          </div>

          <div>
            <h2 className="text-2xl font-semibold leading-snug text-text">
              Every asset,
              <br />
              accounted for.
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-text-secondary">
              Track allocations, bookings, and maintenance across your organization from a single, unified workspace.
            </p>

            <div className="mt-8 space-y-3">
              {[
                { icon: Boxes, text: '2,400+ assets tracked in real time' },
                { icon: ShieldCheck, text: 'Role-based access & full audit trail' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-sm text-text-secondary">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
                    <Icon size={15} className="text-brand-light" />
                  </div>
                  {text}
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-gray-500">© 2026 AssetFlow. All rights reserved.</p>
        </div>

        {/* Form panel — glassmorphism card */}
        <div className="relative bg-white/[0.03] p-8 backdrop-blur-2xl sm:p-10">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-blue-700 text-sm font-bold text-white">
              AF
            </div>
            <span className="text-lg font-semibold text-text">AssetFlow</span>
          </div>

          <h1 className="text-xl font-semibold text-text">
            {isRegister
              ? 'Create employee account'
              : isForgotPassword
              ? 'Reset password'
              : 'Sign in to your workspace'}
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            {isRegister
              ? 'Fill in your details to register.'
              : isForgotPassword
              ? 'Enter your email to reset password.'
              : 'Enter your credentials to continue.'}
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4">
            {isRegister && (
              <div>
                <label className="label-base">Full Name</label>
                <div className="relative">
                  <User size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    {...register('name', { required: 'Full name is required' })}
                    className="input-base pl-10"
                    placeholder="Rahul Kumar"
                  />
                </div>
                {errors.name && <p className="mt-1 text-xs text-danger">{errors.name.message}</p>}
              </div>
            )}

            <div>
              <label className="label-base">Email</label>
              <div className="relative">
                <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  {...register('email', { required: 'Email is required' })}
                  className="input-base pl-10"
                  placeholder="name@company.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-danger">{errors.email.message}</p>}
            </div>

            {!isForgotPassword && (
              <div>
                <div className="flex items-center justify-between">
                  <label className="label-base">Password</label>
                  {!isRegister && (
                    <Link to="/forgot-password" className="mb-1.5 text-xs font-medium text-brand-light hover:text-brand">
                      Forgot password?
                    </Link>
                  )}
                </div>
                <div className="relative">
                  <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', { required: 'Password is required' })}
                    className="input-base pl-10 pr-10"
                    placeholder="••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-text"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-danger">{errors.password.message}</p>}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary mt-2 w-full py-2.5">
              {loading ? (
                'Processing...'
              ) : isRegister ? (
                'Sign Up'
              ) : isForgotPassword ? (
                'Send Reset Link'
              ) : (
                <>
                  Sign in <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {isForgotPassword && (
            <div className="mt-6 text-center">
              <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-light hover:text-brand">
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </div>
          )}

          {!isForgotPassword && (
            <>
              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-gray-500">
                  {isRegister ? 'Already have an account?' : 'New here?'}
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <button
                type="button"
                onClick={() => navigate(isRegister ? '/login' : '/register')}
                className="btn-secondary w-full py-2.5"
              >
                {isRegister ? 'Sign In instead' : 'Create account'}
              </button>
              {isRegister && (
                <p className="mt-3 text-center text-xs text-gray-500">
                  Signing up creates an employee account — admin approval is required before logging in.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
