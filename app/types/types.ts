export interface RequestPassResponse {
  statusCode: number;
  message: string;
}

export interface UserInfo {
  id: string;
  nombreCompleto: string;
  email: string;
  image: string;
  isActive: boolean;
  role: string;
}

export interface AuthResponse {
  statusCode: number;
  message: string;
  data?: {
    token: string;
    info: UserInfo;
  };
}

export interface CallbackResponse {
  data?: string;
  userInfo?: UserInfo;
  accessToken?: string;
  token?: string;
  refreshToken?: string;
  expiresIn?: number;
  statusCode?: number;
}

export interface ActivateAccountRequirements {
  imageDocumentId?: string;
  password?: string;
}

export interface UserEdited {
  _id: string;
  nombres: string;
  imagen: string;
  email: string;
}

export interface FileNew {
  id: string;
  originalFileName: string;
  url: string;
  tipo: string;
  category: string;
  file: File;
  data: {
    url: string;
    documentId: string;
    fileName: string;
  };
}

export type FilePublicacion = Pick<
  FileNew,
  "id" | "originalFileName" | "url" | "tipo"
>;

export interface Publicacion {
  _id: string;
  descripcion: string;
  categoria: string;
  workgroupId: string;
  documentIds: string[];
  documentos?: {
    id: string;
    originalFilename: string;
    url: string;
    tipo: string;
  }[];
  files: FilePublicacion[];
  seccionId: string;
  titulo: string;
  createdAt: string;
  updatedAt: string;
}

export interface CourseAddInterface {
  workGroupName?: string;
  backgroundImageId: string;
  name?: string;
  userIds: string[];
  id?: string;
}

export interface Course {
  _id: string;
  nombre: string;
  gradoId: string;
  backgroundImage: string;
  tutores: {
    _id: string;
    nombre: string;
    image: string;
    email: string;
    telefono: string;
  }[];
  alumnos: {
    _id: string;
    nombre: string;
    image: string;
    email: string;
    telefono: string;
    userXWorkgroupId: string;
  }[];
  slug: string;
  createdAt: string;
  updatedAt: string;
  publicaciones?: Publicacion[];
  workGroupName?: string;
  backgroundImageId?: string;
  name?: string;
  userIds?: string[];
  id?: string;
}

export interface CourseResponse {
  statusCode: number;
  message: string;
  data: Course[] | Course;
  size: number;
  totalPages: number;
  page: number;
  limit: number;
}

export interface ColumnWithKey<T> {
  header: string;
  accessor: keyof T;
  sortable?: boolean;
}

export interface ColumnWithFunction<T> {
  header: string;
  accessor: (row: T) => React.ReactNode;
  sortable?: boolean;
}

export type Column<T> = ColumnWithKey<T> | ColumnWithFunction<T>;

export interface TableProps<T> {
  data: T[];
  loading: boolean;
  columns: Column<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (itemId: string) => void;
  handleMove?: (item: T) => void;
  hasMove?: boolean;
  hasEdit?: boolean;
}

export interface Image {
  id?: string;
  originalFilename: string;
  category: string;
  file: File;
}

export interface ImageResponse {
  message: string;
  data: {
    id: string;
    url: string;
    imageId: string;
    fileName: string;
  };
}

export interface AsistenciaAlumno {
  id?: string;
  userXWorkGroupId: string;
  fecha: string;
  estado: string;
  nombre: string;
  imagen: string;
}

export interface AsistenciaEncargado {
  id?: string;
  _id?: string;
  userId: string;
  fecha: string;
  estado: string;
  hora_inicio: string;
  hora_fin: string;
  nombre?: string;
  imagen?: string;
}

export interface HistoryAsistenciaResponse<T> {
  statusCode: number;
  message: string;
  data: Record<string, T[]>;
}

export interface RawAsistenciaAlumno {
  id: string;
  alumnoId: string;
  fecha: string;
  estado: string;
  nombre: string;
  imagen: string;
}

export interface Asistencia {
  _id: string;
  id?: string;
  seccionId: string;
  fecha?: string;
  estado?: string;
  nombre?: string;
  alumnoId?: string;
  imagen?: string;
  alumnos: AsistenciaAlumno[];
  encargados: AsistenciaEncargado[];
}

export interface AsistenciaResponse {
  statusCode: number;
  message: string;
  data: Asistencia[];
  size: number;
  totalPages: number;
  page: number;
  limit: number;
}

export interface Estudiante {
  _id: string;
  workgroups: string[];
  nombre: string;
  name: string;
  imageDocumentId: string;
  roleName: string;
  image: string;
  email: string;
  password?: string;
}

export interface GetEstudiantesResponse {
  data: Estudiante[];
  size: number;
  totalPages: number;
  page: number;
  limit: number;
  statusCode: number;
  message: string;
}

export interface Tutor {
  _id: string;
  nombre: string;
  email: string;
  name: string;
  isActive: boolean;
  imageDocumentId: string;
  roleName: string;
  password?: string;
  image: string;
  workgroups: string[];
}

export interface TutorResponse {
  statusCode: number;
  message: string;
  data: Tutor[];
  size: number;
  totalPages: number;
  page: number;
  limit: number;
}

// types/asistencia-entry.ts
export interface AsistenciaEntryDto {
  id: string; // obligatorio
  alumnoId?: string; // viene si es alumno
  userId?: string; // viene si es encargado
  fecha: string;
  estado: string;
  nombre: string;
  imagen: string;
  hora_inicio?: string;
  hora_fin?: string;
}

export interface AsistenciaEntryResponse {
  statusCode: number;
  message: string;
  data: AsistenciaEntryDto[];
  size: number;
  totalPages: number;
  page: number;
  limit: number;
}

// Comment types
export interface Comment {
  id: string;
  message: string;
  userName: string;
  userEmail: string;
  userProfilePicture?: string;
  createdAt: string;
}

export interface CommentResponse {
  statusCode: number;
  message: string;
  data: Comment[];
}

export interface CreateCommentDto {
  message: string;
  supportMaterialId: string;
}

export interface DeleteCommentResponse {
  statusCode: number;
  message: string;
}

// Keycloak OAuth/OIDC types
export interface KeycloakTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  refresh_expires_in: number;
  id_token: string;
  session_state?: string;
  scope?: string;
}

export interface KeycloakUserInfo {
  sub: string;
  email_verified: boolean;
  name?: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  email?: string;
  picture?: string;
  roles?: string[];
}

export interface KeycloakCallbackParams {
  code?: string;
  state?: string;
  session_state?: string;
  error?: string;
  error_description?: string;
}

export interface KeycloakConfig {
  clientId: string;
  clientSecret: string;
  realm: string;
  serverUrl: string;
  redirectUri: string;
}
