import { useState, useEffect, useCallback, useRef } from 'react';
import { getLeads, createLead, updateLead, deleteLead, importLeads } from '../utils/api';
import toast from 'react-hot-toast';

export function useLeads(activeSheet, updateSheetCount) {
  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 10 });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sort, setSort] = useState({ field: 'createdAt', order: 'desc' });
  const searchTimer = useRef(null);

  const fetch = useCallback(async () => {
    if (!activeSheet) return;
    setLoading(true);
    try {
      const { data } = await getLeads(activeSheet._id, {
        page,
        limit: 10,
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        sort: sort.field,
        order: sort.order,
      });
      setLeads(data.leads);
      setPagination(data.pagination);
    } catch {
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  }, [activeSheet, page, search, statusFilter, sort]);

  
  useEffect(() => { setPage(1); }, [activeSheet, search, statusFilter]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleSearch = (val) => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setSearch(val), 300);
  };

  const toggleSort = (field) => {
    setSort((s) =>
      s.field === field
        ? { field, order: s.order === 'desc' ? 'asc' : 'desc' }
        : { field, order: 'desc' }
    );
  };

  const saveLead = async (formData, id) => {
    try {
      if (id) {
        const { data } = await updateLead(id, formData);
        setLeads((prev) => prev.map((l) => (l._id === id ? data.lead : l)));
        toast.success('Lead updated');
      } else {
        await createLead(activeSheet._id, formData);
        updateSheetCount?.(activeSheet._id, 1);
        toast.success('Lead created');
        fetch();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save lead');
      throw err;
    }
  };

  const removeLead = async (lead) => {
    if (!window.confirm(`Delete "${lead.name}"? This cannot be undone.`)) return;
    try {
      await deleteLead(lead._id);
      updateSheetCount?.(activeSheet._id, -1);
      toast.success('Lead deleted');
      fetch();
    } catch {
      toast.error('Failed to delete lead');
    }
  };

  const bulkImport = async (rows) => {
    const { data } = await importLeads(activeSheet._id, rows);
    updateSheetCount?.(activeSheet._id, data.count);
    toast.success(data.message);
    fetch();
    return data;
  };

  return {
    leads, pagination, loading,
    page, setPage,
    search, handleSearch,
    statusFilter, setStatusFilter,
    sort, toggleSort,
    saveLead, removeLead, bulkImport,
    refresh: fetch,
  };
}
