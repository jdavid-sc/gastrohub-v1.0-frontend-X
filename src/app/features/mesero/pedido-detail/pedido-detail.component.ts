import { Component, signal, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DecimalPipe, DatePipe } from '@angular/common';
import Swal from 'sweetalert2';
import { PedidoService } from '../../../core/services/pedido.service';
import { PedidoResponse } from '../../../core/models/pedido.model';
import { ProductoService } from '../../../core/services/producto.service';
import { Producto } from '../../../core/models/producto.model';
import { DetallePedidoService } from '../../../core/services/detalle-pedido.service';

@Component({
  selector: 'app-pedido-detail',
  imports: [RouterLink, DecimalPipe, DatePipe],
  templateUrl: './pedido-detail.component.html',
  styleUrl: './pedido-detail.component.css'
})
export class PedidoDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private pedidoService = inject(PedidoService);
  private productoService = inject(ProductoService);
  private detallePedidoService = inject(DetallePedidoService);

  pedido = signal<PedidoResponse | null>(null);
  message = signal('');

  // --- Modal agregar productos ---
  mostrarModal = signal(false);
  productos = signal<Producto[]>([]);
  itemsNuevos = signal<{ producto_id: number; cantidad: number }[]>([]);
  loadingModal = signal(false);

  // --- Modal editar cantidad de detalle ---
  mostrarModalEditar = signal(false);
  detalleEditando = signal<{ id: number; nombre: string; cantidad: number } | null>(null);
  cantidadEditar = signal(1);
  loadingEditar = signal(false);

  ngOnInit(): void {
    this.loadPedido();
  }

  loadPedido(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.pedidoService.getById(id).subscribe(data => this.pedido.set(data));
  }

  cerrarPedido(): void {
    const p = this.pedido();
    if (!p) return;
    this.pedidoService.cerrar(p.id).subscribe({
      next: (updated) => {
        this.pedido.set(updated);
        this.message.set('Pedido cerrado exitosamente.');
      },
      error: (err) => this.message.set(err.error?.detail ?? 'Error al cerrar.')
    });
  }

  registrarPago(): void {
    const p = this.pedido();
    if (!p) return;
    this.pedidoService.registrarPago(p.id).subscribe({
      next: () => {
        this.loadPedido();
        this.message.set('Pago registrado exitosamente.');
      },
      error: (err) => this.message.set(err.error?.detail ?? 'Error al registrar pago.')
    });
  }

  eliminarPedido(): void {
    const p = this.pedido();
    if (!p) return;
    Swal.fire({
      title: '¿Eliminar pedido?',
      text: `¿Estás seguro de que deseas eliminar el Pedido #${p.id}? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e53e3e',
      cancelButtonColor: '#718096',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.pedidoService.delete(p.id).subscribe({
          next: () => this.router.navigate(['/mesero/pedidos']),
          error: (err) => this.message.set(err.error?.detail ?? 'Error al eliminar.')
        });
      }
    });
  }

  // --- Lógica modal modificar pedido ---

  abrirModalModificar(): void {
    this.message.set('');
    if (this.productos().length === 0) {
      this.productoService.getAll().subscribe(data => {
        const disponibles = data.filter(p => p.disponible);
        this.productos.set(disponibles);
        if (disponibles.length > 0) {
          this.itemsNuevos.set([{ producto_id: disponibles[0].id, cantidad: 1 }]);
        }
      });
    } else {
      const primero = this.productos()[0];
      this.itemsNuevos.set([{ producto_id: primero.id, cantidad: 1 }]);
    }
    this.mostrarModal.set(true);
  }

  cerrarModal(): void {
    this.mostrarModal.set(false);
    this.itemsNuevos.set([]);
    this.loadingModal.set(false);
  }

  updateItem(index: number, field: 'producto_id' | 'cantidad', value: number): void {
    this.itemsNuevos.update(items => {
      const copy = [...items];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  }

  agregarFila(): void {
    const primero = this.productos()[0];
    if (!primero) return;
    this.itemsNuevos.update(items => [...items, { producto_id: primero.id, cantidad: 1 }]);
  }

  removerFila(index: number): void {
    this.itemsNuevos.update(items => items.filter((_, i) => i !== index));
  }

  confirmarModificar(): void {
    const p = this.pedido();
    if (!p) return;

    const items = this.itemsNuevos();
    if (items.length === 0) {
      this.message.set('Agrega al menos un producto.');
      return;
    }
    if (items.some(i => i.cantidad < 1)) {
      this.message.set('La cantidad de cada producto debe ser al menos 1.');
      return;
    }

    this.loadingModal.set(true);
    this.pedidoService.addDetalles(p.id, { items }).subscribe({
      next: (res) => {
        this.loadingModal.set(false);
        this.cerrarModal();
        this.loadPedido();
        this.message.set(res.message);
      },
      error: (err) => {
        this.loadingModal.set(false);
        this.message.set(err.error?.detail ?? 'Error al modificar el pedido.');
      }
    });
  }

  // --- Eliminar detalle (producto del pedido) ---

  eliminarDetalle(detalleId: number): void {
    this.message.set('');
    this.detallePedidoService.delete(detalleId).subscribe({
      next: () => {
        this.loadPedido();
        this.message.set('Producto eliminado del pedido.');
      },
      error: (err) => this.message.set(err.error?.detail ?? 'Error al eliminar el producto.')
    });
  }

  // --- Editar cantidad de un detalle ---

  abrirModalEditar(detalleId: number, nombre: string, cantidadActual: number): void {
    this.message.set('');
    this.detalleEditando.set({ id: detalleId, nombre, cantidad: cantidadActual });
    this.cantidadEditar.set(cantidadActual);
    this.mostrarModalEditar.set(true);
  }

  cerrarModalEditar(): void {
    this.mostrarModalEditar.set(false);
    this.detalleEditando.set(null);
    this.loadingEditar.set(false);
  }

  confirmarEditar(): void {
    const p = this.pedido();
    const detalle = this.detalleEditando();
    if (!p || !detalle) return;

    const nuevaCantidad = this.cantidadEditar();
    if (nuevaCantidad < 1) {
      this.message.set('La cantidad debe ser al menos 1.');
      return;
    }

    this.loadingEditar.set(true);
    this.pedidoService.updateItems(p.id, {
      items: [{ detalle_id: detalle.id, cantidad: nuevaCantidad }]
    }).subscribe({
      next: () => {
        this.loadingEditar.set(false);
        this.cerrarModalEditar();
        this.loadPedido();
        this.message.set('Cantidad actualizada correctamente.');
      },
      error: (err) => {
        this.loadingEditar.set(false);
        this.message.set(err.error?.detail ?? 'Error al actualizar la cantidad.');
      }
    });
  }
}
