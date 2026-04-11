import { UserRole } from './enums';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: UserRole;
  activo: boolean;
}

export interface UsuarioCreate {
  nombre: string;
  email: string;
  password: string;
  rol: UserRole;
  activo?: boolean;
}

export interface UsuarioUpdate {
  nombre?: string;
  email?: string;
  password?: string;
  rol?: UserRole;
  activo?: boolean;
}
