"use client";

import React, { useState } from "react";
import { FileDown } from "lucide-react";
import { toast } from "@pheralb/toast";
import { useRole } from "@/app/hooks/useRole";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { api } from "@/app/lib/api";

interface User {
  _id: string;
  nombre: string;
  email: string;
  image: string;
  isActive: boolean;
  workgroups: string[];
}

interface ExportReportButtonProps {
  endpoint: string;
  reportTitle: string;
  fileName?: string;
  className?: string;
}

const ExportReportButton: React.FC<ExportReportButtonProps> = ({
  endpoint,
  reportTitle,
  fileName = "reporte",
  className = "",
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const { isAdmin, isTutor } = useRole();

  // Solo mostrar el botón a administradores y tutores
  if (!isAdmin && !isTutor) {
    return null;
  }

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await api.get(endpoint);
      const users: User[] = response.data.data.usuarios || [];

      if (!users || users.length === 0) {
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
      doc.text(reportTitle, 14, 20);
      
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
      doc.text(`Total de registros: ${users.length}`, 14, 50);
      doc.text(`Activos: ${users.filter(u => u.isActive).length}`, 14, 57);
      doc.text(`Inactivos: ${users.filter(u => !u.isActive).length}`, 14, 64);

      // Preparar datos para la tabla
      const tableData = users.map((user, index) => [
        (index + 1).toString(),
        user.nombre,
        user.email,
        user.isActive ? "Activo" : "Inactivo",
        user.workgroups.join(", ") || "Sin asignar",
      ]);

      // Generar tabla
      autoTable(doc, {
        head: [["#", "Nombre", "Email", "Estado", "Work Groups"]],
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
          1: { cellWidth: 40 },
          2: { cellWidth: 50 },
          3: { cellWidth: 25, halign: "center" },
          4: { cellWidth: 55 },
        },
        margin: { top: 75, left: 14, right: 14 },
        didDrawPage: (data) => {
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

      doc.save(`${fileName}_${new Date().getTime()}.pdf`);

      toast.success({
        text: "Reporte generado exitosamente",
        description: "El archivo PDF se ha descargado correctamente",
      });
    } catch (error) {
      console.error("Error al exportar reporte:", error);
      toast.error({
        text: "Error al generar el reporte",
        description: "No se pudo descargar el archivo PDF",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-md transition-all duration-200 ${
        isExporting
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-blue_principal hover:bg-blue-600 hover:scale-105"
      } text-white ${className}`}
    >
      <FileDown size={18} className={isExporting ? "animate-pulse" : ""} />
      <span className="hidden md:inline">
        {isExporting ? "Generando..." : "Exportar Reporte"}
      </span>
    </button>
  );
};

export default ExportReportButton;
