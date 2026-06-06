import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSheets, createSheet as apiCreateSheet, deleteSheet as apiDeleteSheet } from '../utils/api';
import toast from 'react-hot-toast';

const SheetContext = createContext(null);

export const SheetProvider = ({ children }) => {
  const [sheets, setSheets] = useState([]);
  const [activeSheet, setActiveSheet] = useState(null);
  const [loadingSheets, setLoadingSheets] = useState(true);

  const fetchSheets = useCallback(async () => {
    setLoadingSheets(true);
    try {
      const { data } = await getSheets();
      setSheets(data.sheets);
      // Auto-select first sheet
      if (data.sheets.length > 0 && !activeSheet) {
        setActiveSheet(data.sheets[0]);
      }
    } catch {
      toast.error('Failed to load workspaces');
    } finally {
      setLoadingSheets(false);
    }
  }, []); // eslint-disable-line

  useEffect(() => { fetchSheets(); }, [fetchSheets]);

  const createSheet = async (name) => {
    const { data } = await apiCreateSheet({ sheetName: name });
    setSheets((prev) => [data.sheet, ...prev]);
    setActiveSheet(data.sheet);
    return data.sheet;
  };

  const deleteSheet = async (id) => {
    await apiDeleteSheet(id);
    const remaining = sheets.filter((s) => s._id !== id);
    setSheets(remaining);
    if (activeSheet?._id === id) {
      setActiveSheet(remaining[0] || null);
    }
  };

  const switchSheet = (sheet) => {
    setActiveSheet(sheet);
  };

  const updateSheetCount = (sheetId, delta) => {
    setSheets((prev) =>
      prev.map((s) => s._id === sheetId ? { ...s, leadCount: Math.max(0, (s.leadCount || 0) + delta) } : s)
    );
  };

  return (
    <SheetContext.Provider value={{
      sheets, activeSheet, loadingSheets,
      createSheet, deleteSheet, switchSheet,
      fetchSheets, updateSheetCount,
    }}>
      {children}
    </SheetContext.Provider>
  );
};

export const useSheet = () => {
  const ctx = useContext(SheetContext);
  if (!ctx) throw new Error('useSheet must be used inside SheetProvider');
  return ctx;
};
