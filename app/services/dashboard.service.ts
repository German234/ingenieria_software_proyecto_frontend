import { api } from "../lib/api";
import {
  UserStatistics,
  CourseStatistics,
  DashboardStatistics,
  UserStatisticsParams
} from "../types/types";

export interface DashboardMetrics {
  activeUsers: number;
  activeCourses: number;
}

// Legacy function for backward compatibility
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

// Enhanced user statistics with date filtering
export const getUserStatistics = async (params?: UserStatisticsParams): Promise<UserStatistics> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params?.lastActivityFromDate) {
      queryParams.append('lastActivityFromDate', params.lastActivityFromDate);
    }
    
    if (params?.lastActivityToDate) {
      queryParams.append('lastActivityToDate', params.lastActivityToDate);
    }
    
    const url = queryParams.toString()
      ? `/users/statistics?${queryParams.toString()}`
      : '/users/statistics';
      
    const response = await api.get<UserStatistics>(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching user statistics:", error);
    // Return default values if API fails
    return {
      totalUsers: 0,
      activeUsers: 0,
      inactiveUsers: 0,
      newUsersThisMonth: 0,
      usersByRole: []
    };
  }
};

// Course statistics endpoint
export const getCourseStatistics = async (): Promise<CourseStatistics> => {
  try {
    const response = await api.get<CourseStatistics>("/user-x-work-groups/courses/statistics");
    return response.data;
  } catch (error) {
    console.error("Error fetching course statistics:", error);
    // Return default values if API fails
    return {
      totalCourses: 0,
      activeCourses: 0,
      coursesByStatus: [],
      averageStudentsPerCourse: 0,
      totalEnrollments: 0
    };
  }
};

// Combined dashboard statistics
export const getDashboardStatistics = async (params?: UserStatisticsParams): Promise<DashboardStatistics> => {
  try {
    const [userStats, courseStats] = await Promise.all([
      getUserStatistics(params),
      getCourseStatistics()
    ]);
    
    return {
      userStats,
      courseStats
    };
  } catch (error) {
    console.error("Error fetching dashboard statistics:", error);
    // Return default values if API fails
    return {
      userStats: {
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        newUsersThisMonth: 0,
        usersByRole: []
      },
      courseStats: {
        totalCourses: 0,
        activeCourses: 0,
        coursesByStatus: [],
        averageStudentsPerCourse: 0,
        totalEnrollments: 0
      }
    };
  }
};