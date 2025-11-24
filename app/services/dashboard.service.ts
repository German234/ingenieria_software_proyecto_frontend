import { api } from "../lib/api";
import {
  UserStatistics,
  CourseStatistics,
  DashboardStatistics,
  UserStatisticsParams
} from "../types/types";

// Define the actual API response structure
interface CourseApiResponse {
  statusCode: number;
  message: string;
  data: {
    totalActiveCourses: number;
    courses: Array<{
      _id: string;
      nombre: string;
      slug: string;
      backgroundImage: string;
      estado: string;
      cantidadInscripciones: number;
    }>;
  };
}

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

// Define the actual user API response structure
interface UserApiResponse {
  statusCode: number;
  message: string;
  data: {
    totalActiveStudents: number;
    activeTutors: Array<{
      id: string;
      name: string;
      email: string;
      [key: string]: unknown;
    }>;
    totalActiveTutors: number;
    totalActiveAdministrators: number;
    filters: {
      lastActivityFromDate: string | null;
      lastActivityToDate: string | null;
    };
  };
}

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
      
    const response = await api.get<UserApiResponse>(url);
    const data = response.data.data;
    
    // Handle the actual response structure from the API
    if (data && typeof data === 'object') {
      // Calculate total users by summing all active users
      const totalActiveUsers = data.totalActiveStudents + data.totalActiveTutors + data.totalActiveAdministrators;
      
      return {
        totalUsers: totalActiveUsers,
        activeUsers: totalActiveUsers,
        inactiveUsers: 0, // API doesn't provide inactive users count
        newUsersThisMonth: 0, // API doesn't provide new users this month
        usersByRole: [
          { role: "students", count: data.totalActiveStudents },
          { role: "tutors", count: data.totalActiveTutors },
          { role: "administrators", count: data.totalActiveAdministrators }
        ]
      };
    }
    
    // Fallback to default values if structure is unexpected
    return {
      totalUsers: 0,
      activeUsers: 0,
      inactiveUsers: 0,
      newUsersThisMonth: 0,
      usersByRole: []
    };
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
    const response = await api.get<CourseApiResponse>("/user-x-work-groups/courses/statistics");
    const data = response.data.data;
    
    // Handle the actual response structure from the API
    if (data && typeof data === 'object') {
      // If the API returns totalActiveCourses, map it to activeCourses
      if ('totalActiveCourses' in data) {
        return {
          totalCourses: data.totalActiveCourses || 0,
          activeCourses: data.totalActiveCourses || 0,
          coursesByStatus: data.courses?.map((course) => ({
            status: course.estado,
            count: course.cantidadInscripciones || 0
          })) || [],
          averageStudentsPerCourse: data.courses?.reduce((acc, course) =>
            acc + (course.cantidadInscripciones || 0), 0) / (data.courses?.length || 1) || 0,
          totalEnrollments: data.courses?.reduce((acc, course) =>
            acc + (course.cantidadInscripciones || 0), 0) || 0
        };
      }
      // If the API returns the expected structure directly
      else if ('activeCourses' in data) {
        return data as CourseStatistics;
      }
    }
    
    // Fallback to default values if structure is unexpected
    return {
      totalCourses: 0,
      activeCourses: 0,
      coursesByStatus: [],
      averageStudentsPerCourse: 0,
      totalEnrollments: 0
    };
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