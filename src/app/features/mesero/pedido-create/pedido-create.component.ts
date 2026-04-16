import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { MesaService } from '../../../core/services/mesa.service';
import { ProductoService } from '../../../core/services/producto.service';
import { PedidoService } from '../../../core/services/pedido.service';
import { Mesa } from '../../../core/models/mesa.model';
import { Producto } from '../../../core/models/producto.model';
import { DetallePedidoCreate } from '../../../core/models/pedido.model';

interface ItemCarrito {
  producto: Producto;
  cantidad: number;
  descripcion: string;
}

@Component({
  selector: 'app-pedido-create',
  imports: [FormsModule, DecimalPipe],
  templateUrl: './pedido-create.component.html',
  styleUrl: './pedido-create.component.css'
})
export class PedidoCreateComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  cancelar(): void {
    this.router.navigate(['/mesero/mesas']);
  }
  private mesaService = inject(MesaService);
  private productoService = inject(ProductoService);
  private pedidoService = inject(PedidoService);

  mesasLibres = signal<Mesa[]>([]);
  productosDisponibles = signal<Producto[]>([]);
  filtroNombre = signal('');
  productosFiltrados = computed(() =>
    this.productosDisponibles().filter(p =>
      p.nombre.toLowerCase().includes(this.filtroNombre().toLowerCase())
    )
  );
  carrito = signal<ItemCarrito[]>([]);
  errorMessage = signal('');
  mesaSeleccionada = 0;

  cantidades: Record<number, number> = {};
  descripciones: Record<number, string> = {};

  totalEstimado = () => this.carrito().reduce((sum, item) => sum + item.producto.precio * item.cantidad, 0);

  ngOnInit(): void {
    this.mesaService.getDisponibles().subscribe(data => {
      this.mesasLibres.set(data);
      const mesaQuery = this.route.snapshot.queryParamMap.get('mesa');
      if (mesaQuery) {
        this.mesaSeleccionada = +mesaQuery;
      }
    });

    this.productoService.getAll().subscribe(data => {
      this.productosDisponibles.set(data.filter(p => p.disponible));
    });
  }

  agregarItem(prod: Producto): void {
    const cantidad = this.cantidades[prod.id] ?? 1;
    if (cantidad < 1) return;

    const current = this.carrito();
    const existing = current.find(i => i.producto.id === prod.id);
    if (existing) {
      this.carrito.set(current.map(i =>
        i.producto.id === prod.id ? { ...i, cantidad: i.cantidad + cantidad } : i
      ));
    } else {
      this.carrito.set([...current, {
        producto: prod,
        cantidad,
        descripcion: this.descripciones[prod.id] ?? ''
      }]);
    }
    this.cantidades[prod.id] = 1;
    this.descripciones[prod.id] = '';
  }

  removeItem(productoId: number): void {
    this.carrito.set(this.carrito().filter(i => i.producto.id !== productoId));
  }

  enviarPedido(): void {
    if (!this.mesaSeleccionada || this.carrito().length === 0) {
      this.errorMessage.set('Selecciona una mesa y al menos un producto.');
      return;
    }

    const items: DetallePedidoCreate[] = this.carrito().map(i => ({
      producto_id: i.producto.id,
      cantidad: i.cantidad,
      descripcion: i.descripcion || undefined
    }));

    this.pedidoService.create({
      mesa_id: this.mesaSeleccionada,
      items
    }).subscribe({
      next: (pedido) => {
        this.router.navigate(['/mesero/pedidos', pedido.id]);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.detail ?? 'Error al crear el pedido.');
      }
    });
  }
}
