import { Component, signal, inject, OnInit } from '@angular/core';
import { DetallePedidoService } from '../../../core/services/detalle-pedido.service';
import { AuthService } from '../../../core/services/auth.service';
import { DetallePedidoResponse } from '../../../core/models/pedido.model';
import { DetallePedidoEstado } from '../../../core/models/enums';

@Component({
  selector: 'app-produccion',
  templateUrl: './produccion.component.html',
  styleUrl: './produccion.component.css'
})
export class ProduccionComponent implements OnInit {
  private detalleService = inject(DetallePedidoService);
  authService = inject(AuthService);
  detalles = signal<DetallePedidoResponse[]>([]);

  ngOnInit(): void {
    this.loadDetalles();
  }

  loadDetalles(): void {
    this.detalleService.getAll().subscribe(data => this.detalles.set(data));
  }

  cambiarEstado(id: number, nuevoEstado: string): void {
    this.detalleService.updateEstado(id, { estado: nuevoEstado as DetallePedidoEstado }).subscribe(() => {
      this.loadDetalles();
    });
  }

  onLogout(): void {
    this.authService.logout();
  }
}
