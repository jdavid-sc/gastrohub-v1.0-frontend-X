import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { UsuarioService } from '../../../../core/services/usuario.service';
import { Usuario } from '../../../../core/models/usuario.model';

@Component({
  selector: 'app-usuario-list',
  imports: [RouterLink, FormsModule],
  templateUrl: './usuario-list.component.html',
  styleUrl: './usuario-list.component.css'
})
export class UsuarioListComponent implements OnInit {
  private usuarioService = inject(UsuarioService);
  usuarios = signal<Usuario[]>([]);
  busquedaId = signal<string>('');
  buscando = signal<boolean>(false);
  errorBusqueda = signal<string | null>(null);

  readonly pageSize = 10;
  paginaActual = signal(1);

  usuariosOrdenados = computed(() =>
    [...this.usuarios()].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
  );

  totalPaginas = computed(() => Math.max(1, Math.ceil(this.usuariosOrdenados().length / this.pageSize)));

  usuariosPaginados = computed(() => {
    const inicio = (this.paginaActual() - 1) * this.pageSize;
    return this.usuariosOrdenados().slice(inicio, inicio + this.pageSize);
  });

  paginas = computed(() => Array.from({ length: this.totalPaginas() }, (_, i) => i + 1));

  ngOnInit(): void {
    this.loadUsuarios();
  }

  loadUsuarios(): void {
    this.usuarioService.getAll().subscribe(data => this.usuarios.set(data));
  }

  buscarPorId(): void {
    const id = parseInt(this.busquedaId(), 10);
    if (isNaN(id) || id <= 0) {
      this.errorBusqueda.set('Ingresa un ID de usuario válido.');
      return;
    }
    this.buscando.set(true);
    this.errorBusqueda.set(null);
    this.usuarioService.getById(id).subscribe({
      next: (usuario) => {
        this.usuarios.set([usuario]);
        this.paginaActual.set(1);
        this.buscando.set(false);
      },
      error: (err) => {
        this.errorBusqueda.set(err?.error?.detail ?? `Usuario #${id} no encontrado.`);
        this.usuarios.set([]);
        this.buscando.set(false);
      }
    });
  }

  limpiarBusqueda(): void {
    this.busquedaId.set('');
    this.errorBusqueda.set(null);
    this.paginaActual.set(1);
    this.loadUsuarios();
  }

  cambiarPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas()) return;
    this.paginaActual.set(pagina);
  }

  async onDelete(id: number): Promise<void> {
    const result = await Swal.fire({
      title: '¿Eliminar usuario?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
    });
    if (result.isConfirmed) {
      this.usuarioService.delete(id).subscribe(() => {
        this.loadUsuarios();
        Swal.fire({ icon: 'success', title: 'Eliminado', text: 'El usuario fue eliminado correctamente.', timer: 1800, showConfirmButton: false });
      });
    }
  }
}
