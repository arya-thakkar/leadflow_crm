import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Layers, LayoutGrid, BarChart3, Plus, ChevronDown,
  LogOut, Trash2, Database, X, Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSheet } from '../../context/SheetContext';
import toast from 'react-hot-toast';

const initials = (name = '') => name.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase()).join('');

export default function Sidebar({ onClose }) {
  const { user, logoutUser } = useAuth();
  const { sheets, activeSheet, switchSheet, createSheet, deleteSheet, loadingSheets } = useSheet();
  const [wsOpen, setWsOpen] = useState(false);
  const [newSheetName, setNewSheetName] = useState('');
  const [creating, setCreating] = useState(false);
  const [showNewInput, setShowNewInput] = useState(false);
  const navigate = useNavigate();

  const handleCreate = async () => {
    if (!newSheetName.trim()) return;
    setCreating(true);
    try {
      await createSheet(newSheetName.trim());
      setNewSheetName('');
      setShowNewInput(false);
      toast.success('Workspace created');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create workspace');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this workspace and all its leads?')) return;
    try {
      await deleteSheet(id);
      toast.success('Workspace deleted');
    } catch {
      toast.error('Failed to delete workspace');
    }
  };

  const handleSheetSwitch = (sheet) => {
    switchSheet(sheet);
    setWsOpen(false);
    navigate('/');
    if (onClose) onClose();
  };

  const navItems = [
    { to: '/', icon: LayoutGrid, label: 'Leads', end: true },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  return (
    <aside className="w-56 shrink-0 h-screen bg-zinc-950 border-r border-zinc-800/80 flex flex-col">
      <div className="px-4 py-4 border-b border-zinc-800/60">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-600 rounded-md flex items-center justify-center shrink-0">
            <Layers size={14} className="text-white" />
          </div>
          <span className="text-zinc-100 font-semibold text-sm tracking-tight">LeadFlow</span>
        </div>
      </div>

      <div className="px-3 py-3 border-b border-zinc-800/60">
        <button
          onClick={() => setWsOpen(!wsOpen)}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-zinc-905 transition-colors group"
        >
          <div className="w-5 h-5 bg-zinc-850 rounded flex items-center justify-center shrink-0">
            <Database size={10} className="text-zinc-400" />
          </div>
          <span className="text-zinc-300 text-xs flex-1 truncate text-left font-medium">
            {loadingSheets ? '…' : activeSheet?.sheetName || 'No workspace'}
          </span>
          <ChevronDown
            size={12}
            className={`text-zinc-500 transition-transform ${wsOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {wsOpen && (
          <div className="mt-1 bg-zinc-900 border border-zinc-800 rounded-md overflow-hidden animate-fade-in">
            <div className="max-h-48 overflow-y-auto">
              {sheets.map((sheet) => (
                <div
                  key={sheet._id}
                  onClick={() => handleSheetSwitch(sheet)}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-zinc-850 cursor-pointer group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-zinc-300 truncate">{sheet.sheetName}</div>
                    <div className="text-[10px] text-zinc-555">{sheet.leadCount || 0} leads</div>
                  </div>
                  {activeSheet?._id === sheet._id && (
                    <Check size={11} className="text-indigo-400 shrink-0" />
                  )}
                  <button
                    onClick={(e) => handleDelete(e, sheet._id)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-400 text-zinc-500 transition-all"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}
              {sheets.length === 0 && (
                <div className="px-3 py-4 text-xs text-zinc-555 text-center">No workspaces yet</div>
              )}
            </div>

            <div className="border-t border-zinc-800 p-2">
              {showNewInput ? (
                <div className="flex items-center gap-1">
                  <input
                    autoFocus
                    value={newSheetName}
                    onChange={(e) => setNewSheetName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setShowNewInput(false); }}
                    placeholder="Workspace name…"
                    className="flex-1 bg-zinc-850 border border-zinc-750 rounded px-2 py-1 text-xs text-zinc-100 outline-none focus:border-zinc-650"
                  />
                  <button onClick={handleCreate} disabled={creating} className="p-1 text-indigo-400 hover:text-indigo-300">
                    <Check size={13} />
                  </button>
                  <button onClick={() => setShowNewInput(false)} className="p-1 text-zinc-555 hover:text-zinc-400">
                    <X size={13} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowNewInput(true)}
                  className="w-full flex items-center gap-1.5 px-2 py-1 text-xs text-zinc-400 hover:text-zinc-200 rounded hover:bg-zinc-850 transition-colors"
                >
                  <Plus size={12} />
                  New workspace
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => { if (onClose) onClose(); }}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                isActive
                  ? 'bg-zinc-900 text-zinc-100 font-medium border border-zinc-800'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/60'
              }`
            }
          >
            <Icon size={14} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-3 border-t border-zinc-800/60">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-zinc-800 rounded-full flex items-center justify-center text-[10px] font-medium text-zinc-300 shrink-0">
            {initials(user?.name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-zinc-300 truncate font-medium">{user?.name}</div>
            <div className="text-[10px] text-zinc-550 truncate">{user?.email}</div>
          </div>
          <button
            onClick={logoutUser}
            className="p-1 text-zinc-500 hover:text-zinc-400 transition-colors"
            title="Sign out"
          >
            <LogOut size={13} />
          </button>
        </div>
      </div>
    </aside>
  );
}
