import React, { useState, useRef, useCallback } from 'react';
import { Upload, FileText, X, Check, AlertCircle, Download } from 'lucide-react';
import Papa from 'papaparse';

const REQUIRED_FIELDS = ['name', 'email', 'phone', 'company'];
const SAMPLE_CSV = `Name,Email,Phone,Company,Status,Notes
Arjun Mehta,arjun@example.com,+91 98765 43210,TechCorp,New,Met at conference
Priya Sharma,priya@startup.io,+91 87654 32109,StartupIO,Contacted,Demo scheduled`;

export default function ImportDropzone({ onImport, onClose }) {
  const [dragging, setDragging] = useState(false);
  const [parsed, setParsed] = useState(null); 
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(false);
  const fileRef = useRef(null);

  const parseFile = (file) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase(),
      complete: ({ data, meta }) => {
        const valid = data.filter((row) => row.name?.trim() && row.email?.trim());
        const invalid = data.length - valid.length;
        setParsed({ rows: data, valid, invalid, headers: meta.fields, fileName: file.name });
      },
    });
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.name.endsWith('.csv')) parseFile(file);
  }, []);

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) parseFile(file);
    e.target.value = '';
  };

  const handleImport = async () => {
    if (!parsed?.valid?.length) return;
    setImporting(true);
    try {
      await onImport(parsed.valid);
      setDone(true);
      setTimeout(onClose, 1500);
    } catch {
      
    } finally {
      setImporting(false);
    }
  };

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'leadflow_sample.csv';
    a.click();
  };

  return (
    <>
      <div className="sheet-overlay" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-lg shadow-2xl animate-fade-in">
          
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">Import leads from CSV</h2>
              <p className="text-[11px] text-zinc-600 mt-0.5">Map column headers automatically</p>
            </div>
            <button onClick={onClose} className="btn-ghost p-1.5"><X size={14} /></button>
          </div>

          <div className="p-5 space-y-4">
            {!parsed ? (
              <>
                
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                  onClick={() => fileRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-lg p-10 flex flex-col items-center gap-3 cursor-pointer transition-all ${
                    dragging
                      ? 'border-emerald-600 bg-emerald-950/20'
                      : 'border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/40'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    dragging ? 'bg-emerald-900/60 text-emerald-400' : 'bg-zinc-800 text-zinc-500'
                  }`}>
                    <Upload size={18} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-zinc-300">
                      {dragging ? 'Drop your CSV here' : 'Drop CSV or click to browse'}
                    </p>
                    <p className="text-xs text-zinc-600 mt-1">Supports .csv files only</p>
                  </div>
                  <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={onFileChange} />
                </div>

                
                <div className="bg-zinc-800/50 rounded-lg px-4 py-3">
                  <p className="text-[11px] text-zinc-500 mb-2 font-medium">Required columns</p>
                  <div className="flex flex-wrap gap-1.5">
                    {REQUIRED_FIELDS.map((f) => (
                      <span key={f} className="text-[10px] bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded text-zinc-400 font-mono">
                        {f}
                      </span>
                    ))}
                    <span className="text-[10px] text-zinc-700 px-2 py-0.5">+ status, notes (optional)</span>
                  </div>
                </div>

                <button
                  onClick={downloadSample}
                  className="btn-ghost text-xs w-full justify-center border border-zinc-800"
                >
                  <Download size={12} />
                  Download sample CSV
                </button>
              </>
            ) : done ? (
              <div className="py-8 flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-emerald-950 border border-emerald-800 rounded-full flex items-center justify-center">
                  <Check size={20} className="text-emerald-400" />
                </div>
                <p className="text-sm text-zinc-300">Import successful</p>
              </div>
            ) : (
              <>
                
                <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg">
                  <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center shrink-0">
                    <FileText size={14} className="text-zinc-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-zinc-300 font-medium truncate">{parsed.fileName}</p>
                    <p className="text-[11px] text-zinc-600">
                      {parsed.rows.length} rows parsed · Columns: {parsed.headers?.join(', ')}
                    </p>
                  </div>
                  <button onClick={() => setParsed(null)} className="text-zinc-700 hover:text-zinc-400">
                    <X size={13} />
                  </button>
                </div>

                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-emerald-950/30 border border-emerald-900/50 rounded-lg p-3 text-center">
                    <div className="text-xl font-semibold text-emerald-400">{parsed.valid.length}</div>
                    <div className="text-[10px] text-emerald-700 mt-0.5">Valid leads to import</div>
                  </div>
                  <div className={`rounded-lg p-3 text-center border ${
                    parsed.invalid > 0
                      ? 'bg-amber-950/30 border-amber-900/50'
                      : 'bg-zinc-800/40 border-zinc-800'
                  }`}>
                    <div className={`text-xl font-semibold ${parsed.invalid > 0 ? 'text-amber-400' : 'text-zinc-600'}`}>
                      {parsed.invalid}
                    </div>
                    <div className={`text-[10px] mt-0.5 ${parsed.invalid > 0 ? 'text-amber-700' : 'text-zinc-700'}`}>
                      Skipped (missing name/email)
                    </div>
                  </div>
                </div>

                {parsed.invalid > 0 && (
                  <div className="flex items-start gap-2 text-[11px] text-amber-600 bg-amber-950/20 border border-amber-900/30 rounded-lg px-3 py-2">
                    <AlertCircle size={12} className="mt-0.5 shrink-0" />
                    Rows missing Name or Email will be skipped. All other fields are optional.
                  </div>
                )}

                
                {parsed.valid.length > 0 && (
                  <div className="border border-zinc-800 rounded-lg overflow-hidden">
                    <div className="px-3 py-2 border-b border-zinc-800 bg-zinc-800/40">
                      <p className="text-[10px] text-zinc-600 uppercase tracking-wider">Preview (first 3 rows)</p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-[11px]">
                        <thead>
                          <tr className="border-b border-zinc-800">
                            {['name', 'email', 'company', 'status'].map((h) => (
                              <th key={h} className="px-3 py-1.5 text-left text-zinc-600 font-medium capitalize">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {parsed.valid.slice(0, 3).map((row, i) => (
                            <tr key={i} className="border-b border-zinc-800/50 last:border-0">
                              <td className="px-3 py-1.5 text-zinc-300 truncate max-w-[120px]">{row.name}</td>
                              <td className="px-3 py-1.5 text-zinc-500 truncate max-w-[140px]">{row.email}</td>
                              <td className="px-3 py-1.5 text-zinc-500 truncate max-w-[100px]">{row.company || '—'}</td>
                              <td className="px-3 py-1.5 text-zinc-600">{row.status || 'New'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <button onClick={() => setParsed(null)} className="btn-secondary flex-1 justify-center text-xs">
                    Choose different file
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={importing || parsed.valid.length === 0}
                    className="btn-primary flex-1 justify-center text-xs"
                  >
                    {importing ? (
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Upload size={12} />
                        Import {parsed.valid.length} leads
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
