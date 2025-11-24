"use client";

import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, BookOpen } from "lucide-react";
import { MetricCard } from "./MetricCard";
import { getDashboardMetrics, type DashboardMetrics } from "@/app/services/dashboard.service";

export const DashboardMetricsComponent: React.FC = () => {
    const {
        data: metrics,
        isLoading,
        error,
        refetch,
    } = useQuery<DashboardMetrics>({
        queryKey: ["dashboardMetrics"],
        queryFn: getDashboardMetrics,
        refetchInterval: 10 * 60 * 1000, // 10 minutes
    });

    useEffect(() => {
        // Set up additional refresh mechanism
        const interval = setInterval(() => {
            refetch();
        }, 10 * 60 * 1000); // 10 minutes

        return () => clearInterval(interval);
    }, [refetch]);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                        </div>
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                        </div>
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <MetricCard
                title="Usuarios Activos"
                value={metrics?.activeUsers || 0}
                icon={Users}
                color="text-blue_principal"
                bgColor="bg-blue-50"
            />
            <MetricCard
                title="Cursos Activos"
                value={metrics?.activeCourses || 0}
                icon={BookOpen}
                color="text-beige_secondary"
                bgColor="bg-yellow-50"
            />
        </div>
    );
};