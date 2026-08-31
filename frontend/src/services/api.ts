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

export default API;
