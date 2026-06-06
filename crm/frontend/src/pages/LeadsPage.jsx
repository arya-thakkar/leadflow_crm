import React from 'react';
import LeadsTable from '../components/leads/LeadsTable';
import { useSheet } from '../context/SheetContext';

export default function LeadsPage() {
  const { activeSheet, loadingSheets } = useSheet();

  return (
    <div className="flex-1 flex flex-col min-h-0">
      
      <div className="px-6 py-4 border-b border-zinc-800/60 shrink-0">
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-semibold text-zinc-100">
            {loadingSheets ? (
              <span className="skeleton h-4 w-40 rounded inline-block" />
            ) : (
              activeSheet?.sheetName || 'Leads'
            )}
          </h1>
          {activeSheet && !loadingSheets && (
            <span className="text-xs text-zinc-600">· {activeSheet.leadCount ?? 0} leads</span>
          )}
        </div>
      </div>
      <LeadsTable />
    </div>
  );
}
