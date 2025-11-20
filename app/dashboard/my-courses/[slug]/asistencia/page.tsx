"use client";
import React, {
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { CourseContext } from "@/app/contexts/course-context";
import type { Asistencia, AsistenciaEncargado } from "@/app/types/types";
import {
  getAsistenciaByCourseId,
  updateAsistenciaById,
  addAsistenciaEncargadoIndividualy,
} from "@/app/services/asistencia.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@pheralb/toast";
import { useWarnIfUnsavedChanges } from "@/app/hooks/useWarnIfUnsavedChanges";
import { FormAsistenciaEncargado } from "@/app/components/Popups/AddEncargadoAsistenciaModal";
import AsistenciaCard from "@/app/components/Asistencia/AsistenciaCard";
import { AsistenciaSearchBar } from "@/app/components/Asistencia/AsistenciaSearchBar"; // 👈 NUEVO
import { getLocalTimeZone, today } from "@internationalized/date";

type EstadoAsistencia = "asistio" | "falto" | "permiso";

const getCurrentDateString = today(getLocalTimeZone());
// Fecha en formato YYYY-MM-DD, alineada con lo que devuelve/espera el backend
const currentDateIso = new Date().toISOString().split("T")[0];

export default function Asistencia() {
  const course = useContext(CourseContext);
  const queryClient = useQueryClient();

  const [localAsistencia, setLocalAsistencia] = useState<Asistencia>({
    _id: "",
    seccionId: course?._id || "",
    alumnos: [],
    encargados: [],
  });

  const [modalState, setModalState] = useState<{
    type: "add" | "edit" | "delete" | null;
    selected: Partial<AsistenciaEncargado> | null;
  }>({ type: null, selected: null });

  const { data: asistenciaResponse } = useQuery<Asistencia>({
    queryKey: ["asistencia", course?._id],
    queryFn: () => getAsistenciaByCourseId(course?._id as string),
    enabled: !!course?._id,
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const initialAlumnosRef = useRef(localAsistencia.alumnos);
  const initialEncargadosRef = useRef(localAsistencia.encargados);

  // 🔍 estado del buscador
  const [search, setSearch] = useState("");          // 👈 NUEVO

  useWarnIfUnsavedChanges(hasUnsavedChanges);

  const updateAsistenciaByIdMutation = useMutation({
    mutationFn: updateAsistenciaById,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["asistencia", course?._id],
      });
    },
  });

  const addAsistenciaEncargadoIndividualyMutation = useMutation<
    Asistencia,
    unknown,
    { encargado: Partial<AsistenciaEncargado>; id_section: string }
  >({
    mutationFn: ({ encargado, id_section }) =>
      addAsistenciaEncargadoIndividualy(encargado, id_section),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["asistencia", course?._id],
      });
    },
  });

  useEffect(() => {
    if (asistenciaResponse) {
      const todayStr = currentDateIso; // misma lógica que backend

      const todayAsistencias = {
        ...asistenciaResponse,
        alumnos: asistenciaResponse.alumnos.filter(
          (alumno: { fecha: string }) =>
            alumno.fecha.split("T")[0] === todayStr
        ),
        encargados: asistenciaResponse.encargados.filter(
          (encargado: { fecha: string }) =>
            encargado.fecha.split("T")[0] === todayStr
        ),
      };

      initialAlumnosRef.current = todayAsistencias.alumnos;
      initialEncargadosRef.current = todayAsistencias.encargados;

      setLocalAsistencia(todayAsistencias);
    }
  }, [asistenciaResponse]);

  useEffect(() => {
    const hasChanges =
      JSON.stringify(localAsistencia.alumnos) !==
      JSON.stringify(initialAlumnosRef.current);
    setHasUnsavedChanges(hasChanges);
  }, [localAsistencia.alumnos]);

  const handleAdd = (formData: AsistenciaEncargado) => {
    if (!modalState.selected) return;

    const payload: AsistenciaEncargado = {
      userId: modalState.selected._id || "",
      fecha: new Date(formData.fecha).toISOString(),
      estado: formData.estado,
      hora_inicio: new Date(
        `${formData.fecha}T${formData.hora_inicio}`
      ).toISOString(),
      hora_fin: new Date(
        `${formData.fecha}T${formData.hora_fin}`
      ).toISOString(),
    };

    const finalPromise =
      addAsistenciaEncargadoIndividualyMutation.mutateAsync({
        encargado: payload,
        id_section: course?._id as string,
      });

    toast.loading({
      text: "Registrando asistencia...",
      options: {
        promise: finalPromise,
        success: "Asistencia registrada exitosamente 🎉",
        error: "Error al guardar la asistencia 😢",
        autoDismiss: true,
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["asistencia", course?._id],
          });
          initialEncargadosRef.current = localAsistencia.encargados;
          setHasUnsavedChanges(false);
          setModalState({ type: null, selected: null });
        },
        onError: (error: unknown) => {
          const err = error as {
            response?: { status: number; message: string };
          };
          if (err.response && err.response.status === 409)
            toast.error({ text: "El usuario tiene horarios solapados" });
          else {
            console.log(error);
            toast.error({ text: "Error al guardar la asistencia" });
          }
        },
      },
    });
  };

  const handleEstadoAsistencia = useCallback(
    (alumnoKey: string, estado: EstadoAsistencia) => {
      setLocalAsistencia((prev) => {
        // alumnoKey es userXWorkgroupId (o _id si no existe)
        const alumno = course?.alumnos.find(
          (a) =>
            a.userXWorkgroupId === alumnoKey || a._id === alumnoKey
        );

        if (!alumno) return prev;

        const userXWorkGroupId = alumno.userXWorkgroupId ?? alumnoKey;

        const existingIndex = prev.alumnos.findIndex(
          (a) => a.userXWorkGroupId === userXWorkGroupId
        );

        const newAsistencia = {
          userXWorkGroupId,
          fecha: currentDateIso, // misma fecha que usamos para filtrar
          estado,
          nombre: alumno.nombre,
          imagen: alumno.image,
        };

        const updatedAlumnos = [...prev.alumnos];

        if (existingIndex === -1) {
          updatedAlumnos.push(newAsistencia);
        } else {
          updatedAlumnos[existingIndex] = newAsistencia;
        }

        return {
          ...prev,
          alumnos: updatedAlumnos,
        };
      });
    },
    [course]
  );

  const closeModal = () =>
    setModalState({ type: null, selected: null });

  const handleGuardar = () => {
    const payload = {
      seccionId: course?._id || "",
      asistencias: localAsistencia.alumnos.map(
        ({ userXWorkGroupId, fecha, estado }) => ({
          userXWorkGroupId,
          fecha,
          estado,
        })
      ),
      
    };

    console.log("PAYLOAD FINALPROMISE", payload);
    const finalPromise = updateAsistenciaByIdMutation.mutateAsync(payload);
    

    toast.loading({
      text: "Actualizando asistencia...",
      options: {
        promise: finalPromise,
        success: "Asistencia registrada exitosamente 🎉",
        error: "Error al guardar la asistencia 😢",
        autoDismiss: true,
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["asistencia", course?._id],
          });
          initialAlumnosRef.current = localAsistencia.alumnos;
          setHasUnsavedChanges(false);
        },
        onError: (error: unknown) => {
          const err = error as {
            response?: { status: number; message: string };
          };
          if (err.response && err.response.status === 409)
            toast.error({ text: "El usuario tiene horarios solapados" });
          else {
            console.log(error);
            toast.error({ text: "Error al guardar la asistencia" });
          }
        },
      },
    });
  };

  if (!course) return <div>Seleccione un curso primero</div>;

  // 🔍 Filtrado de alumnos según el término de búsqueda
  const filteredAlumnos = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return course.alumnos;

    return course.alumnos.filter((alumno) =>
      `${alumno.nombre} ${alumno.email ?? ""}`
        .toLowerCase()
        .includes(term)
    );
  }, [course.alumnos, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex flex-col w-full gap-2">
          <div className="flex justify-between gap-4">
            <h1 className="sm:text-2xl my-1 text-base text-[#003C71] font-bold">
              Registro de Asistencia
            </h1>
            <button
              onClick={handleGuardar}
              className="bg-[#003C71] text-white sm:px-6 sm:py-0 px-2 py-0 rounded-lg transition-colors disabled:bg-gray-300"
              disabled={!hasUnsavedChanges}
            >
              Guardar Asistencias
            </button>
          </div>
        </div>
      </div>

      {/* 🔍 Barra de búsqueda arriba de las cards */}
      <AsistenciaSearchBar
        value={search}
        onChange={setSearch}
        placeholder="Buscar estudiante por nombre o correo..."
      />

      <p className="text-xl font-semibold text-[#003C71]">
        {new Date(currentDateIso).toLocaleDateString("es-ES", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }).replace(/^\w/, (c) => c.toUpperCase())}
      </p>

      <div className="space-y-4">
        {filteredAlumnos.map((alumno) => (
          <AsistenciaCard
            key={alumno._id}
            isAlumno={true}
            localAsistencia={localAsistencia}
            alumno={alumno}
            handleEstadoAsistencia={handleEstadoAsistencia}
          />
        ))}

        {filteredAlumnos.length === 0 && (
          <p className="text-sm text-gray-500">
            No se encontraron estudiantes que coincidan con “{search}”.
          </p>
        )}

        <FormAsistenciaEncargado
          isOpen={modalState.type === "add"}
          title="Asistencia"
          onClose={closeModal}
          onSubmit={handleAdd}
        />
      </div>
    </div>
  );
}
