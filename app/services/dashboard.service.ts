import { api } from "../lib/api";

export interface DashboardMetrics {
  activeUsers: number;
  activeCourses: number;
}

export const getDashboardMetrics = async (): Promise<DashboardMetrics> => {
  try {
    const response = await api.get<DashboardMetrics>("/users/statistics");
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    // Return default values if API fails
    return {
      activeUsers: 0,
      activeCourses: 0,
    };
  }
};