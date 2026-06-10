import { useState, useCallback } from 'react';
import api from '../lib/api';

/**
 * @returns {{ records: Array, uploadRecord: Function, getRecord: Function, deleteRecord: Function, shareRecord: Function, isLoading: boolean, error: string|null }}
 */
export function useRecords() {
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const uploadRecord = useCallback(async (formData) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.post('/records/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setRecords((prev) => [res.data.record, ...prev]);
      return res.data.record;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to upload record';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getRecord = useCallback(async (id) => {
    const res = await api.get(`/records/${id}`);
    return res.data.record;
  }, []);

  const deleteRecord = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.delete(`/records/${id}`);
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete record';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const shareRecord = useCallback(async (recordId, doctorId) => {
    setError(null);
    try {
      const res = await api.post('/records/share', { recordId, doctorId });
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to share record';
      setError(msg);
      throw err;
    }
  }, []);

  return { records, uploadRecord, getRecord, deleteRecord, shareRecord, isLoading, error };
}
