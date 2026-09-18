import { api } from '../helpers/http';
import type { DashboardStats } from '../types';

export const StatsApi = {
  dashboard: () => api.get<DashboardStats>('/stats'),
};
