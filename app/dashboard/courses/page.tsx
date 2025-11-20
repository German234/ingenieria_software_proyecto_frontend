"use client";

import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { getCourseBySlug } from "@/app/services/course.service";
import { useState } from "react";
import PageHeader from "../../components/Dashboard/PageHeader";
import Table from "../../components/Tables/Table";
import ListGridLayout from "../../components/Dashboard/ListGridLayout";
import {
  Column,
  Course,
  CourseAddInterface,
  Image as ImageFile,
} from "@/app/types/types";
import { Tooltip as ReactTooltip } from "react-tooltip";
import {
  createCourse,
  getCourses,
  updateCourse,       // 🆕 importar update
  deleteCourse,       // 🆕 importar delete
} from "@/app/services/course.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loading } from "../../components/Loading";
import ServerErrorPage from "@/app/error";
import Link from "next/link";
import { Plus } from "lucide-react";
import { RoleGuard } from "@/app/components/Dashboard/RoleGuard";
import { ROLES } from "@/app/constants/roles";
import { uploadImage } from "@/app/services/images.service";

// 🆕 Importar los dos modales para reutilizarlos
import { AddCourseModal as CreateCourseModal } from "@/app/components/Popups/AddCourseModal";
import { AddCourseModal as EditCourseModal } from "@/app/components/Popups/CourseConfigModal";

import { DeleteModal } from "@/app/components/Popups/DeleteModal";
import { toast } from "@pheralb/toast";
import { DownloadCoursesReportButton } from "@/app/components/Dashboard/DownloadCoursesReportButton";

type CourseCardProps = {
  course: Course;
  onEdit: (course: Course) => void;
  onDelete: (course: Course) => void;
};

const CourseCard = ({ course, onEdit, onDelete }: CourseCardProps) => {
  const router = useRouter();

  const handleNavigate = () => {
    router.push(`/dashboard/my-courses/${course.slug}`);
  };

  return (
    <div
      className="relative group cursor-pointer rounded-xl bg-center shadow-lg overflow-hidden hover:shadow-xl transition-all h-48"
      style={{
        backgroundImage: `url(${course.backgroundImage})`,
        backgroundSize: "120%",
        backgroundPosition: "center",
      }}
      onClick={handleNavigate}
    >
      {/* CONTROLES DE ACCIÓN */}
      <div className="absolute top-3 right-3 flex gap-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">

        {/* BOTÓN EDITAR */}
        <button
          className="
            flex items-center justify-center
            w-10 h-10
            bg-white border border-[#003C71]/30
            text-[#003C71]
            rounded-xl shadow-sm
            hover:bg-[#003C71]
            hover:text-white
            hover:shadow
            transition-all
          "
          onClick={(e) => {
            e.stopPropagation();
            onEdit(course);
          }}
        >
          <Pencil size={20} />
        </button>

        {/* BOTÓN ELIMINAR */}
        <button
          className="
            flex items-center justify-center
            w-10 h-10
            bg-white border border-red-400/40
            text-red-600
            rounded-xl shadow-sm
            hover:bg-red-600
            hover:text-white
            hover:shadow
            transition-all
          "
          onClick={(e) => {
            e.stopPropagation();
            onDelete(course);
          }}
        >
          <Trash2 size={20} />
        </button>
      </div>

      {/* CONTENIDO CARD */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-4 flex flex-col justify-end">
        <h3 className="text-xl font-bold text-white drop-shadow mb-1">
          {course.nombre}
        </h3>
      </div>
    </div>
  );
};


const columns: Column<Course>[] = [
  {
    header: "Curso",
    accessor: (course) => (
      <Link
        href={`/dashboard/my-courses/${course.slug}`}
        className="flex items-center gap-3 group"
      >
        <div
          className="w-8 h-8 rounded-lg bg-cover bg-center shadow-sm"
          style={{ backgroundImage: `url(${course.backgroundImage})` }}
        />
        <span className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
          {course.nombre}
        </span>
      </Link>
    ),
  },
];

export default function CoursesPage() {
  const [isCardView, setIsCardView] = useState(true);
  const [isLoadingEditData, setIsLoadingEditData] = useState(false);
  const queryClient = useQueryClient();

  // 🧠 Ahora guardamos también el curso completo (Course)
  const [modalState, setModalState] = useState<{
    type: "add" | "edit" | "delete" | null;
    selected: Course | null;
  }>({ type: null, selected: null });

  const {
    data: cursos,
    isLoading,
    isError,
  } = useQuery<Course[]>({
    queryKey: ["cursosNuevos"],
    queryFn: getCourses,
    staleTime: 60 * 1000,
  });

  const uploadImageMutation = useMutation({
    mutationFn: uploadImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cursosNuevos"] });
    },
  });

  const createCourseMutation = useMutation({
    mutationFn: createCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["cursosNuevos"],
      });
    },
  });

  // 🆕 Mutación para actualizar curso (reutiliza lógica del Tablón)
  const updateCourseMutation = useMutation({
    mutationFn: updateCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["cursosNuevos"],
      });
    },
  });

  // 🆕 Mutación para eliminar curso
  const deleteCourseMutation = useMutation({
    mutationFn: deleteCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["cursosNuevos"],
      });
    },
  });

  const closeModal = () => {
    setModalState({ type: null, selected: null });
  };

  // 🔹 Crear curso (ya lo tenías)
  const handleAddCourse = async (
    course: CourseAddInterface,
    image: File | string | null
  ) => {
    const updateData: CourseAddInterface = {
      workGroupName: course.workGroupName,
      backgroundImageId: course.backgroundImageId,
      userIds: course.userIds,
    };
    try {
      let imageId = course.backgroundImageId;

      if (image instanceof File) {
        if (!image.type.startsWith("image/")) {
          throw new Error("Solo se permiten imágenes");
        }

        if (image.size > 5 * 1024 * 1024) {
          throw new Error("Tamaño máximo de imagen: 5MB");
        }

        const imagen: ImageFile = {
          originalFilename: image.name,
          category: "workgroups",
          file: image,
        };

        const imageResponse = await uploadImageMutation.mutateAsync(imagen);
        imageId = imageResponse.data.id;
      } else if (typeof image === "string") {
        updateData.backgroundImageId = image;
      }

      updateData.backgroundImageId = imageId;
      updateData.workGroupName = course.workGroupName;
      updateData.userIds = course.userIds;

      const courseResponse = await createCourseMutation.mutateAsync(updateData);
      console.log("Curso creado:", courseResponse);
      toast.success({ text: "Curso creado correctamente" });
      closeModal();
    } catch (error) {
      console.error("Error al agregar el curso:", error);
      toast.error({
        text: "Error al crear el curso",
      });
    }
  };

  const handleOpenEdit = async (row: Course) => {
    try {
      setIsLoadingEditData(true);
      console.log("➡️ Abriendo edición para:", row);

      // Traer el curso COMPLETO por slug (o por id si prefieres)
      const fullCourse = await getCourseBySlug(row.slug);

      console.log("✅ Curso completo para editar:", fullCourse);

      // Guardamos el curso completo en el estado del modal
      setModalState({
        type: "edit",
        selected: fullCourse,
      });
    } catch (error) {
      console.error("Error cargando curso para editar:", error);
      toast.error({
        text: "No se pudo cargar la información del curso",
        description: "Intenta nuevamente.",
      });
    } finally {
      setIsLoadingEditData(false);
    }
  };

  // 🔹 Editar curso desde la lista (similar a handleEdit del Tablón)
  const handleEditCourse = async (
    cursoEditar: CourseAddInterface,
    image: File | string | null
  ) => {
    if (!modalState.selected) return;

    const updateData: CourseAddInterface = {
      // ⚠️ Ajusta estos campos según tu CourseAddInterface real
      name: (cursoEditar as any).name ?? modalState.selected.nombre,
      backgroundImageId: cursoEditar.backgroundImageId,
      userIds: cursoEditar.userIds,
    };

    try {
      let imageId = cursoEditar.backgroundImageId;

      if (image instanceof File) {
        if (!image.type.startsWith("image/")) {
          throw new Error("Solo se permiten imágenes");
        }

        if (image.size > 5 * 1024 * 1024) {
          throw new Error("Tamaño máximo de imagen: 5MB");
        }

        const imagen: ImageFile = {
          originalFilename: image.name,
          category: "workgroups",
          file: image,
        };

        const imageResponse = await uploadImageMutation.mutateAsync(imagen);
        imageId = imageResponse.data.id;
      } else if (typeof image === "string") {
        updateData.backgroundImageId = image;
      }

      updateData.backgroundImageId = imageId;
      // 🆕 aquí usamos el _id del curso seleccionado
      (updateData as any).id = modalState.selected._id;

      const courseResponse = await updateCourseMutation.mutateAsync(updateData);
      console.log("Curso actualizado:", courseResponse);

      toast.success({
        text: "Curso actualizado exitosamente",
      });
      closeModal();
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        toast.error({
          text: "Error al actualizar el curso",
          description: error.message,
        });
      } else {
        toast.error({
          text: "Error inesperado",
          description: "Por favor, intenta nuevamente.",
        });
      }
    }
  };

  // 🔹 Eliminar curso
  const handleDeleteCourse = async () => {
    if (!modalState.selected) return;
    try {
      await deleteCourseMutation.mutateAsync(modalState.selected._id);
      toast.success({ text: "Curso eliminado correctamente" });
      closeModal();
    } catch (error) {
      console.error(error);
      toast.error({
        text: "Error al eliminar el curso",
      });
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <ServerErrorPage />;
  }

  if (!cursos || cursos.length === 0) {
    return <div className="p-10 text-center">No tienes cursos asignados</div>;
  }

  return (
    <div className="p-10">
      <PageHeader
        title="Cursos"
        buttons={[
          {
            label: "Agregar Curso",
            icon: <Plus size={18} />,
            onClick: () => {
              setModalState({ type: "add", selected: null });
            },
            className:
              "bg-blue_principal text-white px-4 py-2 rounded-lg shadow-md transition-transform hover:scale-105",
          },
        ]}
      />

      <ListGridLayout 
        isCardView={isCardView} 
        setIsCardView={setIsCardView}
        downloadButton={
          <DownloadCoursesReportButton
            buttonLabel="Descargar Reporte"
          />
        }
      />

      {isCardView ? (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cursos &&
            cursos?.map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                onEdit={handleOpenEdit}
                onDelete={(c) =>
                  setModalState({ type: "delete", selected: c })
                }
              />
            ))}
        </div>
      ) : (
        <div className="mt-4 bg-white rounded-lg shadow-md">
          <Table
            data={cursos ?? []}
            columns={columns}
            loading={false}
            hasEdit={true}
            onEdit={handleOpenEdit}
            onDelete={(id) => {
              const found = cursos.find((c) => c._id === id) || null;
              setModalState({ type: "delete", selected: found });
            }}
          />
        </div>
      )}

      <ReactTooltip id="professor-tooltip" className="z-50" place="top" />
      <ReactTooltip id="avatar-tooltip" className="z-50" place="top" />
      <ReactTooltip id="remaining-tooltip" className="z-50" place="top" />

      {/* 🔹 Modal para CREAR curso (ya lo tenías) */}
      <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.PROFESOR, ROLES.TUTOR]}>
        <CreateCourseModal
          isOpen={modalState.type === "add"}
          title="Agregar curso"
          initialData={modalState.selected as any}
          onClose={closeModal}
          onSubmit={handleAddCourse}
        />
      </RoleGuard>

      {/* 🔹 Modal para EDITAR curso (reusando el de CourseConfigModal) */}
      <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.PROFESOR, ROLES.TUTOR]}>
        <EditCourseModal
          isOpen={modalState.type === "edit"}
          title="Editar curso"
          initialData={modalState.selected ?? undefined}
          onClose={closeModal}
          onSubmit={handleEditCourse}
        />
      </RoleGuard>

      {/* 🔹 Modal de ELIMINAR curso */}
      <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.PROFESOR, ROLES.TUTOR]}>
        <DeleteModal<Course>
          isOpen={modalState.type === "delete"}
          title="Eliminar curso"
          item={modalState.selected as Course}
          onClose={closeModal}
          onConfirm={handleDeleteCourse}
          description={() => (
            <p>
              ¿Estás seguro de eliminar el curso{" "}
              <span className="font-semibold">
                {modalState.selected?.nombre}
              </span>
              ?
              <br />
              <span className="text-sm text-gray-500">
                Esta acción no se puede deshacer.
              </span>
            </p>
          )}
        />
      </RoleGuard>
    </div>
  );
}
