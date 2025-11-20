import { Asistencia, AsistenciaEncargado } from "@/app/types/types";
import { getEstadoColor } from "@/app/utils/getEstadoColor";
import { capitalize } from "@/app/utils/utils";
import { Check, CircleUser, TriangleAlert, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface AsistenciaCardProps {
    localAsistencia: Asistencia;
    alumno: {
        _id: string;
        nombre: string;
        image: string;
        email: string;
    };
    setModalState?: (state: {
        type: "add" | "edit" | "delete" | null;
        selected: Partial<AsistenciaEncargado> | null;
    }) => void;
    isAlumno: boolean;
    handleEstadoAsistencia?: (
        alumnoId: string,
        estado: "asistio" | "falto" | "permiso"
    ) => void;
}

export default function AsistenciaCard({
    localAsistencia,
    alumno,
    setModalState,
    isAlumno,
    handleEstadoAsistencia,
}: AsistenciaCardProps) {
    let asistencia;

    if (isAlumno) {
        asistencia = localAsistencia.alumnos.find(
            (a) => a.userXWorkGroupId === alumno._id
        );
    } else {
        asistencia = localAsistencia.encargados.find(
            (a) => a.userId === alumno._id
        );
    }

    const normalizeEstado = (estado?: string | null) => {
        if (!estado) return null;

        const clean = estado.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        if (clean === "asistio") return "asistio";
        if (clean === "falto") return "falto";
        if (clean === "permiso") return "permiso";

        return null;
    };

    // 🔹 Estado local para saber qué botón está seleccionado visualmente
    const [selectedEstado, setSelectedEstado] = useState<
        "asistio" | "falto" | "permiso" | null
    >(() => normalizeEstado(asistencia?.estado));

    // 🔹 Si cambia la asistencia desde fuera (por refetch, etc.), sincronizar
    useEffect(() => {
        setSelectedEstado(normalizeEstado(asistencia?.estado));
    }, [asistencia?.estado]);


    const handleClickEstado = (
        estado: "asistio" | "falto" | "permiso"
    ) => {
        setSelectedEstado(estado); // feedback visual inmediato
        handleEstadoAsistencia?.(alumno._id, estado); // avisar al padre
    };

    return (
        <div>
            <div
                key={alumno._id}
                className="flex sm:flex-row flex-col items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-100"
            >
                <div className="flex flex-row items-center gap-4 flex-1">
                    {alumno.image ? (
                        <Image
                            src={alumno.image}
                            alt={alumno.nombre}
                            width={300}
                            height={300}
                            quality={100}
                            className="w-12 h-12 rounded-full object-cover"
                        />
                    ) : (
                        <div className="p-2 rounded-full bg-gray-100">
                            <CircleUser className="w-8 h-8 text-[#003C71]" />
                        </div>
                    )}

                    <div className="flex flex-row justify-end items-end gap-2">
                        <div className="max-w-[150px] sm:max-w-[200px]">
                            <p className="font-medium text-gray-900">{alumno.nombre}</p>
                            <p className="text-sm text-gray-500 truncate">
                                {alumno.email}
                            </p>
                        </div>

                        {asistencia ? (
                            <span
                                className={`inline-block mt-1 px-2 py-1 rounded text-sm ${getEstadoColor(
                                    asistencia.estado
                                )}`}
                            >
                                {capitalize(asistencia.estado)}
                            </span>
                        ) : (
                            <span className="inline-block mt-1 px-2 py-1 rounded text-center text-sm bg-gray-100 text-gray-800">
                                No registrado
                            </span>
                        )}
                    </div>
                </div>

                {isAlumno ? (
                    <div className="flex gap-2 sm:mt-0 mt-3">
                        {/* ✅ ASISTIÓ */}
                        <button
                            onClick={() => handleClickEstado("asistio")}
                            className={`px-3 py-2 rounded-lg transition-colors
                ${selectedEstado === "asistio"
                                    ? "bg-green-600 text-white hover:bg-green-700"
                                    : "bg-green-100 text-green-600 hover:bg-green-200"
                                }`}
                        >
                            <Check size={20} />
                        </button>

                        {/* ✅ FALTÓ */}
                        <button
                            onClick={() => handleClickEstado("falto")}
                            className={`px-3 py-2 rounded-lg transition-colors
                ${selectedEstado === "falto"
                                    ? "bg-red-600 text-white hover:bg-red-700"
                                    : "bg-red-100 text-red-600 hover:bg-red-200"
                                }`}
                        >
                            <X size={20} />
                        </button>

                        {/* ✅ PERMISO */}
                        <button
                            onClick={() => handleClickEstado("permiso")}
                            className={`px-3 py-2 rounded-lg transition-colors
                ${selectedEstado === "permiso"
                                    ? "bg-yellow-500 text-white hover:bg-yellow-600"
                                    : "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                                }`}
                        >
                            <TriangleAlert size={20} />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() =>
                            setModalState?.({ type: "add", selected: alumno })
                        }
                        className="px-3 py-2 rounded-lg bg-[#003C71] text-white hover:bg-blue-800 transition-colors"
                    >
                        Registrar asistencia
                    </button>
                )}
            </div>
        </div>
    );
}
