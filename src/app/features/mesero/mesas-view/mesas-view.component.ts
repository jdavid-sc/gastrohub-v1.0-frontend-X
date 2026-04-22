import { Component, signal, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MesaService } from '../../../core/services/mesa.service';
import { AuthService } from '../../../core/services/auth.service';
import { Mesa } from '../../../core/models/mesa.model';

@Component({
  selector: 'app-mesas-view',
  templateUrl: './mesas-view.component.html',
  styleUrl: './mesas-view.component.css'
})
export class MesasViewComponent implements OnInit {
  private mesaService = inject(MesaService);
  private router = inject(Router);
  authService = inject(AuthService);

  mesas = signal<Mesa[]>([]);

  ngOnInit(): void {
    this.loadMesas();
  }

  loadMesas(): void {
    this.mesaService.getAll().subscribe(data => this.mesas.set(data));
  }

  crearPedido(mesaId: number): void {
    this.router.navigate(['/mesero/pedidos/nuevo'], { queryParams: { mesa: mesaId } });
  }

  verPedidos(): void {
    this.router.navigate(['/mesero/pedidos']);
  }

  irAlDashboard(): void {
    this.router.navigate(['/admin/dashboard']);
  }

  onLogout(): void {
    this.authService.logout();
  }
}
