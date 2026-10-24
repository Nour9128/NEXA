import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, Globe, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="relative border-t border-white/10 bg-[#06070B] overflow-hidden">
      {/* Subtle radial glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[250px] bg-indigo-600/10 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 p-1 flex items-center justify-center">
                <img src="/logo.svg" alt="NEXA" className="w-full h-full object-contain" />
              </div>
              <span className="font-display font-bold text-2xl tracking-wider text-white">NEXA</span>
            </div>
            <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
              Your life, connected. Turn everyday intentions, scattered notes, screenshots, and ideas into organized momentum.
            </p>
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>Designed in Egypt • Built for the World</span>
            </div>
          </div>

          {/* Links Column 1 */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4 font-mono text-xs text-indigo-400">
              Product
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#preview" className="hover:text-white transition-colors">AI Engine</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
              <li><Link to="/app" className="hover:text-white transition-colors flex items-center gap-1">Workspace <ArrowUpRight className="w-3.5 h-3.5" /></Link></li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4 font-mono text-xs text-indigo-400">
              Use Cases
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><a href="#use-cases" className="hover:text-white transition-colors">Students & Exams</a></li>
              <li><a href="#use-cases" className="hover:text-white transition-colors">Travel & Itineraries</a></li>
              <li><a href="#use-cases" className="hover:text-white transition-colors">Shared Households</a></li>
              <li><a href="#use-cases" className="hover:text-white transition-colors">Entrepreneurs</a></li>
            </ul>
          </div>

          {/* Links Column 3 */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4 font-mono text-xs text-indigo-400">
              Trust & Privacy
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><a href="#privacy" className="hover:text-white transition-colors">Data Ownership</a></li>
              <li><a href="#privacy" className="hover:text-white transition-colors">Zero Ad Tracking</a></li>
              <li><a href="#privacy" className="hover:text-white transition-colors">Security Architecture</a></li>
              <li><a href="/api/docs" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1">API Docs <ArrowUpRight className="w-3.5 h-3.5" /></a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} NEXA Technologies Inc. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <span className="flex items-center space-x-1.5 text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>AES-256 Encrypted Storage</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">Privacy First Platform</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
