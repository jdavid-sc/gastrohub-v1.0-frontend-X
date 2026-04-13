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
  producto_id: number;
  producto: ProductoSimple;
  cantidad: number;
  precio_unitario: string;
  subtotal: string;
  descripcion: string | null;
  estado: DetallePedidoEstado;
}

export interface PagoResponse {
  id: number;
  pedido_id: number;
  total: string;
  fecha: string;
}

export interface PedidoResponse {
  id: number;
  fecha: string;
  estado: PedidoEstado;
  mesa_id: number;
  usuario_id: number;
  mesa: MesaSimple;
  usuario: UsuarioSimple;
  detalles: DetallePedidoResponse[];
  pago: PagoResponse | null;
}
