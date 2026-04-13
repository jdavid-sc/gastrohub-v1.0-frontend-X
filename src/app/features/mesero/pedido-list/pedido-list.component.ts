import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PedidoService } from '../../../core/services/pedido.service';
import { PedidoResponse } from '../../../core/models/pedido.model';

@Component({
  selector: 'app-pedido-list',
  imports: [RouterLink, DecimalPipe, FormsModule],
  templateUrl: './pedido-list.component.html',
  styleUrl: './pedido-list.component.css'
})
export class PedidoListComponent implements OnInit {
  private pedidoService = inject(PedidoService);
  pedidos = signal<PedidoResponse[]>([]);
  procesando = signal<Set<string>>(new Set());
  busquedaId = signal<string>('');
  buscando = signal<boolean>(false);
  errorBusqueda = signal<string | null>(null);

  ngOnInit(): void {
    this.loadPedidos();
  }

  loadPedidos(): void {
    this.pedidoService.getAll().subscribe(data => this.pedidos.set(data));
  }

  buscarPorId(): void {
    const id = parseInt(this.busquedaId(), 10);
    if (isNaN(id) || id <= 0) {
      this.errorBusqueda.set('Ingresa un ID de pedido válido.');
      return;
    }
    this.buscando.set(true);
    this.errorBusqueda.set(null);
    this.pedidoService.getById(id).subscribe({
      next: (pedido) => {
        this.pedidos.set([pedido]);
        this.buscando.set(false);
      },
      error: (err) => {
        this.errorBusqueda.set(err?.error?.detail ?? `Pedido #${id} no encontrado.`);
        this.pedidos.set([]);
        this.buscando.set(false);
      }
    });
  }

  limpiarBusqueda(): void {
    this.busquedaId.set('');
    this.errorBusqueda.set(null);
    this.loadPedidos();
  }

  esProcesando(key: string): boolean {
    return this.procesando().has(key);
  }

  cerrarPedido(id: number): void {
    const key = `cerrar-${id}`;
    if (this.procesando().has(key)) return;
    this.procesando.update(s => new Set(s).add(key));
    this.pedidoService.cerrar(id).subscribe({
      next: (pedidoActualizado) => {
        this.pedidos.update(lista =>
          lista.map(p => p.id === id ? pedidoActualizado : p)
        );
        this.procesando.update(s => { const n = new Set(s); n.delete(key); return n; });
      },
      error: (err) => {
        alert(err?.error?.detail ?? 'Error al cerrar el pedido');
        this.procesando.update(s => { const n = new Set(s); n.delete(key); return n; });
      }
    });
  }

  generarPago(id: number): void {
    const key = `pago-${id}`;
    if (this.procesando().has(key)) return;
    this.procesando.update(s => new Set(s).add(key));
    this.pedidoService.registrarPago(id).subscribe({
      next: () => {
        this.loadPedidos();
        this.procesando.update(s => { const n = new Set(s); n.delete(key); return n; });
      },
      error: (err) => {
        alert(err?.error?.detail ?? 'Error al generar el pago');
        this.procesando.update(s => { const n = new Set(s); n.delete(key); return n; });
      }
    });
  }

  eliminarPedido(id: number): void {
    if (!confirm(`¿Estás seguro de que deseas eliminar el pedido #${id}? Esta acción no se puede deshacer.`)) return;
    const key = `eliminar-${id}`;
    if (this.procesando().has(key)) return;
    this.procesando.update(s => new Set(s).add(key));
    this.pedidoService.delete(id).subscribe({
      next: () => {
        this.pedidos.update(lista => lista.filter(p => p.id !== id));
        this.procesando.update(s => { const n = new Set(s); n.delete(key); return n; });
      },
      error: (err) => {
        alert(err?.error?.detail ?? 'Error al eliminar el pedido');
        this.procesando.update(s => { const n = new Set(s); n.delete(key); return n; });
      }
    });
  }
}
