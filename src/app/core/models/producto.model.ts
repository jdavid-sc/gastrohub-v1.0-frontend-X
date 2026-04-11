export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  disponible: boolean;
}

export interface ProductoCreate {
  nombre: string;
  descripcion?: string;
  precio: number;
  disponible?: boolean;
}

export interface ProductoUpdate {
  nombre?: string;
  descripcion?: string;
  precio?: number;
  disponible?: boolean;
}
