import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Mesa, MesaCreate } from '../models/mesa.model';

@Injectable({ providedIn: 'root' })
export class MesaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/mesas`;

  getAll(): Observable<Mesa[]> {
    return this.http.get<Mesa[]>(`${this.apiUrl}/`);
  }

  getDisponibles(): Observable<Mesa[]> {
    return this.http.get<Mesa[]>(`${this.apiUrl}/disponibles`);
  }

  getById(id: number): Observable<Mesa> {
    return this.http.get<Mesa>(`${this.apiUrl}/${id}`);
  }

  create(data: MesaCreate): Observable<Mesa> {
    return this.http.post<Mesa>(`${this.apiUrl}/`, data);
  }

  delete(id: number): Observable<Mesa> {
    return this.http.delete<Mesa>(`${this.apiUrl}/${id}`);
  }
}
