import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { spacesApi } from '../services/api';
import { SharedSpace } from '../types';
import {
  Users,
  Plus,
  Compass,
  CheckSquare,
  Shield,
  ArrowRight,
  Share2,
} from 'lucide-react';

export const SharedSpacesPage: React.FC = () => {
  const [spaces, setSpaces] = useState<SharedSpace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const loadSpaces = async () => {
    setIsLoading(true);
    try {
      const data = await spacesApi.getSpaces();
      setSpaces(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSpaces();
  }, []);

  const handleCreateSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await spacesApi.createSpace({ name, description });
      setCreateModalOpen(false);
      setName('');
      setDescription('');
      loadSpaces();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white">Shared Spaces</h1>
          <p className="text-xs text-slate-400">Collaborate with family, friends, travel companions, or teams</p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center space-x-2 shadow-glow-secondary transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Shared Space</span>
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2].map(i => (
            <div key={i} className="h-44 rounded-3xl glass-panel animate-pulse" />
          ))}
        </div>
      ) : spaces.length === 0 ? (
        <div className="py-20 text-center glass-panel rounded-3xl border border-white/5 space-y-4">
          <Users className="w-12 h-12 text-purple-400/50 mx-auto" />
          <h3 className="text-base font-semibold text-white">No shared spaces yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Create a space to coordinate group trips, family groceries, or shared budgets.
          </p>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
          >
            Create Space
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {spaces.map(space => (
            <Link
              key={space.id}
              to={`/app/spaces/${space.id}`}
              className="glass-panel p-6 rounded-3xl border border-white/5 hover:border-purple-500/30 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                    {space.userRole || 'MEMBER'}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {space.memberCount || 1} members
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-white group-hover:text-purple-300 transition-colors">
                    {space.name}
                  </h3>
                  {space.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {space.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center space-x-1">
                    <Compass className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{space.plansCount || 0} plans</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{space.tasksCount || 0} tasks</span>
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#0C0F1D] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Create Shared Space</h3>

            <form onSubmit={handleCreateSpace} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Space Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Red Sea Travel Crew, Hassan Family Space"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="What is this space for?"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-glow-secondary"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
