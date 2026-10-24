import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../services/api';
import { Mail, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await authApi.forgotPassword(email);
      setMessage(res.message);
      if (res.resetToken) {
        setResetToken(res.resetToken);
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error?.message || 'Failed to request reset.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07080E] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 p-1 flex items-center justify-center">
              <img src="/logo.svg" alt="NEXA" className="w-full h-full object-contain" />
            </div>
            <span className="font-display font-extrabold text-2xl tracking-wider text-white">NEXA</span>
          </Link>
          <h2 className="mt-6 text-2xl font-bold font-display text-white">
            Reset your password
          </h2>
          <p className="mt-1.5 text-xs text-slate-400">
            Enter your email to receive recovery instructions
          </p>
        </div>

        <div className="mt-8 glass-panel py-8 px-6 sm:px-8 rounded-3xl border border-white/10 shadow-glass">
          {message ? (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-sm text-slate-200">{message}</p>
              {resetToken && (
                <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-left space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-indigo-300">Development Demo Token:</span>
                  <p className="text-xs font-mono text-cyan-300 break-all">{resetToken}</p>
                  <Link
                    to={`/reset-password?token=${resetToken}`}
                    className="inline-block text-xs font-semibold text-white underline pt-1"
                  >
                    Click to proceed to password reset form →
                  </Link>
                </div>
              )}
              <Link to="/login" className="inline-block text-xs text-indigo-400 hover:text-indigo-300 font-medium pt-2">
                Return to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Email address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-glow-primary transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span>{isLoading ? 'Sending...' : 'Send Reset Link'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <Link to="/login" className="text-xs text-slate-400 hover:text-slate-200">
                  Back to login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
