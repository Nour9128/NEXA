import React, { useState, useEffect } from 'react';
import { savedItemsApi, aiApi } from '../services/api';
import { SavedItem, SavedItemType } from '../types';
import {
  Bookmark,
  FileText,
  Link as LinkIcon,
  Image as ImageIcon,
  Mic,
  Sparkles,
  Star,
  Search,
  ExternalLink,
  Trash2,
  Tag,
  Filter,
} from 'lucide-react';

export const SavedItemsPage: React.FC = () => {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [activeType, setActiveType] = useState<string>('ALL');
  const [onlyFavorites, setOnlyFavorites] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadItems = async () => {
    setIsLoading(true);
    try {
      const data = await savedItemsApi.getSavedItems({
        type: activeType !== 'ALL' ? activeType : undefined,
        isFavorite: onlyFavorites ? true : undefined,
        search: search.trim() || undefined,
      });
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [activeType, onlyFavorites, search]);

  const handleToggleFavorite = async (item: SavedItem) => {
    try {
      await savedItemsApi.updateSavedItem(item.id, { isFavorite: !item.isFavorite });
      setItems(prev =>
        prev.map(i => (i.id === item.id ? { ...i, isFavorite: !i.isFavorite } : i))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await savedItemsApi.deleteSavedItem(id);
      setItems(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const getTypeIcon = (type: SavedItemType) => {
    switch (type) {
      case 'LINK':
        return <LinkIcon className="w-4 h-4 text-cyan-400" />;
      case 'SCREENSHOT':
        return <ImageIcon className="w-4 h-4 text-purple-400" />;
      case 'VOICE':
        return <Mic className="w-4 h-4 text-emerald-400" />;
      case 'AI_RESULT':
        return <Sparkles className="w-4 h-4 text-indigo-400" />;
      case 'NOTE':
      default:
        return <FileText className="w-4 h-4 text-slate-300" />;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white">Saved Captures & Library</h1>
          <p className="text-xs text-slate-400">All captured thoughts, links, screenshots, and speech notes</p>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Type selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'ALL', label: 'All Items' },
            { id: 'NOTE', label: 'Notes' },
            { id: 'LINK', label: 'Links' },
            { id: 'SCREENSHOT', label: 'Screenshots' },
            { id: 'VOICE', label: 'Voice Notes' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveType(tab.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                activeType === tab.id
                  ? 'bg-indigo-600 text-white shadow-glow-primary'
                  : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}

          <button
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center space-x-1.5 transition-all ${
              onlyFavorites
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-900/60 text-slate-400 hover:text-white'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-amber-400' : ''}`} />
            <span>Favorites</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search notes & content..."
            className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Grid of Saved Items */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-44 rounded-3xl glass-panel animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="py-20 text-center glass-panel rounded-3xl border border-white/5 space-y-3">
          <Bookmark className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-xs text-slate-400">No captured items found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map(item => (
            <div
              key={item.id}
              className="glass-panel p-5 rounded-3xl border border-white/5 hover:border-white/20 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 rounded-lg bg-white/5">{getTypeIcon(item.type)}</div>
                    <span className="text-[10px] font-mono uppercase text-slate-400">{item.type}</span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleToggleFavorite(item)}
                      className={`p-1 transition-colors ${
                        item.isFavorite ? 'text-amber-400' : 'text-slate-500 hover:text-amber-400'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${item.isFavorite ? 'fill-amber-400' : ''}`} />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                  {item.content && (
                    <p className="text-xs text-slate-300 line-clamp-3 mt-1 leading-relaxed">
                      {item.content}
                    </p>
                  )}
                </div>

                {item.sourceUrl && (
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1 text-xs text-cyan-400 hover:underline truncate max-w-full"
                  >
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{item.sourceUrl}</span>
                  </a>
                )}

                {item.aiSummary && (
                  <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-[11px] text-indigo-200">
                    <span className="font-semibold text-cyan-300 block mb-0.5">AI Summary:</span>
                    {item.aiSummary}
                  </div>
                )}
              </div>

              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/5">
                  {item.tags.map((tag, tidx) => (
                    <span
                      key={tidx}
                      className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-slate-400"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
