import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DetallePedidoResponse, DetallePedidoUpdate } from '../models/pedido.model';

@Injectable({ providedIn: 'root' })
export class DetallePedidoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/detalle-pedidos`;

  getAll(): Observable<DetallePedidoResponse[]> {
    return this.http.get<DetallePedidoResponse[]>(`${this.apiUrl}/`);
  }

  getById(id: number): Observable<DetallePedidoResponse> {
    return this.http.get<DetallePedidoResponse>(`${this.apiUrl}/${id}`);
  }

  updateEstado(id: number, data: DetallePedidoUpdate): Observable<DetallePedidoResponse> {
    return this.http.patch<DetallePedidoResponse>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<DetallePedidoResponse> {
    return this.http.delete<DetallePedidoResponse>(`${this.apiUrl}/${id}`);
  }
}
