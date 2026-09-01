import axios from 'axios';
import { DashboardSummary, RevenueBreakdown, RecoveryCase, BatchRun } from '../types';

const API = axios.create({
  baseURL: '/api',
  timeout: 60000,
});

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  const { data } = await API.get('/dashboard/summary');
  return data;
};

export const getRevenueBreakdown = async (): Promise<{ breakdown: RevenueBreakdown[] }> => {
  const { data } = await API.get('/dashboard/breakdown');
  return data;
};

export const getRecoveries = async (params: {
  scenario?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ cases: RecoveryCase[]; total: number; page: number; limit: number }> => {
  const { data } = await API.get('/recoveries', { params });
  return data;
};

export const getRecoveryById = async (id: string): Promise<RecoveryCase> => {
  const { data } = await API.get(`/recoveries/${id}`);
  return data;
};

export const getTestCases = async (): Promise<any> => {
  const { data } = await API.get('/test-cases');
  return data;
};

export const createTestCase = async (payload: any): Promise<any> => {
  const { data } = await API.post('/test-cases', payload);
  return data;
};

export const executeTestCase = async (id: string): Promise<any> => {
  const { data } = await API.post(`/test-cases/${id}/execute`);
  return data;
};

export const triggerBatchRun = async (): Promise<{ message: string; status: string }> => {
  const { data } = await API.post('/recovery/run-batch');
  return data;
};

export const getLatestBatch = async (): Promise<{ batch: BatchRun | null }> => {
  const { data } = await API.get('/recovery/latest-batch');
  return data;
};

export const getBatchResult = async (batchId: string): Promise<BatchRun> => {
  const { data } = await API.get(`/recovery/batch/${batchId}`);
  return data;
};

export const getReviewQueue = async (): Promise<{ cases: RecoveryCase[]; total: number }> => {
  const { data } = await API.get('/review-queue');
  return data;
};

export const approveReviewCase = async (id: string): Promise<any> => {
  const { data } = await API.post(`/review-queue/${id}/approve`);
  return data;
};

export const rejectReviewCase = async (id: string, reason?: string): Promise<any> => {
  const { data } = await API.post(`/review-queue/${id}/reject`, { reason });
  return data;
};

export const resetData = async (): Promise<any> => {
  const { data } = await API.post('/demo/reset');
  return data;
};

export const seedData = async (): Promise<any> => {
  const { data } = await API.post('/demo/seed');
  return data;
};

export const exportAuditMatrix = async (format: 'csv' | 'json' = 'csv'): Promise<void> => {
  const response = await API.get(`/recovery/batch/latest/export?format=${format}`, {
    responseType: format === 'csv' ? 'blob' : 'json',
  });
  if (format === 'csv') {
    const blob = new Blob([response.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `razorrecover_audit_matrix_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
};

export const deleteTestCase = async (id: string): Promise<any> => {
  const { data } = await API.delete(`/test-cases/${id}`);
  return data;
};

export const customerPay = async (id: string, method: string = 'upi'): Promise<any> => {
  const { data } = await API.post(`/customer/pay/${id}`, { method });
  return data;
};

export const customerOptOut = async (id: string): Promise<any> => {
  const { data } = await API.post(`/customer/opt-out/${id}`);
  return data;
};

export const customerPromise = async (id: string, promisedDate: string): Promise<any> => {
  const { data } = await API.post(`/customer/promise/${id}`, { promisedDate });
  return data;
};

export const customerDispute = async (id: string, reason?: string): Promise<any> => {
  const { data } = await API.post(`/customer/dispute/${id}`, { reason });
  return data;
};

export default API;
