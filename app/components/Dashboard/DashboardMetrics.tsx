"use client";

import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, BookOpen, UserPlus, TrendingUp, Calendar } from "lucide-react";
import { MetricCard } from "./MetricCard";
import {
    getDashboardStatistics
} from "@/app/services/dashboard.service";
import {
    type DashboardStatistics,
    type UserStatisticsParams
} from "@/app/types/types";

export const DashboardMetricsComponent: React.FC = () => {
    const [dateFilter, setDateFilter] = useState<UserStatisticsParams>({});

    const {
        data: statistics,
        isLoading,
        error,
        refetch,
    } = useQuery<DashboardStatistics>({
        queryKey: ["dashboardStatistics", dateFilter],
        queryFn: () => getDashboardStatistics(dateFilter),
        refetchInterval: 10 * 60 * 1000, // 10 minutes
    });

    useEffect(() => {
        // Set up additional refresh mechanism
        const interval = setInterval(() => {
            refetch();
        }, 10 * 60 * 1000); // 10 minutes

        return () => clearInterval(interval);
    }, [refetch]);

    const handleDateFilterChange = (filterType: 'from' | 'to', value: string) => {
        setDateFilter((prev: UserStatisticsParams) => ({
            ...prev,
            [filterType === 'from' ? 'lastActivityFromDate' : 'lastActivityToDate']: value
        }));
    };

    if (isLoading) {
        return (
            <div className="space-y-6 mb-8">
                {/* Date filter skeleton */}
                <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="flex gap-4">
                        <div className="flex-1 h-10 bg-gray-200 rounded"></div>
                        <div className="flex-1 h-10 bg-gray-200 rounded"></div>
                    </div>
                </div>

                {/* Metrics skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                                </div>
                                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
                <p className="text-red-600">Error al cargar las métricas del dashboard</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 mb-8">
            {/* Date Filter Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue_principal" />
                    Filtros de Actividad
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Fecha de inicio
                        </label>
                        <input
                            type="date"
                            value={dateFilter.lastActivityFromDate || ''}
                            onChange={(e) => handleDateFilterChange('from', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue_principal"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Fecha de fin
                        </label>
                        <input
                            type="date"
                            value={dateFilter.lastActivityToDate || ''}
                            onChange={(e) => handleDateFilterChange('to', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue_principal"
                        />
                    </div>
                </div>
            </div>

            {/* Main Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Total Usuarios"
                    value={statistics?.userStats?.totalUsers || 0}
                    icon={Users}
                    color="text-blue_principal"
                    bgColor="bg-blue-50"
                />
                <MetricCard
                    title="Usuarios Activos"
                    value={statistics?.userStats?.activeUsers || 0}
                    icon={TrendingUp}
                    color="text-green-600"
                    bgColor="bg-green-50"
                />
                <MetricCard
                    title="Nuevos Usuarios (Mes)"
                    value={statistics?.userStats?.newUsersThisMonth || 0}
                    icon={UserPlus}
                    color="text-purple-600"
                    bgColor="bg-purple-50"
                />
                <MetricCard
                    title="Cursos Activos"
                    value={statistics?.courseStats?.activeCourses || 0}
                    icon={BookOpen}
                    color="text-beige_secondary"
                    bgColor="bg-yellow-50"
                />
            </div>

            {/* Additional Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Users by Role */}
                {statistics?.userStats?.usersByRole && statistics.userStats.usersByRole.length > 0 && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Usuarios por Rol</h3>
                        <div className="space-y-3">
                            {statistics.userStats.usersByRole.map((roleStat: { role: string; count: number }, index: number) => (
                                <div key={index} className="flex justify-between items-center">
                                    <span className="text-gray-600 capitalize">{roleStat.role}</span>
                                    <span className="font-semibold text-blue_principal">{roleStat.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Course Statistics */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Estadísticas de Cursos</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Total Cursos</span>
                            <span className="font-semibold text-blue_principal">{statistics?.courseStats?.totalCourses || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Total Inscripciones</span>
                            <span className="font-semibold text-blue_principal">{statistics?.courseStats?.totalEnrollments || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Promedio Estudiantes por Curso</span>
                            <span className="font-semibold text-blue_principal">
                                {statistics?.courseStats?.averageStudentsPerCourse?.toFixed(1) || '0'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};