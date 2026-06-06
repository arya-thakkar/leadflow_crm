export const STATUSES = ['New', 'Contacted', 'Qualified', 'Converted', 'Lost'];

export const STATUS_CONFIG = {
  New: {
    label: 'New',
    badge: 'badge-new',
    color: '#38bdf8',
    kanban: 'border-sky-800/50',
    dot: 'bg-sky-400',
  },
  Contacted: {
    label: 'Contacted',
    badge: 'badge-contacted',
    color: '#fbbf24',
    kanban: 'border-amber-800/50',
    dot: 'bg-amber-400',
  },
  Qualified: {
    label: 'Qualified',
    badge: 'badge-qualified',
    color: '#a78bfa',
    kanban: 'border-violet-800/50',
    dot: 'bg-violet-400',
  },
  Converted: {
    label: 'Converted',
    badge: 'badge-converted',
    color: '#34d399',
    kanban: 'border-emerald-800/50',
    dot: 'bg-emerald-400',
  },
  Lost: {
    label: 'Lost',
    badge: 'badge-lost',
    color: '#71717a',
    kanban: 'border-zinc-700',
    dot: 'bg-zinc-500',
  },
};

export const StatusBadge = ({ status, className = '' }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.New;
  return (
    <span className={`badge ${config.badge} ${className}`}>
      {status}
    </span>
  );
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

export const initials = (name = '') =>
  name.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase()).join('');
