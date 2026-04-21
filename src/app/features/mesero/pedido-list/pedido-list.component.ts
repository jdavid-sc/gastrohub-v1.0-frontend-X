import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { PedidoService } from '../../../core/services/pedido.service';
import { PedidoResponse } from '../../../core/models/pedido.model';
import { DetallePedidoEstado } from '../../../core/models/enums';

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

  readonly pageSize = 10;
  paginaActual = signal(1);

  pedidosOrdenados = computed(() => {
    const porFecha = (a: PedidoResponse, b: PedidoResponse) =>
      new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
    return [
      ...this.pedidos().filter(p => p.estado === 'ABIERTO').sort(porFecha),
      ...this.pedidos().filter(p => p.estado !== 'ABIERTO').sort(porFecha),
    ];
  });

  totalPaginas = computed(() => Math.max(1, Math.ceil(this.pedidosOrdenados().length / this.pageSize)));

  pedidosPaginados = computed(() => {
    const inicio = (this.paginaActual() - 1) * this.pageSize;
    return this.pedidosOrdenados().slice(inicio, inicio + this.pageSize);
  });

  paginas = computed(() => Array.from({ length: this.totalPaginas() }, (_, i) => i + 1));

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
        this.paginaActual.set(1);
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
    this.paginaActual.set(1);
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

  cambiarPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas()) return;
    this.paginaActual.set(pagina);
  }

  eliminarPedido(id: number): void {
    const pedido = this.pedidos().find(p => p.id === id);
    const tieneEnProceso = pedido?.detalles.some(
      d => d.estado === DetallePedidoEstado.PREPARANDO || d.estado === DetallePedidoEstado.LISTO
    );

    if (tieneEnProceso) {
      Swal.fire({
        title: 'No se puede eliminar',
        text: 'Este pedido tiene productos en preparación o ya finalizados. No es posible eliminarlo.',
        icon: 'error',
        confirmButtonColor: '#e53e3e',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    Swal.fire({
      title: '¿Eliminar pedido?',
      text: `¿Estás seguro de que deseas eliminar el Pedido #${id}? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e53e3e',
      cancelButtonColor: '#718096',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (!result.isConfirmed) return;
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
    });
  }
}
