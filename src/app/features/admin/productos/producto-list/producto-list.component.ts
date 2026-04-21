import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { ProductoService } from '../../../../core/services/producto.service';
import { Producto } from '../../../../core/models/producto.model';

@Component({
  selector: 'app-producto-list',
  imports: [RouterLink, DecimalPipe, FormsModule],
  templateUrl: './producto-list.component.html',
  styleUrl: './producto-list.component.css'
})
export class ProductoListComponent implements OnInit {
  private productoService = inject(ProductoService);
  productos = signal<Producto[]>([]);
  busquedaId = signal<string>('');
  buscando = signal<boolean>(false);
  errorBusqueda = signal<string | null>(null);

  readonly pageSize = 10;
  paginaActual = signal(1);

  productosOrdenados = computed(() =>
    [...this.productos()].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
  );

  totalPaginas = computed(() => Math.max(1, Math.ceil(this.productosOrdenados().length / this.pageSize)));

  productosPaginados = computed(() => {
    const inicio = (this.paginaActual() - 1) * this.pageSize;
    return this.productosOrdenados().slice(inicio, inicio + this.pageSize);
  });

  paginas = computed(() => Array.from({ length: this.totalPaginas() }, (_, i) => i + 1));

  ngOnInit(): void {
    this.loadProductos();
  }

  loadProductos(): void {
    this.productoService.getAll().subscribe(data => this.productos.set(data));
  }

  buscarPorId(): void {
    const id = parseInt(this.busquedaId(), 10);
    if (isNaN(id) || id <= 0) {
      this.errorBusqueda.set('Ingresa un ID de producto válido.');
      return;
    }
    this.buscando.set(true);
    this.errorBusqueda.set(null);
    this.productoService.getById(id).subscribe({
      next: (producto) => {
        this.productos.set([producto]);
        this.paginaActual.set(1);
        this.buscando.set(false);
      },
      error: (err) => {
        this.errorBusqueda.set(err?.error?.detail ?? `Producto #${id} no encontrado.`);
        this.productos.set([]);
        this.buscando.set(false);
      }
    });
  }

  limpiarBusqueda(): void {
    this.busquedaId.set('');
    this.errorBusqueda.set(null);
    this.paginaActual.set(1);
    this.loadProductos();
  }

  cambiarPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas()) return;
    this.paginaActual.set(pagina);
  }

  async onDelete(id: number): Promise<void> {
    const result = await Swal.fire({
      title: '¿Eliminar producto?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
    });
    if (result.isConfirmed) {
      this.productoService.delete(id).subscribe(() => {
        this.loadProductos();
        Swal.fire({ icon: 'success', title: 'Eliminado', text: 'El producto fue eliminado correctamente.', timer: 1800, showConfirmButton: false });
      });
    }
  }
}
