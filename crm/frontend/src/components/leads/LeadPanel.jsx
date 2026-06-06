import React, { useState, useEffect } from 'react';
import { X, Save, User, Mail, Phone, Building2, Tag, FileText } from 'lucide-react';
import { STATUSES, StatusBadge } from '../../utils/status';

const FIELDS = [
  { key: 'name', label: 'Full name', icon: User, type: 'text', placeholder: 'Jane Smith', required: true },
  { key: 'email', label: 'Email address', icon: Mail, type: 'email', placeholder: 'jane@company.com', required: true },
  { key: 'phone', label: 'Phone number', icon: Phone, type: 'tel', placeholder: '+91 98765 43210', required: true },
  { key: 'company', label: 'Company', icon: Building2, type: 'text', placeholder: 'Acme Corp', required: true },
];

const empty = { name: '', email: '', phone: '', company: '', status: 'New', notes: '' };

export default function LeadPanel({ open, lead, onClose, onSave }) {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const isEdit = !!lead;

  useEffect(() => {
    if (open) {
      setForm(lead ? {
        name: lead.name || '',
        email: lead.email || '',
        phone: lead.phone || '',
        company: lead.company || '',
        status: lead.status || 'New',
        notes: lead.notes || '',
      } : empty);
      setErrors({});
    }
  }, [open, lead]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Required';
    if (!form.email.trim()) errs.email = 'Required';
    if (!form.phone.trim()) errs.phone = 'Required';
    if (!form.company.trim()) errs.company = 'Required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      await onSave(form, lead?._id);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="sheet-overlay" onClick={onClose} />
      <div className="sheet-panel">
        <div className="flex items-center justify-between px-6 py-4 border-b border-teal-800 sticky top-0 bg-zinc-950 z-10">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              {isEdit ? 'Edit lead' : 'New lead'}
            </h2>
            {isEdit && (
              <p className="text-xs text-zinc-500 mt-0.5">
                {lead.name} · {lead.company}
              </p>
            )}
          </div>
          <button onClick={onClose} className="btn-ghost p-1.5">
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {FIELDS.map(({ key, label, icon: Icon, type, placeholder, required }) => (
            <div key={key}>
              <label className="flex items-center gap-1.5 text-xs text-zinc-500 mb-1.5">
                <Icon size={11} />
                {label}
                {required && <span className="text-zinc-750">*</span>}
              </label>
              <input
                type={type}
                value={form[key]}
                onChange={set(key)}
                placeholder={placeholder}
                className={`input-base ${errors[key] ? 'border-red-900 focus:border-red-700' : ''}`}
              />
              {errors[key] && (
                <p className="text-[11px] text-red-400 mt-1">{errors[key]}</p>
              )}
            </div>
          ))}

          <div>
            <label className="flex items-center gap-1.5 text-xs text-zinc-500 mb-1.5">
              <Tag size={11} />
              Status
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, status: s }))}
                  className={`py-1.5 rounded-md border text-xs transition-all ${
                    form.status === s
                      ? 'border-indigo-500 bg-indigo-950/20 text-indigo-300'
                      : 'border-zinc-800 text-zinc-650 hover:border-zinc-750 hover:text-zinc-400'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="mt-2">
              <StatusBadge status={form.status} />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs text-zinc-500 mb-1.5">
              <FileText size={11} />
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={set('notes')}
              placeholder="Additional context, next steps…"
              rows={4}
              className="input-base resize-none"
            />
          </div>

          {isEdit && lead.statusHistory?.length > 0 && (
            <div>
              <label className="text-xs text-zinc-600 mb-2 block">Status history</label>
              <div className="space-y-1">
                {[...lead.statusHistory].reverse().slice(0, 5).map((h, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px] text-zinc-650">
                    <span className="w-1.5 h-1.5 bg-zinc-800 rounded-full" />
                    {h.fromStatus ? `${h.fromStatus} → ` : 'Created as '}
                    <span className="text-zinc-400">{h.toStatus}</span>
                    <span className="ml-auto">
                      {new Date(h.changedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2 border-t border-zinc-850">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
              {saving ? (
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={13} />
                  {isEdit ? 'Save changes' : 'Create lead'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
