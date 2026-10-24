import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  FileText,
  Link as LinkIcon,
  Image as ImageIcon,
  Mic,
  MicOff,
  Sparkles,
  Check,
  AlertCircle,
  Calendar,
  MapPin,
  ListTodo,
  DollarSign,
  ArrowRight,
  UploadCloud,
} from 'lucide-react';
import { aiApi, savedItemsApi, plansApi, uploadApi } from '../../services/api';
import { SavedItemType, PlanCategory } from '../../types';

interface CaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CaptureModal: React.FC<CaptureModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState<'TEXT' | 'LINK' | 'SCREENSHOT' | 'VOICE'>('TEXT');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  // AI Extraction state
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize Speech Recognition if available
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setContent(prev => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    } else {
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

  // Support pasting screenshot from clipboard directly
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            setActiveTab('SCREENSHOT');
            setUploadedFile(file);
            setTitle(file.name ? file.name.replace(/\.[^/.]+$/, '') : 'Pasted Screenshot');
            const reader = new FileReader();
            reader.onload = () => {
              setFilePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const toggleRecording = () => {
    if (!speechSupported) {
      setErrorMessage('Browser speech recognition is not supported in this browser.');
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      setErrorMessage(null);
      try {
        recognitionRef.current?.start();
        setIsRecording(true);
      } catch (err) {
        setIsRecording(false);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage('File size must be under 10MB.');
        return;
      }
      setUploadedFile(file);
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
      const reader = new FileReader();
      reader.onload = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExtractWithAI = async () => {
    setIsExtracting(true);
    setErrorMessage(null);
    try {
      let uploadedUrl: string | undefined = undefined;

      if (uploadedFile) {
        try {
          const uploadRes = await uploadApi.uploadFile(uploadedFile);
          uploadedUrl = uploadRes.fileUrl;
        } catch (e) {
          console.warn('Upload error, will fallback to data URL:', e);
        }
      }

      const rawContent =
        activeTab === 'LINK'
          ? `URL: ${sourceUrl}. Note: ${content}`
          : activeTab === 'SCREENSHOT'
          ? `Image analysis of: ${title || 'screenshot'}. ${content}`
          : content;

      const res = await aiApi.extract({
        rawContent,
        type: activeTab as SavedItemType,
        imageUrl: filePreview || uploadedUrl,
      });

      setExtractedData(res);
      if (!title && res.summary) {
        setTitle(res.summary.slice(0, 45));
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error?.message || 'Could not extract information.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSaveToLibrary = async () => {
    if (!title) {
      setErrorMessage('Please provide a title for this capture.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    try {
      let mediaUrl: string | undefined = undefined;
      if (uploadedFile) {
        const uploadRes = await uploadApi.uploadFile(uploadedFile);
        mediaUrl = uploadRes.fileUrl;
      }

      await savedItemsApi.createSavedItem({
        title,
        content: content || (extractedData ? extractedData.summary : ''),
        type: activeTab as SavedItemType,
        sourceUrl: activeTab === 'LINK' ? sourceUrl : undefined,
        mediaUrl,
        tags: extractedData?.tags || ['QuickCapture'],
        aiSummary: extractedData?.summary,
        isFavorite: false,
      });

      setSaveSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        handleClose();
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error?.message || 'Failed to save item.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConvertToPlan = async () => {
    if (!extractedData) return;
    setIsSaving(true);
    try {
      await plansApi.createPlan({
        title: title || 'Organized Plan from Capture',
        description: extractedData.summary,
        category: extractedData.suggestedCategory || 'PERSONAL',
        targetDate: extractedData.extractedDate,
        tasks: extractedData.tasks?.map((t: any) => ({
          title: t.title,
          priority: t.priority || 'MEDIUM',
          dueDate: t.dueDate,
        })),
        budget: extractedData.budgetEstimate
          ? {
              totalLimit: extractedData.budgetEstimate.amount,
              currency: extractedData.budgetEstimate.currency || 'USD',
              expenses: [
                {
                  title: extractedData.budgetEstimate.details || 'Estimated Allocation',
                  amount: extractedData.budgetEstimate.amount,
                  category: 'General',
                },
              ],
            }
          : undefined,
      });

      setSaveSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        handleClose();
      }, 1000);
    } catch (err: any) {
      setErrorMessage('Failed to convert into plan.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    }
    setTitle('');
    setContent('');
    setSourceUrl('');
    setUploadedFile(null);
    setFilePreview(null);
    setExtractedData(null);
    setSaveSuccess(false);
    setErrorMessage(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-[#0C0F1D] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/40">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Capture Anything</h3>
                <p className="text-xs text-slate-400">Notes, links, screenshots, or voice intentions</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Selector */}
          <div className="flex border-b border-white/10 bg-slate-950/40 px-6 pt-3 gap-2">
            {[
              { id: 'TEXT', label: 'Quick Note', icon: FileText },
              { id: 'LINK', label: 'Save Link', icon: LinkIcon },
              { id: 'SCREENSHOT', label: 'Screenshot / Image', icon: ImageIcon },
              { id: 'VOICE', label: 'Voice Capture', icon: Mic },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setExtractedData(null);
                  }}
                  className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-medium rounded-t-xl transition-all border-b-2 ${
                    isActive
                      ? 'border-indigo-500 text-indigo-300 bg-indigo-500/10'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form Content */}
          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            {errorMessage && (
              <div className="flex items-center space-x-2 p-3 text-xs text-rose-300 bg-rose-950/40 border border-rose-800/50 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Title / Subject</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g., Dahab travel tickets, Exam topics list, Dentist reminder..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Tab: Link input */}
            {activeTab === 'LINK' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Target Web URL</label>
                <input
                  type="url"
                  value={sourceUrl}
                  onChange={e => setSourceUrl(e.target.value)}
                  placeholder="https://example.com/article-or-booking"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}

            {/* Tab: Screenshot file upload */}
            {activeTab === 'SCREENSHOT' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Upload Screenshot or Photo</label>
                <div className="relative border-2 border-dashed border-white/15 hover:border-indigo-500/50 rounded-xl p-4 text-center cursor-pointer transition-colors bg-slate-900/40">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {filePreview ? (
                    <div className="flex flex-col items-center space-y-2">
                      <img src={filePreview} alt="Preview" className="max-h-40 rounded-lg object-contain border border-white/10" />
                      <span className="text-xs text-indigo-400">Click or drag another image to replace</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-4 space-y-2 text-slate-400">
                      <UploadCloud className="w-8 h-8 text-indigo-400" />
                      <span className="text-xs text-slate-300">Drag & drop or click to upload screenshot</span>
                      <span className="text-[11px] text-slate-500">PNG, JPG, WebP up to 10MB</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Voice recorder */}
            {activeTab === 'VOICE' && (
              <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 flex flex-col items-center justify-center space-y-3">
                <button
                  type="button"
                  onClick={toggleRecording}
                  className={`p-4 rounded-full transition-all shadow-lg ${
                    isRecording
                      ? 'bg-rose-500 text-white ring-4 ring-rose-500/30 animate-pulse'
                      : 'bg-indigo-600 text-white hover:bg-indigo-500'
                  }`}
                >
                  {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>
                <div className="text-center">
                  <span className="text-xs font-medium text-slate-200">
                    {isRecording ? 'Listening to your voice... Speak freely' : 'Click to start voice recording'}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Transcribes spoken thoughts into editable text and organized actions
                  </p>
                </div>
              </div>
            )}

            {/* Content / Notes text area */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                {activeTab === 'VOICE'
                  ? 'Transcribed Text (editable)'
                  : activeTab === 'SCREENSHOT'
                  ? 'Additional Notes / Context'
                  : 'Notes & Thoughts'}
              </label>
              <textarea
                rows={4}
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Type or paste any unstructured notes, checklists, dates, or prices..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            {/* AI Extraction Trigger */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleExtractWithAI}
                disabled={isExtracting || (!content && !uploadedFile && !sourceUrl)}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600/30 to-cyan-600/30 hover:from-indigo-600/50 hover:to-cyan-600/50 border border-indigo-500/40 text-indigo-200 text-xs font-semibold flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 text-cyan-400 ${isExtracting ? 'animate-spin' : ''}`} />
                <span>{isExtracting ? 'Analyzing with NEXA AI...' : 'Extract Actions & Info with NEXA AI'}</span>
              </button>
            </div>

            {/* Extracted Structured Review Card */}
            {extractedData && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">
                      Structured Review
                    </span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                    {extractedData.suggestedCategory}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{extractedData.summary}</p>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  {extractedData.extractedDate && (
                    <div className="flex items-center space-x-1.5 text-slate-300">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{extractedData.extractedDate}</span>
                    </div>
                  )}
                  {extractedData.extractedLocation && (
                    <div className="flex items-center space-x-1.5 text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" />
                      <span>{extractedData.extractedLocation}</span>
                    </div>
                  )}
                  {extractedData.budgetEstimate && (
                    <div className="flex items-center space-x-1.5 text-emerald-400">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>
                        ~{extractedData.budgetEstimate.amount} {extractedData.budgetEstimate.currency}
                      </span>
                    </div>
                  )}
                </div>

                {extractedData.tasks && extractedData.tasks.length > 0 && (
                  <div className="space-y-1 pt-1 border-t border-white/5">
                    <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                      <ListTodo className="w-3 h-3 text-indigo-400" /> Extracted Tasks (
                      {extractedData.tasks.length})
                    </span>
                    <ul className="space-y-1">
                      {extractedData.tasks.map((t: any, idx: number) => (
                        <li key={idx} className="text-xs text-slate-200 flex items-center justify-between">
                          <span>• {t.title}</span>
                          <span className="text-[10px] text-slate-400 uppercase">{t.priority}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-slate-900/60">
            <button
              onClick={handleClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleSaveToLibrary}
                disabled={isSaving || !title}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-white/10 transition-colors disabled:opacity-50"
              >
                {saveSuccess ? 'Saved!' : 'Save to Library'}
              </button>

              {extractedData && (
                <button
                  onClick={handleConvertToPlan}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow-primary transition-all flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <span>Convert into Full Plan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
