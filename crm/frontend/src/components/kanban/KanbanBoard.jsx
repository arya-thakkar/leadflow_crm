import React, { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Pencil, Trash2, GripVertical, Building2, Mail } from 'lucide-react';
import { getKanbanLeads, updateLead, deleteLead } from '../../utils/api';
import { STATUSES, STATUS_CONFIG, formatDate } from '../../utils/status';
import toast from 'react-hot-toast';

const AVATAR_COLORS = [
  'bg-sky-900/60 text-sky-300 border border-sky-800/20',
  'bg-violet-900/60 text-violet-300 border border-violet-800/20',
  'bg-emerald-900/60 text-emerald-300 border border-emerald-800/20',
  'bg-amber-900/60 text-amber-300 border border-amber-800/20',
  'bg-rose-900/60 text-rose-300 border border-rose-800/20',
];
const avatarColor = (name = '') => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
const initials = (name = '') => name.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase()).join('');

const SkeletonCard = () => (
  <div className="card p-3 space-y-2">
    <div className="skeleton h-3 w-3/4 rounded" />
    <div className="skeleton h-2.5 w-1/2 rounded" />
    <div className="skeleton h-2 w-full rounded" />
  </div>
);

export default function KanbanBoard({ sheetId, onCountChange, onEditLead }) {
  const [columns, setColumns] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getKanbanLeads(sheetId);
      const cols = {};
      STATUSES.forEach((s) => { cols[s] = []; });
      data.leads.forEach((lead) => {
        if (cols[lead.status]) cols[lead.status].push(lead);
      });
      setColumns(cols);
    } catch {
      toast.error('Failed to load kanban data');
    } finally {
      setLoading(false);
    }
  }, [sheetId]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const srcStatus = source.droppableId;
    const dstStatus = destination.droppableId;
    const srcCards = [...columns[srcStatus]];
    const dstCards = srcStatus === dstStatus ? srcCards : [...columns[dstStatus]];

    const [moved] = srcCards.splice(source.index, 1);
    dstCards.splice(destination.index, 0, { ...moved, status: dstStatus });

    setColumns((prev) => ({
      ...prev,
      [srcStatus]: srcStatus === dstStatus ? dstCards : srcCards,
      [dstStatus]: dstCards,
    }));

    try {
      await updateLead(draggableId, { status: dstStatus });
    } catch {
      toast.error('Failed to update status');
      fetchLeads();
    }
  };

  const handleDelete = async (lead) => {
    if (!window.confirm(`Delete "${lead.name}"?`)) return;
    try {
      await deleteLead(lead._id);
      setColumns((prev) => ({
        ...prev,
        [lead.status]: prev[lead.status].filter((l) => l._id !== lead._id),
      }));
      onCountChange?.(sheetId, -1);
      toast.success('Lead deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-3.5 p-4 h-full" style={{ minWidth: `${STATUSES.length * 240}px` }}>
          {STATUSES.map((status) => {
            const config = STATUS_CONFIG[status];
            const cards = columns[status] || [];

            return (
              <div key={status} className="flex flex-col w-56 shrink-0">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <span className={`w-2 h-2 rounded-full ${config.dot}`} />
                  <span className="text-xs font-semibold text-zinc-400">{status}</span>
                  <span className="ml-auto text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-550 px-2 py-0.5 rounded-full font-medium">
                    {loading ? '…' : cards.length}
                  </span>
                </div>

                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 rounded-xl p-2.5 space-y-2.5 transition-colors min-h-[200px] border ${
                        snapshot.isDraggingOver
                          ? 'bg-zinc-900/60 border-indigo-500/20'
                          : 'bg-zinc-900/20 border-zinc-900/50'
                      }`}
                    >
                      {loading ? (
                        Array.from({ length: 2 }).map((_, i) => <SkeletonCard key={i} />)
                      ) : (
                        cards.map((lead, index) => (
                          <Draggable key={lead._id} draggableId={lead._id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`card p-3.5 cursor-pointer transition-all group hover:border-zinc-800 ${
                                  snapshot.isDragging ? 'shadow-2xl ring-1 ring-indigo-500/30 opacity-90 scale-[1.01]' : ''
                                }`}
                              >
                                <div className="flex items-start gap-2">
                                  <div {...provided.dragHandleProps} className="mt-0.5 text-zinc-750 hover:text-zinc-500">
                                    <GripVertical size={12} />
                                  </div>
                                  <div className={`w-6.5 h-6.5 rounded-full flex items-center justify-center text-[9px] font-semibold shrink-0 ${avatarColor(lead.name)}`}>
                                    {initials(lead.name)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-xs font-semibold text-zinc-200 truncate">{lead.name}</div>
                                  </div>
                                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => onEditLead(lead)}
                                      className="p-1 rounded-md hover:bg-zinc-800 text-zinc-550 hover:text-zinc-300"
                                    >
                                      <Pencil size={10} />
                                    </button>
                                    <button
                                      onClick={() => handleDelete(lead)}
                                      className="p-1 rounded-md hover:bg-red-950/60 text-zinc-550 hover:text-red-400"
                                    >
                                      <Trash2 size={10} />
                                    </button>
                                  </div>
                                </div>

                                <div className="mt-2.5 ml-4 space-y-1">
                                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                                    <Building2 size={9.5} />
                                    <span className="truncate">{lead.company}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-600">
                                    <Mail size={9.5} />
                                    <span className="truncate">{lead.email}</span>
                                  </div>
                                </div>

                                {lead.notes && (
                                  <p className="mt-2 ml-4 text-[10px] text-zinc-550 line-clamp-2 bg-zinc-900/30 p-1.5 border border-zinc-850 rounded-md">{lead.notes}</p>
                                )}

                                <div className="mt-2.5 ml-4 text-[9px] text-zinc-700 font-medium">
                                  {formatDate(lead.createdAt)}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </div>
    </DragDropContext>
  );
}
