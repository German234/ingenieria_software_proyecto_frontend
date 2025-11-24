# Círculos de Estudio - Frontend

## Descripción del proyecto

Círculos de Estudio es una plataforma web desarrollada con Next.js y React diseñada para gestionar grupos académicos, publicaciones internas y control de asistencia de estudiantes en actividades de apoyo académico / servicio social. Su objetivo principal es centralizar la relación con el Tutor, Alumno y Administración, y dejar trazabilidad de asistencia, comunicación y material de apoyo.

### Características principales

#### Autenticación y seguridad
- Implementa inicio de sesión seguro mediante tokens JWT y OAuth2 con Keycloak
- Manejo de sesiones y protección de endpoints
- Control de acceso basado en roles (administradores, tutores, alumnos)

#### Gestión de alumnos, tutores y cursos
- Administración de información de usuarios y sus relaciones dentro de grupos de estudio
- Organización y asignación de tutores a cursos
- Jerarquía clara de roles con diferentes niveles de permisos

#### Sistema de publicaciones
- Creación de publicaciones con contenido académico visible para alumnos
- Soporte para texto, imágenes y documentos adjuntos
- Fomenta la comunicación y el intercambio de material

#### Historial de asistencia
- Vista mensual con filtros por mes y año
- Consulta y control de asistencia de estudiantes a tutorías
- Registro detallado para seguimiento del progreso

#### Subida de imágenes y archivos
- Adjuntar recursos multimedia y documentos a publicaciones
- Gestión organizada del almacenamiento y acceso a archivos

#### Comentarios y comunicación
- Sistema de comentarios para interacción entre tutores y alumnos
- Resolución de dudas y compartir ideas dentro de cada grupo de estudio

#### Gestión de materiales de apoyo
- Almacenamiento centralizado de documentos de estudio, guías y recursos educativos
- Asignación de materiales a grupos específicos

## Requisitos previos

- **Node.js**: Versión 18.17.0 o superior
- **npm**: Versión 9.0.0 o superior (o yarn/pnpm/bun equivalentes)
- **Backend API**: Servidor backend corriendo en la URL configurada (por defecto: `https://refuerzo-mendoza.me/apiv2`)
- **Keycloak**: Servidor de autenticación Keycloak configurado (opcional, para autenticación OAuth2)

### Dependencias principales

- **Next.js 15.3.3**: Framework de React para aplicaciones web
- **React 19.0.0**: Biblioteca para construir interfaces de usuario
- **TypeScript 5**: Superset de JavaScript con tipado estático
- **Tailwind CSS 4.1.8**: Framework de CSS para diseño
- **HeroUI**: Componentes UI para React
- **Axios 1.9.0**: Cliente HTTP para realizar peticiones a la API
- **React Query 5.80.7**: Gestión de estado y caché de datos del servidor
- **jsPDF 3.0.4**: Generación de documentos PDF

## Instalación paso a paso

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd ingenieria_software_proyecto_frontend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   # o
   yarn install
   # o
   pnpm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env.local
   ```
   Editar el archivo `.env.local` con las configuraciones correspondientes (ver sección de Variables de entorno).

4. **Ejecutar el proyecto en modo desarrollo**
   ```bash
   npm run dev
   # o
   yarn dev
   # o
   pnpm dev
   # o
   bun dev
   ```

5. **Abrir la aplicación en el navegador**
   Navegar a [http://localhost:3000](http://localhost:3000)

## Ejecución

### Modo desarrollo
```bash
npm run dev
```
Inicia el servidor de desarrollo en [http://localhost:3000](http://localhost:3000) con recarga automática en cada cambio.

### Modo producción
```bash
npm run build
npm start
```
Construye la aplicación optimizada para producción y la sirve en [http://localhost:3000](http://localhost:3000).

### Linting
```bash
npm run lint
```
Ejecuta ESLint para verificar el código y encontrar posibles errores.

## Variables de entorno

El proyecto utiliza las siguientes variables de entorno que deben configurarse en un archivo `.env.local`:

```env
# URL de la API del backend
NEXT_PUBLIC_API2_URL=https://refuerzo-mendoza.me/apiv2

# Configuración de Keycloak (OAuth2/OIDC)
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=frontend-client
NEXT_PUBLIC_KEYCLOAK_CLIENT_SECRET=
NEXT_PUBLIC_KEYCLOAK_REALM=refuerzo
NEXT_PUBLIC_KEYCLOAK_SERVER_URL=https://auth.refuerzo-mendoza.me
NEXT_PUBLIC_KEYCLOAK_REDIRECT_URI=http://localhost:3000/auth/callback

# Configuración de reCAPTCHA
NEXT_PUBLIC_SITE_KEY_RECAPTCHA=tu_clave_recaptcha

# ID de imagen por defecto para nuevos usuarios
NEXT_PUBLIC_DEFAULT_IMAGE_ID=id_imagen_por_defecto

# Configuración de cookies (automática según NODE_ENV)
NODE_ENV=development  # o production
```

### Explicación de las variables

- **NEXT_PUBLIC_API2_URL**: URL base de la API del backend donde se realizan todas las peticiones HTTP.
- **NEXT_PUBLIC_KEYCLOAK_CLIENT_ID**: ID del cliente configurado en Keycloak para esta aplicación.
- **NEXT_PUBLIC_KEYCLOAK_CLIENT_SECRET**: Secreto del cliente de Keycloak (opcional para clientes públicos).
- **NEXT_PUBLIC_KEYCLOAK_REALM**: Realm de Keycloak donde está configurada la aplicación.
- **NEXT_PUBLIC_KEYCLOAK_SERVER_URL**: URL del servidor Keycloak.
- **NEXT_PUBLIC_KEYCLOAK_REDIRECT_URI**: URL de redirección después del inicio de sesión con Keycloak.
- **NEXT_PUBLIC_SITE_KEY_RECAPTCHA**: Clave del sitio de Google reCAPTCHA v3 para protección contra bots.
- **NEXT_PUBLIC_DEFAULT_IMAGE_ID**: ID del documento de imagen por defecto para nuevos usuarios.
- **NODE_ENV**: Entorno de ejecución (development/production), afecta la configuración de cookies y otras características.

## Estructura del proyecto

```
├── app/                    # Directorio principal de la aplicación (App Router)
│   ├── auth/              # Páginas de autenticación
│   ├── components/        # Componentes reutilizables
│   │   ├── Auth/         # Componentes de autenticación
│   │   ├── Dashboard/    # Componentes del dashboard
│   │   ├── Fields/       # Campos de formulario
│   │   ├── Popups/       # Modales y popups
│   │   └── Tables/       # Componentes de tablas
│   ├── constants/        # Constantes de la aplicación
│   ├── contexts/         # Contextos de React
│   ├── dashboard/        # Páginas del dashboard
│   ├── hooks/            # Hooks personalizados
│   ├── lib/              # Utilidades y configuración
│   ├── services/         # Servicios de API
│   ├── types/            # Definiciones de TypeScript
│   └── utils/            # Funciones utilitarias
├── public/                # Archivos estáticos
├── utils/                # Utilidades adicionales
├── .env.example         # Ejemplo de variables de entorno
├── .gitignore           # Archivos ignorados por Git
├── eslint.config.mjs    # Configuración de ESLint
├── next.config.ts       # Configuración de Next.js
├── package.json         # Dependencias y scripts
├── postcss.config.mjs   # Configuración de PostCSS
├── tailwind.config.js   # Configuración de Tailwind CSS
└── tsconfig.json        # Configuración de TypeScript
```

## Tecnologías utilizadas

- **Frontend**: Next.js 15.3.3, React 19.0.0, TypeScript 5
- **Estilos**: Tailwind CSS 4.1.8, HeroUI 2.8.0-beta.10
- **Estado**: React Query 5.80.7, Context API
- **HTTP**: Axios 1.9.0 con interceptores personalizados
- **Autenticación**: JWT, OAuth2/OIDC con Keycloak
- **PDF**: jsPDF 3.0.4 con jsPDF-autotable
- **Formularios**: Componentes personalizados con validación
- **Notificaciones**: @pheralb/toast
- **Iconos**: Lucide React
