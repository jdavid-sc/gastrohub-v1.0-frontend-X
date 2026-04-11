import { DetallePedidoEstado, PedidoEstado } from './enums';

// --- Requests ---

export interface DetallePedidoCreate {
  producto_id: number;
  cantidad: number;
  descripcion?: string;
}

export interface PedidoCreate {
  mesa_id: number;
  items: DetallePedidoCreate[];
}

export interface PedidoUpdateItem {
  detalle_id: number;
  cantidad: number | null;
  descripcion?: string;
}

export interface PedidoUpdateItems {
  items: PedidoUpdateItem[];
}

export interface DetallePedidoBulkCreate {
  items: DetallePedidoCreate[];
}

export interface DetallePedidoUpdate {
  estado: DetallePedidoEstado;
}

// --- Responses (sub-objetos anidados) ---

export interface UsuarioSimple {
  id: number;
  nombre: string;
}

export interface ProductoSimple {
  id: number;
  nombre: string;
}

export interface MesaSimple {
  id: number;
  numero: number;
}

export interface DetallePedidoResponse {
  id: number;
  pedido_id: number;
  producto: ProductoSimple;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  descripcion: string | null;
  estado: DetallePedidoEstado;
}

export interface PagoResponse {
  id: number;
  pedido_id: number;
  total: number;
  fecha: string;
}

export interface PedidoResponse {
  id: number;
  mesa: MesaSimple;
  mesero: UsuarioSimple;
  estado: PedidoEstado;
  fecha_creacion: string;
  fecha_actualizacion: string;
  total: number;
  detalles: DetallePedidoResponse[];
  pago: PagoResponse | null;
}
