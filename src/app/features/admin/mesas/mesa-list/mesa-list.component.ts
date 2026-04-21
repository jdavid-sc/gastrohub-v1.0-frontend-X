import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { MesaService } from '../../../../core/services/mesa.service';
import { Mesa } from '../../../../core/models/mesa.model';

@Component({
  selector: 'app-mesa-list',
  imports: [RouterLink, FormsModule],
  templateUrl: './mesa-list.component.html',
  styleUrl: './mesa-list.component.css'
})
export class MesaListComponent implements OnInit {
  private mesaService = inject(MesaService);
  mesas = signal<Mesa[]>([]);
  busquedaId = signal<string>('');
  buscando = signal<boolean>(false);
  errorBusqueda = signal<string | null>(null);

  readonly pageSize = 10;
  paginaActual = signal(1);

  totalPaginas = computed(() => Math.max(1, Math.ceil(this.mesas().length / this.pageSize)));

  mesasPaginadas = computed(() => {
    const inicio = (this.paginaActual() - 1) * this.pageSize;
    return this.mesas().slice(inicio, inicio + this.pageSize);
  });

  paginas = computed(() => Array.from({ length: this.totalPaginas() }, (_, i) => i + 1));

  ngOnInit(): void {
    this.loadMesas();
  }

  loadMesas(): void {
    this.mesaService.getAll().subscribe(data => this.mesas.set(data));
  }

  buscarPorId(): void {
    const id = parseInt(this.busquedaId(), 10);
    if (isNaN(id) || id <= 0) {
      this.errorBusqueda.set('Ingresa un ID de mesa válido.');
      return;
    }
    this.buscando.set(true);
    this.errorBusqueda.set(null);
    this.mesaService.getById(id).subscribe({
      next: (mesa) => {
        this.mesas.set([mesa]);
        this.paginaActual.set(1);
        this.buscando.set(false);
      },
      error: (err) => {
        this.errorBusqueda.set(err?.error?.detail ?? `Mesa #${id} no encontrada.`);
        this.mesas.set([]);
        this.buscando.set(false);
      }
    });
  }

  limpiarBusqueda(): void {
    this.busquedaId.set('');
    this.errorBusqueda.set(null);
    this.paginaActual.set(1);
    this.loadMesas();
  }

  cambiarPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas()) return;
    this.paginaActual.set(pagina);
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
