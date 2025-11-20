"use client";

import { Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { api } from "@/app/lib/api";
import { toast } from "@pheralb/toast";
import { useRole } from "@/app/hooks/useRole";

interface CourseData {
  _id: string;
  nombre: string;
  slug: string;
  backgroundImage: string;
  cantidadAlumnos: number;
  cantidadTutores: number;
}

interface DownloadCoursesReportButtonProps {
  buttonLabel?: string;
}

export const DownloadCoursesReportButton = ({
  buttonLabel = "Descargar Reporte"
}: DownloadCoursesReportButtonProps) => {
  const { isAdmin } = useRole();

  // Solo mostrar el botón a administradores
  if (!isAdmin) {
    return null;
  }
  
  const generatePDF = async () => {
    try {
      toast.loading({
        text: "Generando reporte...",
      });

      const response = await api.get("/user-x-work-groups/courses/summary");
      const courses: CourseData[] = response.data.data;

      if (!courses || courses.length === 0) {
        toast.error({
          text: "No hay datos para generar el reporte",
        });
        return;
      }

      // Crear documento PDF
      const doc = new jsPDF();
      
      // Configurar colores
      const primaryColor: [number, number, number] = [41, 128, 185];
      const headerBg: [number, number, number] = [52, 73, 94];
      const textColor: [number, number, number] = [44, 62, 80];

      // Encabezado del documento
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, doc.internal.pageSize.width, 40, "F");
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("Reporte de Cursos", 14, 20);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const currentDate = new Date().toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      doc.text(`Fecha de generación: ${currentDate}`, 14, 30);

      // Información general
      doc.setTextColor(...textColor);
      doc.setFontSize(11);
      const totalAlumnos = courses.reduce((sum, c) => sum + c.cantidadAlumnos, 0);
      const totalTutores = courses.reduce((sum, c) => sum + c.cantidadTutores, 0);
      
      doc.text(`Total de cursos: ${courses.length}`, 14, 50);
      doc.text(`Total de alumnos: ${totalAlumnos}`, 14, 57);
      doc.text(`Total de tutores: ${totalTutores}`, 14, 64);

      // Preparar datos para la tabla
      const tableData = courses.map((course, index) => [
        (index + 1).toString(),
        course.nombre,
        course.cantidadAlumnos.toString(),
        course.cantidadTutores.toString(),
        (course.cantidadAlumnos + course.cantidadTutores).toString(),
      ]);

      // Generar tabla
      autoTable(doc, {
        head: [["#", "Nombre del Curso", "Alumnos", "Tutores", "Total Usuarios"]],
        body: tableData,
        startY: 75,
        theme: "grid",
        headStyles: {
          fillColor: headerBg,
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 10,
          halign: "center",
        },
        bodyStyles: {
          fontSize: 9,
          textColor: textColor,
        },
        alternateRowStyles: {
          fillColor: [240, 248, 255],
        },
        columnStyles: {
          0: { cellWidth: 10, halign: "center" },
          1: { cellWidth: 80 },
          2: { cellWidth: 30, halign: "center" },
          3: { cellWidth: 30, halign: "center" },
          4: { cellWidth: 40, halign: "center" },
        },
        margin: { top: 75, left: 14, right: 14 },
        didDrawPage: (data) => {
          // Pie de página
          const pageCount = doc.getNumberOfPages();
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.height || pageSize.getHeight();
          
          doc.setFontSize(8);
          doc.setTextColor(128, 128, 128);
          doc.text(
            `Página ${data.pageNumber} de ${pageCount}`,
            data.settings.margin.left,
            pageHeight - 10
          );
        },
      });

      // Guardar PDF
      doc.save(`reporte_cursos_${new Date().getTime()}.pdf`);
      
      toast.success({
        text: "Reporte generado exitosamente",
      });

    } catch (error) {
      console.error("Error al generar el reporte:", error);
      toast.error({
        text: "Error al generar el reporte",
      });
    }
  };

  return (
    <button
      onClick={generatePDF}
      className="bg-blue_principal hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow transition-all hover:scale-105 flex items-center gap-2"
    >
      <Download size={18} />
      {buttonLabel}
    </button>
  );
};
