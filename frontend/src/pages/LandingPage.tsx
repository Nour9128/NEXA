import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { NexaCoreCanvas } from '../components/3d/NexaCoreCanvas';
import { CoreState } from '../components/3d/NexaCore';
import {
  Sparkles,
  ArrowRight,
  Brain,
  Layers,
  Calendar,
  CheckCircle2,
  DollarSign,
  Users,
  Compass,
  FileText,
  ShieldCheck,
  Zap,
  Globe,
  Sliders,
  Smartphone,
  Lock,
  EyeOff,
  UserCheck,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [coreState, setCoreState] = useState<CoreState>('idle');
  const [previewPromptIndex, setPreviewPromptIndex] = useState(0);

  const previewPrompts = [
    {
      prompt: "Help me prepare for my exams in the next three weeks.",
      category: "STUDY",
      title: "3-Week Exam Mastery Roadmap",
      tasks: [
        { title: "Diagnostic breakdown of syllabus weights", priority: "HIGH", days: "Days 1-3" },
        { title: "Active recall & 25-min Pomodoro cycles", priority: "URGENT", days: "Days 4-14" },
        { title: "Timed mock test simulation", priority: "HIGH", days: "Days 15-21" }
      ],
      budget: "$50 • Study materials & textbooks"
    },
    {
      prompt: "Organize a weekend trip for four people with a limited budget.",
      category: "TRAVEL",
      title: "Sinai & Dahab Coastal Expedition",
      tasks: [
        { title: "Reserve beachfront camp accommodation", priority: "URGENT", days: "Thursday" },
        { title: "Book Blue Hole snorkeling guide & 4x4", priority: "MEDIUM", days: "Friday" },
        { title: "Sunrise Mount Sinai hike & packing checklist", priority: "HIGH", days: "Saturday" }
      ],
      budget: "$400 total • $100 per traveler"
    },
    {
      prompt: "Make a weekly grocery list for my family.",
      category: "PERSONAL",
      title: "Family Nutrition & Weekly Kitchen Restock",
      tasks: [
        { title: "Farmer's market vegetables & seasonal fruits", priority: "MEDIUM", days: "Saturday" },
        { title: "Cold-pressed olive oil & whole grains", priority: "LOW", days: "Sunday" },
        { title: "Prep batch dinners & freezer storage", priority: "MEDIUM", days: "Monday" }
      ],
      budget: "$75 • Local Organic Produce"
    }
  ];

  const activePreview = previewPrompts[previewPromptIndex];

  return (
    <div className="min-h-screen bg-[#07080E] text-slate-100 overflow-x-hidden">
      <Navbar />

      {/* Atmospheric Glowing Background Orbs */}
      <div className="glow-orb-primary w-[550px] h-[550px] top-[-100px] left-[-150px]" />
      <div className="glow-orb-purple w-[600px] h-[600px] top-[300px] right-[-200px]" />
      <div className="glow-orb-cyan w-[500px] h-[500px] top-[1400px] left-[-200px]" />

      {/* ========================================================= */}
      {/* 1. HERO SECTION */}
      {/* ========================================================= */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-36 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Content (7 Cols) */}
          <div className="lg:col-span-7 space-y-6 text-left relative z-20">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Next-Generation AI Life Copilot</span>
            </div>

            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.1]">
              Your life is full of things to do.{' '}
              <span className="gradient-text-accent">NEXA connects the dots.</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-300 max-w-xl font-normal leading-relaxed">
              Turn scattered ideas, messages, screenshots, and plans into meaningful actions—with one intelligent space designed around your life.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Link
                to="/register"
                className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-semibold text-base shadow-glow-primary transition-all flex items-center justify-center space-x-2.5 transform hover:-translate-y-0.5"
              >
                <span>Start for Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="#how-it-works"
                className="px-7 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-semibold text-base transition-colors flex items-center justify-center"
              >
                Explore NEXA
              </a>
            </div>

            <div className="flex items-center space-x-6 pt-4 text-xs text-slate-400">
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Zero configuration</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Private & encrypted</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Multi-platform capture</span>
              </div>
            </div>
          </div>

          {/* Right Hero: Interactive 3D NEXA Core + 5 Floating Context Cards (5 Cols) */}
          <div className="lg:col-span-5 relative flex items-center justify-center min-h-[440px] md:min-h-[500px]">
            {/* 3D NEXA Core Canvas */}
            <div className="w-full h-[440px] md:h-[500px]">
              <NexaCoreCanvas state={coreState} size="lg" />
            </div>

            {/* Floating Card 1: Study Schedule */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="hidden sm:flex absolute -top-4 -left-6 px-3.5 py-2.5 rounded-xl glass-panel border border-indigo-500/25 shadow-glass items-center space-x-3 pointer-events-none"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <div>
                <p className="text-xs font-semibold text-white">Study Schedule</p>
                <p className="text-[10px] text-slate-400">Engineering Finals • 3 Weeks Left</p>
              </div>
            </motion.div>

            {/* Floating Card 2: Shopping List */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="hidden sm:flex absolute top-20 -right-6 px-3.5 py-2.5 rounded-xl glass-panel border border-cyan-500/25 shadow-glass items-center space-x-3 pointer-events-none"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <div>
                <p className="text-xs font-semibold text-white">Shopping List</p>
                <p className="text-[10px] text-slate-400">Weekly Groceries • 4 items ready</p>
              </div>
            </motion.div>

            {/* Floating Card 3: Weekend Trip */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
              className="hidden sm:flex absolute bottom-28 -left-8 px-3.5 py-2.5 rounded-xl glass-panel border border-purple-500/25 shadow-glass items-center space-x-3 pointer-events-none"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-fuchsia-400" />
              <div>
                <p className="text-xs font-semibold text-white">Weekend Trip</p>
                <p className="text-[10px] text-slate-400">Sinai & Dahab • 4 Travelers</p>
              </div>
            </motion.div>

            {/* Floating Card 4: Shared Budget */}
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
              className="hidden sm:flex absolute bottom-8 -right-4 px-3.5 py-2.5 rounded-xl glass-panel border border-amber-500/25 shadow-glass items-center space-x-3 pointer-events-none"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <div>
                <p className="text-xs font-semibold text-white">Shared Budget</p>
                <p className="text-[10px] text-slate-400">$240 Logged • Split 4 ways</p>
              </div>
            </motion.div>

            {/* Floating Card 5: Upcoming Appointment */}
            <motion.div
              animate={{ y: [0, -7, 0] }}
              transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut', delay: 2.5 }}
              className="hidden sm:flex absolute -bottom-6 left-12 px-3.5 py-2.5 rounded-xl glass-panel border border-indigo-400/25 shadow-glass items-center space-x-3 pointer-events-none"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-sky-400" />
              <div>
                <p className="text-xs font-semibold text-white">Upcoming Appointment</p>
                <p className="text-[10px] text-slate-400">Dr. Tamer • Thursday 10:00 AM</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. THE PROBLEM */}
      {/* ========================================================= */}
      <section className="py-20 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-mono uppercase tracking-widest text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
            The Problem
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white">
            Everyday life is scattered across a dozen apps.
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            Important details get lost in WhatsApp chats, buried in gallery screenshots, forgotten in apple notes, or disconnected from calendar alerts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold">
              01
            </div>
            <h3 className="text-lg font-semibold text-white">Fragmented Context</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Flight tickets in email, hotel ideas in WhatsApp, itineraries in notes, and split bills in spreadsheets. Nothing talks to each other.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
              02
            </div>
            <h3 className="text-lg font-semibold text-white">Passive Intentions</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Taking a screenshot or writing a vague note rarely turns into execution. Without structured steps, good intentions stall.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
              03
            </div>
            <h3 className="text-lg font-semibold text-white">Collaboration Friction</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Planning group trips, shared budgets, or family routines requires constant back-and-forth messaging without a single source of truth.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. THE SOLUTION */}
      {/* ========================================================= */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
            The Solution
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white">
            One intelligent space to turn thoughts into organized actions.
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            NEXA combines natural language AI, multi-modal capture, task structuring, and collaborative spaces into an elegant operating system for your life.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4 hover:border-indigo-500/40 transition-colors">
            <div className="p-3 w-fit rounded-xl bg-indigo-500/10 text-indigo-400">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white">AI Life Copilot</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Type or speak any intent in plain English or Arabic. NEXA generates comprehensive milestones, deadlines, and checklists automatically.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4 hover:border-cyan-500/40 transition-colors">
            <div className="p-3 w-fit rounded-xl bg-cyan-500/10 text-cyan-400">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white">Multi-Modal Capture</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload screenshots, paste links, record voice thoughts, or type quick notes. The vision AI extracts dates, items, and costs cleanly.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4 hover:border-purple-500/40 transition-colors">
            <div className="p-3 w-fit rounded-xl bg-purple-500/10 text-purple-400">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white">Shared Spaces</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Collaborate seamlessly with family, friends, or travel crews. Shared task assignment, real-time activity logs, and expense splitting.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4 hover:border-emerald-500/40 transition-colors">
            <div className="p-3 w-fit rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white">Integrated Budgets</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every plan connects directly to budget limits and expense tracking. See remaining balances in USD or EGP at a glance.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. HOW IT WORKS */}
      {/* ========================================================= */}
      <section id="how-it-works" className="py-20 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            The Flow
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white">
            Capture. Understand. Organize. Act.
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            From raw unstructured intention to synchronized execution in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {[
            {
              step: '01',
              title: 'Capture',
              desc: 'Drop in a screenshot, voice note, web link, or unstructured thought anytime from mobile or desktop.',
              color: 'text-indigo-400',
            },
            {
              step: '02',
              title: 'Understand',
              desc: 'NEXA AI parses dates, locations, requirements, and budget constraints into structured components.',
              color: 'text-cyan-400',
            },
            {
              step: '03',
              title: 'Organize',
              desc: 'Review the generated plan, edit subtasks, assign priorities, and link shared collaborators.',
              color: 'text-purple-400',
            },
            {
              step: '04',
              title: 'Act',
              desc: 'Execute with calendar deadlines, recurring checklists, automated reminders, and progress tracking.',
              color: 'text-emerald-400',
            },
          ].map((item, idx) => (
            <div key={idx} className="glass-panel p-6 rounded-2xl border border-white/5 space-y-3 relative">
              <span className={`text-2xl font-bold font-mono ${item.color}`}>{item.step}</span>
              <h3 className="text-lg font-semibold text-white">{item.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. INTERACTIVE PRODUCT PREVIEW */}
      {/* ========================================================= */}
      <section id="preview" className="py-20 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
            Interactive Demo
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white">
            See the AI transform messy requests into structured reality.
          </h2>
          <p className="text-slate-400 text-base">
            Select a sample prompt below to observe how NEXA analyzes and organizes it in real time.
          </p>
        </div>

        {/* Prompt Selector Chips */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          {previewPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setPreviewPromptIndex(idx);
                setCoreState('processing');
                setTimeout(() => setCoreState('completed'), 900);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                previewPromptIndex === idx
                  ? 'bg-indigo-600 text-white shadow-glow-primary border border-indigo-400/40'
                  : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-white/10'
              }`}
            >
              "{p.prompt}"
            </button>
          ))}
        </div>

        {/* Preview Transformation Card */}
        <div className="max-w-4xl mx-auto glass-panel p-6 sm:p-8 rounded-3xl border border-indigo-500/30 shadow-2xl space-y-6">
          {/* User Input Prompt Display */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-white/10 flex items-start space-x-3">
            <div className="w-7 h-7 rounded-full bg-indigo-600/30 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Unstructured Input</span>
              <p className="text-sm font-medium text-slate-200 mt-0.5">"{activePreview.prompt}"</p>
            </div>
          </div>

          {/* AI Structured Plan Output */}
          <div className="p-6 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4">
              <div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                  {activePreview.category}
                </span>
                <h4 className="text-xl font-bold text-white mt-1.5">{activePreview.title}</h4>
              </div>
              <div className="text-xs text-emerald-400 font-medium bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-800/40">
                {activePreview.budget}
              </div>
            </div>

            {/* Generated Task Breakdown */}
            <div className="space-y-2.5 pt-1">
              <span className="text-xs font-medium text-slate-400">Synthesized Action Steps:</span>
              {activePreview.tasks.map((task, tidx) => (
                <div
                  key={tidx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5"
                >
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm text-slate-200">{task.title}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] text-slate-400 font-mono">{task.days}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                        task.priority === 'URGENT'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-indigo-500/20 text-indigo-300'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <Link
                to="/register"
                className="text-xs font-semibold text-cyan-300 hover:text-cyan-200 flex items-center space-x-1"
              >
                <span>Save and try this live in your account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. USE CASES */}
      {/* ========================================================= */}
      <section id="use-cases" className="py-20 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-mono uppercase tracking-widest text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
            Tailored Experiences
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white">
            Designed for how real people live.
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            Whether preparing for high-stakes university exams or coordinating a group adventure in Dahab.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {[
            {
              title: "Students",
              badge: "ACADEMICS",
              desc: "Break down intimidating exam blueprints, map out daily study blocks, and track past papers.",
              icon: "🎓"
            },
            {
              title: "Professionals",
              badge: "CAREER",
              desc: "Convert meeting action points and project objectives into clear execution roadmaps.",
              icon: "💼"
            },
            {
              title: "Families",
              badge: "HOME",
              desc: "Shared household restock lists, appointment alerts, and coordinated family budgets.",
              icon: "🏡"
            },
            {
              title: "Travelers",
              badge: "EXPLORE",
              desc: "Full Sinai & Red Sea itineraries, flight confirmations, packing lists, and split costs.",
              icon: "✈️"
            },
            {
              title: "Friend Groups",
              badge: "SOCIAL",
              desc: "Collaborative party planning, birthday events, and shared expense tracking.",
              icon: "🎉"
            }
          ].map((useCase, idx) => (
            <div key={idx} className="glass-panel p-5 rounded-2xl border border-white/5 space-y-3 flex flex-col justify-between hover:border-indigo-500/30 transition-all">
              <div className="space-y-2">
                <span className="text-2xl">{useCase.icon}</span>
                <span className="text-[10px] font-mono tracking-wider text-indigo-400 block uppercase">
                  {useCase.badge}
                </span>
                <h3 className="text-base font-semibold text-white">{useCase.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{useCase.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 7. PRIVACY AND CONTROL */}
      {/* ========================================================= */}
      <section id="privacy" className="py-20 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="max-w-4xl mx-auto glass-panel p-8 sm:p-12 rounded-3xl border border-emerald-500/20 space-y-8">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h2 className="font-display font-bold text-3xl text-white">Your Life, Your Data, Your Terms.</h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
              We never sell your data, train public AI models on your personal notes, or serve advertising.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 space-y-2">
              <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-xs">
                <Lock className="w-4 h-4" />
                <span>Encrypted at Rest</span>
              </div>
              <p className="text-xs text-slate-400">
                All records, tasks, and budgets are protected with industry-standard cryptographic encryption.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 space-y-2">
              <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-xs">
                <Sliders className="w-4 h-4" />
                <span>Explicit Granular Sharing</span>
              </div>
              <p className="text-xs text-slate-400">
                Collaborative spaces require explicit invite tokens. Private plans remain strictly confidential.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 space-y-2">
              <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-xs">
                <UserCheck className="w-4 h-4" />
                <span>One-Click Export & Deletion</span>
              </div>
              <p className="text-xs text-slate-400">
                Export your entire life archive to JSON or purge your account and database records permanently.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 8. CALL TO ACTION */}
      {/* ========================================================= */}
      <section className="py-24 px-6 max-w-7xl mx-auto text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto space-y-6 relative z-10">
          <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
            Ready to connect the dots of your life?
          </h2>
          <p className="text-slate-300 text-base md:text-lg max-w-xl mx-auto">
            Join users turning ideas, screenshots, and scattered notes into effortless momentum with NEXA.
          </p>
          <div className="pt-2">
            <Link
              to="/register"
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-semibold text-base shadow-glow-primary transition-all inline-flex items-center space-x-2.5 transform hover:-translate-y-0.5"
            >
              <span>Get Started with NEXA</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
