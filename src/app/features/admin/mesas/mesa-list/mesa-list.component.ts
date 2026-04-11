import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { MesaService } from '../../../../core/services/mesa.service';
import { Mesa } from '../../../../core/models/mesa.model';

@Component({
  selector: 'app-mesa-list',
  imports: [RouterLink],
  templateUrl: './mesa-list.component.html',
  styleUrl: './mesa-list.component.css'
})
export class MesaListComponent implements OnInit {
  private mesaService = inject(MesaService);
  mesas = signal<Mesa[]>([]);

  ngOnInit(): void {
    this.loadMesas();
  }

  loadMesas(): void {
    this.mesaService.getAll().subscribe(data => this.mesas.set(data));
  }

  async onDelete(id: number): Promise<void> {
    const result = await Swal.fire({
      title: '¿Eliminar mesa?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
    });
    if (result.isConfirmed) {
      this.mesaService.delete(id).subscribe(() => {
        this.loadMesas();
        Swal.fire({ icon: 'success', title: 'Eliminada', text: 'La mesa fue eliminada correctamente.', timer: 1800, showConfirmButton: false });
      });
    }
  }
}
