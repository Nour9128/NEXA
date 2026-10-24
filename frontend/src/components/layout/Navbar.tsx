import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, ArrowRight, Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-[#07080E]/80 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600/40 via-purple-600/40 to-cyan-500/40 border border-white/15 p-1.5 flex items-center justify-center transition-transform group-hover:scale-105 shadow-glow-primary">
            <img src="/logo.svg" alt="NEXA" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-xl tracking-wider text-white">NEXA</span>
            <span className="text-[10px] tracking-widest text-cyan-400 font-mono uppercase -mt-1">LIFE OS</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          <a href="#preview" className="hover:text-white transition-colors">Live Preview</a>
          <a href="#use-cases" className="hover:text-white transition-colors">Use Cases</a>
          <a href="#privacy" className="hover:text-white transition-colors">Privacy & Control</a>
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <Link
              to="/app"
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-medium text-sm flex items-center space-x-2 shadow-glow-primary transition-all transform hover:-translate-y-0.5"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-medium text-sm flex items-center space-x-2 shadow-glow-primary transition-all transform hover:-translate-y-0.5"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-400 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0C0F1E]/95 backdrop-blur-2xl border-b border-white/10 px-6 py-6 space-y-4">
          <nav className="flex flex-col space-y-3 text-base text-slate-200">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="py-1">Features</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="py-1">How It Works</a>
            <a href="#preview" onClick={() => setMobileMenuOpen(false)} className="py-1">Live Preview</a>
            <a href="#use-cases" onClick={() => setMobileMenuOpen(false)} className="py-1">Use Cases</a>
            <a href="#privacy" onClick={() => setMobileMenuOpen(false)} className="py-1">Privacy & Control</a>
          </nav>
          <div className="pt-4 border-t border-white/10 flex flex-col space-y-3">
            {user ? (
              <Link
                to="/app"
                className="w-full py-3 text-center rounded-xl bg-indigo-600 text-white font-medium"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="w-full py-2.5 text-center rounded-xl bg-white/5 text-slate-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="w-full py-2.5 text-center rounded-xl bg-indigo-600 text-white font-medium"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
