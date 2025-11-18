"use client";

import CommentsSection from "@/app/components/Comments/CommentsSection";
import { FileText, Calendar, User } from "lucide-react";

/**
 * Ejemplo de página que muestra material de apoyo con comentarios
 * Puedes integrar este componente en:
 * - app/dashboard/my-courses/[slug]/page.tsx
 * - app/dashboard/my-courses/[slug]/materiales/[id]/page.tsx
 */

interface SupportMaterial {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  createdAt: string;
  autor: {
    nombre: string;
    imagen?: string;
  };
}

interface MaterialPageProps {
  material: SupportMaterial;
}

export default function MaterialPage({ material }: MaterialPageProps) {
  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      {/* Encabezado del Material */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="text-blue-600" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {material.titulo}
              </h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <User size={16} />
                  <span>{material.autor.nombre}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar size={16} />
                  <span>{new Date(material.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            {material.categoria}
          </span>
        </div>

        <div className="mt-4 text-gray-700">
          <p className="whitespace-pre-wrap">{material.descripcion}</p>
        </div>
      </div>

      {/* Sección de Comentarios */}
      <CommentsSection supportMaterialId={material.id} />
    </div>
  );
}

/**
 * EJEMPLO DE USO EN UNA PÁGINA EXISTENTE:
 * 
 * import CommentsSection from "@/app/components/Comments/CommentsSection";
 * 
 * // Dentro de tu componente
 * <div>
 *   {/* Tu contenido existente *\/}
 *   
 *   {/* Agregar sección de comentarios *\/}
 *   <CommentsSection supportMaterialId={publicacion._id} />
 * </div>
 */
