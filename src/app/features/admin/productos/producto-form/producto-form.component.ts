import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { ProductoService } from '../../../../core/services/producto.service';
import { ProductoCreate, ProductoUpdate } from '../../../../core/models/producto.model';

@Component({
  selector: 'app-producto-form',
  imports: [FormsModule],
  templateUrl: './producto-form.component.html',
  styleUrl: './producto-form.component.css'
})
export class ProductoFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productoService = inject(ProductoService);

  isEdit = signal(false);
  loading = signal(false);
  private productoId = 0;

  nombre = '';
  descripcion = '';
  precio = 0;
  disponible = true;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.productoId = +id;
      this.loading.set(true);
      this.productoService.getById(this.productoId).subscribe({
        next: p => {
          this.nombre = p.nombre;
          this.descripcion = p.descripcion;
          this.precio = p.precio;
          this.disponible = p.disponible;
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    }
  }

  onSubmit(): void {
    if (this.isEdit()) {
      const data: ProductoUpdate = { nombre: this.nombre, descripcion: this.descripcion, precio: this.precio, disponible: this.disponible };
      this.productoService.update(this.productoId, data).subscribe({
        next: () => {
          Swal.fire({ icon: 'success', title: '¡Actualizado!', text: 'El producto fue actualizado correctamente.', timer: 2000, showConfirmButton: false })
            .then(() => this.router.navigate(['/admin/productos']));
        },
        error: () => Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo actualizar el producto.' })
      });
    } else {
      const data: ProductoCreate = { nombre: this.nombre, descripcion: this.descripcion, precio: this.precio, disponible: this.disponible };
      this.productoService.create(data).subscribe({
        next: () => {
          Swal.fire({ icon: 'success', title: '¡Creado!', text: 'El producto fue creado correctamente.', timer: 2000, showConfirmButton: false })
            .then(() => this.router.navigate(['/admin/productos']));
        },
        error: () => Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo crear el producto.' })
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/productos']);
  }
}
