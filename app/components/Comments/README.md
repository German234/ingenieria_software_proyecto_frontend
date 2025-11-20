# Módulo de Comentarios

Este módulo proporciona funcionalidad completa para gestionar comentarios en materiales de apoyo del curso.

## ✅ Integración Completa

El módulo ya está **integrado** en la página principal de cursos:
- **Ubicación**: `app/dashboard/my-courses/[slug]/page.tsx`
- **Funcionalidad**: Los comentarios aparecen al expandir cada publicación
- **Acceso**: Automático para todos los usuarios autenticados

## 📁 Estructura de Archivos

```
app/
├── components/
│   └── Comments/
│       ├── CommentsSection.tsx      # Componente principal de comentarios
│       ├── CommentItem.tsx          # Componente individual de comentario
│       ├── ExampleUsage.tsx         # Ejemplo de uso
│       └── README.md               # Esta documentación
├── services/
│   └── comments.service.ts         # Servicio API para comentarios
└── types/
    └── types.ts                    # Tipos TypeScript (Comment, etc.)
```

## 🚀 Uso Básico

### Importar el Componente

```tsx
import CommentsSection from "@/app/components/Comments/CommentsSection";
```

### Usar en tu Página

```tsx
export default function MiPagina() {
  const supportMaterialId = "1bd31790-6848-4923-ab94-0a8c0449cb11"; // ID del material
  
  return (
    <div>
      {/* Tu contenido aquí */}
      
      {/* Sección de Comentarios */}
      <CommentsSection supportMaterialId={supportMaterialId} />
    </div>
  );
}
```

## 📦 Características

- ✅ **Ver comentarios**: Lista todos los comentarios de un material
- ✅ **Crear comentarios**: Los usuarios autenticados pueden comentar
- ✅ **Eliminar comentarios**: Solo el autor puede eliminar sus propios comentarios
- ✅ **Timestamps relativos**: Muestra "hace 5 minutos", "hace 2 horas", etc.
- ✅ **Validación**: Previene comentarios vacíos
- ✅ **Estados de carga**: Indicadores visuales durante operaciones
- ✅ **Notificaciones**: Toast messages para feedback al usuario
- ✅ **Responsive**: Diseño adaptable a diferentes pantallas

## 🎨 Diseño

El módulo incluye:
- Avatar del usuario (imagen o iniciales)
- Nombre del autor y timestamp
- Contenido del comentario
- Botón de eliminar (solo para el autor)
- Formulario de nuevo comentario con área de texto
- Estados de carga y vacío

## 🔌 API Endpoints Utilizados

### GET - Obtener comentarios
```
GET /comments/support-material/{supportMaterialId}
```

### POST - Crear comentario
```
POST /comments
Body: {
  "message": "Texto del comentario",
  "supportMaterialId": "id-del-material"
}
```

### DELETE - Eliminar comentario
```
DELETE /comments/{commentId}
```

## 🛠️ Tipos TypeScript

```typescript
interface Comment {
  id: string;
  message: string;
  supportMaterialId: string;
  userId: string;
  user: {
    id: string;
    nombre: string;
    image?: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}
```

## 💡 Ejemplo de Integración en Página de Curso

```tsx
"use client";

import { useState, useEffect } from "react";
import CommentsSection from "@/app/components/Comments/CommentsSection";
import { Publicacion } from "@/app/types/types";

export default function CursePage({ params }: { params: { slug: string } }) {
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Materiales del Curso</h1>
      
      {publicaciones.map((pub) => (
        <div key={pub._id} className="mb-8">
          {/* Información de la publicación */}
          <div className="bg-white rounded-lg shadow p-6 mb-4">
            <h2 className="text-xl font-bold">{pub.titulo}</h2>
            <p className="text-gray-600">{pub.descripcion}</p>
          </div>
          
          {/* Comentarios de esta publicación */}
          <CommentsSection supportMaterialId={pub._id} />
        </div>
      ))}
    </div>
  );
}
```

## 🔐 Autenticación

El componente requiere que el usuario esté autenticado para:
- Ver los comentarios (público)
- Crear comentarios (requiere sesión)
- Eliminar comentarios (solo el autor)

Usa el sistema de autenticación personalizado para verificar la sesión del usuario.

## 🎯 Personalización

Puedes personalizar:
- Estilos CSS/Tailwind
- Mensajes de error/éxito
- Validaciones del formulario
- Formato de fecha/hora

## 📝 Notas Importantes

1. El `supportMaterialId` debe ser el ID de la publicación/material de apoyo
2. Las notificaciones usan `@pheralb/toast`
3. Los íconos usan `lucide-react`
4. El formato de fecha usa `formatRelativeTime` de `/utils`

## 🐛 Troubleshooting

### Error: "Cannot find module '@/app/components/Comments/CommentsSection'"
- Verifica que el archivo existe en la ruta correcta
- Asegúrate de que el alias `@` está configurado en `tsconfig.json`

### Los comentarios no se cargan
- Verifica que el `supportMaterialId` es válido
- Revisa la consola del navegador para errores de API
- Confirma que el backend está corriendo y accesible

### No puedo eliminar comentarios
- Solo el autor del comentario puede eliminarlo
- Verifica que `session.info.userId` coincide con `comment.userId`

## 📚 Dependencias

- `next`: ^15.3.3
- `lucide-react`: ^0.513.0
- `@pheralb/toast`: ^1.0.0
- `axios`: ^1.9.0
