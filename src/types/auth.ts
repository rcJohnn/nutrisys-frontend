export interface LoginRequest {
  Correo: string;
  Password: string;
}

export interface LoginResponse {
  Exito: boolean;
  Mensaje: string;
  Id?: number;
  Tipo?: string;
  NombreCompleto?: string;
  Correo?: string;
}

export interface Usuario {
  Id_Usuario: number;
  Nombre: string;
  Prim_Apellido: string;
  Seg_Apellido: string;
  Cedula: string;
  Sexo: string;
  Telefono: string;
  Correo: string;
  Observaciones?: string;
  Estado: string;
  FechaNacimiento: string;
}