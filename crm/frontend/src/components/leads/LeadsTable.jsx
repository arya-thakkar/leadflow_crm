import React, { useState } from 'react';
import {
  Search, Plus, ArrowUpDown, ArrowUp, ArrowDown,
  Pencil, Trash2, Download, Upload, LayoutGrid, Trello,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useSheet } from '../../context/SheetContext';
import { StatusBadge, STATUSES, formatDate, initials } from '../../utils/status';
import { useLeads } from '../../hooks/useLeads';
import LeadPanel from './LeadPanel';
import ImportDropzone from './ImportDropzone';
import KanbanBoard from '../kanban/KanbanBoard';
import { getExportUrl } from '../../utils/api';

const AVATAR_COLORS = [
  'bg-sky-900/60 text-sky-300 border border-sky-800/20',
  'bg-violet-900/60 text-violet-300 border border-violet-800/20',
  'bg-emerald-900/60 text-emerald-300 border border-emerald-800/20',
  'bg-amber-900/60 text-amber-300 border border-amber-800/20',
  'bg-rose-900/60 text-rose-300 border border-rose-800/20',
];
const avatarColor = (name = '') => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const SkeletonRow = () => (
  <tr className="border-b border-zinc-900">
    {[32, 140, 160, 120, 100, 80, 80, 60].map((w, i) => (
      <td key={i} className="px-4 py-3">
        <div className="skeleton h-3 rounded bg-zinc-900" style={{ width: w }} />
      </td>
    ))}
  </tr>
);

export default function LeadsTable() {
  const { activeSheet, updateSheetCount } = useSheet();
  const [view, setView] = useState('table');
  const [panelOpen, setPanelOpen] = useState(false);
  const [editLead, setEditLead] = useState(null);
  const [importOpen, setImportOpen] = useState(false);

  const {
    leads, pagination, loading,
    page, setPage,
    handleSearch,
    statusFilter, setStatusFilter,
    sort, toggleSort,
    saveLead, removeLead, bulkImport,
  } = useLeads(activeSheet, updateSheetCount);

  const SortIcon = ({ field }) => {
    if (sort.field !== field) return <ArrowUpDown size={11} className="text-zinc-750" />;
    return sort.order === 'desc'
      ? <ArrowDown size={11} className="text-indigo-400" />
      : <ArrowUp size={11} className="text-indigo-400" />;
  };

  const handleSave = async (formData, id) => {
    await saveLead(formData, id);
  };

  const handleExport = () => {
    const token = localStorage.getItem('lf_token');
    const url = getExportUrl(activeSheet._id);
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${activeSheet.sheetName}_leads.csv`;
        a.click();
      });
  };

  const COLS = [
    { key: 'name',      label: 'Name',    sortable: true  },
    { key: 'email',     label: 'Email',   sortable: false },
    { key: 'company',   label: 'Company', sortable: true  },
    { key: 'phone',     label: 'Phone',   sortable: false },
    { key: 'status',    label: 'Status',  sortable: true  },
    { key: 'createdAt', label: 'Created', sortable: true  },
  ];

  if (!activeSheet) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-500 text-sm">No workspace selected</p>
          <p className="text-zinc-700 text-xs mt-1">Create a workspace from the sidebar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 border-b border-zinc-800/60 shrink-0">
        <div className="flex flex-1 flex-wrap items-center gap-3 w-full">
          <div className="relative w-full sm:max-w-xs">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-650" />
            <input
              type="text"
              placeholder="Search name, email, company…"
              onChange={(e) => handleSearch(e.target.value)}
              className="input-base pl-8 text-xs py-1.5"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-base w-full sm:w-auto text-xs py-1.5"
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>

          <div className="flex border border-zinc-800 rounded-lg overflow-hidden shrink-0">
            {[
              { id: 'table',  Icon: LayoutGrid },
              { id: 'kanban', Icon: Trello },
            ].map(({ id, Icon }, i) => (
              <button
                key={id}
                onClick={() => setView(id)}
                className={`px-3 py-1.5 transition-colors ${i ? 'border-l border-zinc-800' : ''} ${
                  view === id ? 'bg-zinc-900 text-zinc-100' : 'text-zinc-600 hover:text-zinc-400'
                }`}
              >
                <Icon size={13} />
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button onClick={handleExport} className="btn-ghost py-1.5 text-xs border border-zinc-850" title="Export CSV"><Download size={13} /></button>
          <button onClick={() => setImportOpen(true)} className="btn-ghost py-1.5 text-xs border border-zinc-850" title="Import CSV"><Upload size={13} /></button>
          <button
            onClick={() => { setEditLead(null); setPanelOpen(true); }}
            className="btn-primary py-1.5 text-xs whitespace-nowrap"
          >
            <Plus size={13} /> Add lead
          </button>
        </div>
      </div>

      {view === 'kanban' ? (
        <KanbanBoard
          sheetId={activeSheet._id}
          onCountChange={updateSheetCount}
          onEditLead={(lead) => { setEditLead(lead); setPanelOpen(true); }}
        />
      ) : (
        <>
          <div className="flex-1 overflow-auto">
            <table className="w-full min-w-[740px]">
              <thead className="sticky top-0 z-10">
                <tr className="bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80">
                  <th className="px-4 py-3.5 w-12" />
                  {COLS.map(({ key, label, sortable }) => (
                    <th
                      key={key}
                      onClick={sortable ? () => toggleSort(key) : undefined}
                      className={`px-4 py-3.5 text-left text-[11px] font-medium text-zinc-600 uppercase tracking-wider
                        ${sortable ? 'cursor-pointer hover:text-zinc-300 transition-colors' : ''}`}
                    >
                      <span className="flex items-center gap-1">
                        {label}
                        {sortable && <SortIcon field={key} />}
                      </span>
                    </th>
                  ))}
                  <th className="px-4 py-3.5 w-20" />
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                  : leads.length === 0
                  ? (
                    <tr>
                      <td colSpan={8} className="py-20 text-center">
                        <p className="text-zinc-650 text-sm">No leads found</p>
                        <p className="text-zinc-800 text-xs mt-1">
                          {statusFilter ? 'Try a different status filter' : 'Add your first lead'}
                        </p>
                      </td>
                    </tr>
                  )
                  : leads.map((lead) => (
                    <tr
                      key={lead._id}
                      className="group border-b border-zinc-850 hover:bg-zinc-900/20 transition-colors"
                    >
                      <td className="px-4 py-2.5">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0 ${avatarColor(lead.name)}`}>
                          {initials(lead.name)}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-zinc-200 font-medium max-w-[140px] truncate">{lead.name}</td>
                      <td className="px-4 py-2.5 text-xs text-zinc-500 max-w-[160px] truncate">{lead.email}</td>
                      <td className="px-4 py-2.5 text-xs text-zinc-400 max-w-[120px] truncate">{lead.company}</td>
                      <td className="px-4 py-2.5 text-xs text-zinc-600">{lead.phone}</td>
                      <td className="px-4 py-2.5"><StatusBadge status={lead.status} /></td>
                      <td className="px-4 py-2.5 text-xs text-zinc-700">{formatDate(lead.createdAt)}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => { setEditLead(lead); setPanelOpen(true); }}
                            className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
                            title="Edit"
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={() => removeLead(lead)}
                            className="p-1.5 rounded-md hover:bg-red-950/60 text-zinc-500 hover:text-red-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-5 py-3.5 border-t border-zinc-800/60 shrink-0">
            <span className="text-xs text-zinc-650 font-medium">
              {pagination.total === 0
                ? '0 results'
                : `${(page - 1) * 10 + 1}–${Math.min(page * 10, pagination.total)} of ${pagination.total}`}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-md hover:bg-zinc-900 text-zinc-550 hover:text-zinc-300 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={13} />
              </button>

              {(() => {
                const total = pagination.pages || 1;
                const maxBtn = Math.min(5, total);
                const start = total <= 5 ? 1
                  : page <= 3 ? 1
                  : page >= total - 2 ? total - 4
                  : page - 2;
                return Array.from({ length: maxBtn }, (_, i) => start + i).map((pg) => (
                  <button
                    key={pg}
                    onClick={() => setPage(pg)}
                    className={`w-6.5 h-6.5 rounded-md text-xs font-medium transition-colors ${
                      pg === page
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                        : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'
                    }`}
                  >
                    {pg}
                  </button>
                ));
              })()}

              <button
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={page >= pagination.pages}
                className="p-1.5 rounded-md hover:bg-zinc-900 text-zinc-550 hover:text-zinc-300 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </>
      )}

      <LeadPanel
        open={panelOpen}
        lead={editLead}
        onClose={() => { setPanelOpen(false); setEditLead(null); }}
        onSave={handleSave}
      />

      {importOpen && (
        <ImportDropzone
          onImport={bulkImport}
          onClose={() => setImportOpen(false)}
        />
      )}
    </div>
  );
}
