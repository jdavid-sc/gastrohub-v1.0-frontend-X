import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PagoResponse } from '../models/pedido.model';

@Injectable({ providedIn: 'root' })
export class PagoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/pagos`;

  getAll(): Observable<PagoResponse[]> {
    return this.http.get<PagoResponse[]>(`${this.apiUrl}/`);
  }

  getById(id: number): Observable<PagoResponse> {
    return this.http.get<PagoResponse>(`${this.apiUrl}/${id}`);
  }

  filtrarPorFecha(fechaInicio: string, fechaFin: string): Observable<PagoResponse[]> {
    return this.http.get<PagoResponse[]>(`${this.apiUrl}/filtrar`, {
      params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin }
    });
  }
}
