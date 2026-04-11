import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import Swal from 'sweetalert2';
import { ProductoService } from '../../../../core/services/producto.service';
import { Producto } from '../../../../core/models/producto.model';

@Component({
  selector: 'app-producto-list',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './producto-list.component.html',
  styleUrl: './producto-list.component.css'
})
export class ProductoListComponent implements OnInit {
  private productoService = inject(ProductoService);
  productos = signal<Producto[]>([]);

  ngOnInit(): void {
    this.loadProductos();
  }

  loadProductos(): void {
    this.productoService.getAll().subscribe(data => this.productos.set(data));
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
