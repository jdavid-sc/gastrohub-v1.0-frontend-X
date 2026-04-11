import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  PedidoCreate,
  PedidoResponse,
  PedidoUpdateItems,
  DetallePedidoBulkCreate,
  DetallePedidoResponse,
  PagoResponse
} from '../models/pedido.model';

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/pedidos`;

  getAll(): Observable<PedidoResponse[]> {
    return this.http.get<PedidoResponse[]>(`${this.apiUrl}/`);
  }

  getById(id: number): Observable<PedidoResponse> {
    return this.http.get<PedidoResponse>(`${this.apiUrl}/${id}`);
  }

  create(data: PedidoCreate): Observable<PedidoResponse> {
    return this.http.post<PedidoResponse>(`${this.apiUrl}/`, data);
  }

  delete(id: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/${id}`);
  }

  updateItems(pedidoId: number, data: PedidoUpdateItems): Observable<{ message: string; pedido: PedidoResponse }> {
    return this.http.patch<{ message: string; pedido: PedidoResponse }>(`${this.apiUrl}/${pedidoId}/items`, data);
  }

  addDetalles(pedidoId: number, data: DetallePedidoBulkCreate): Observable<{ message: string; nuevos_detalles: DetallePedidoResponse[] }> {
    return this.http.post<{ message: string; nuevos_detalles: DetallePedidoResponse[] }>(`${this.apiUrl}/${pedidoId}/detalles`, data);
  }

  cerrar(pedidoId: number): Observable<PedidoResponse> {
    return this.http.post<PedidoResponse>(`${this.apiUrl}/${pedidoId}/cerrar`, {});
  }

  registrarPago(pedidoId: number): Observable<PagoResponse> {
    return this.http.post<PagoResponse>(`${this.apiUrl}/${pedidoId}/pago`, {});
  }
}
