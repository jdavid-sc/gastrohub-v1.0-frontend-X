import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { UsuarioService } from '../../../../core/services/usuario.service';
import { UsuarioCreate, UsuarioUpdate } from '../../../../core/models/usuario.model';
import { UserRole } from '../../../../core/models/enums';

@Component({
  selector: 'app-usuario-form',
  imports: [FormsModule],
  templateUrl: './usuario-form.component.html',
  styleUrl: './usuario-form.component.css'
})
export class UsuarioFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private usuarioService = inject(UsuarioService);

  isEdit = signal(false);
  loading = signal(false);
  private userId = 0;

  nombre = '';
  email = '';
  password = '';
  rol: UserRole = UserRole.MESERO;
  activo = true;

  roles = [
    { value: UserRole.ADMIN, label: 'Admin' },
    { value: UserRole.MESERO, label: 'Mesero' },
    { value: UserRole.COCINA, label: 'Cocina' },
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.userId = +id;
      this.loading.set(true);
      this.usuarioService.getById(this.userId).subscribe({
        next: user => {
          this.nombre = user.nombre;
          this.email = user.email;
          this.rol = user.rol;
          this.activo = user.activo;
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    }
  }

  onSubmit(): void {
    if (this.isEdit()) {
      const data: UsuarioUpdate = { nombre: this.nombre, email: this.email, rol: this.rol, activo: this.activo };
      this.usuarioService.update(this.userId, data).subscribe({
        next: () => {
          Swal.fire({ icon: 'success', title: '¡Actualizado!', text: 'Los cambios han sido guardados correctamente.', timer: 2000, showConfirmButton: false })
            .then(() => this.router.navigate(['/admin/usuarios']));
        },
        error: () => Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo actualizar el usuario.' })
      });
    } else {
      // Validación de email duplicado
      this.usuarioService.getAll().subscribe({
        next: usuarios => {
          const existe = usuarios.some(u => u.email.toLowerCase() === this.email.toLowerCase());
          if (existe) {
            Swal.fire({ icon: 'warning', title: 'Email ya registrado', text: `El correo ${this.email} ya está en uso.` });
            return;
          }
          const data: UsuarioCreate = { nombre: this.nombre, email: this.email, password: this.password, rol: this.rol, activo: this.activo };
          this.usuarioService.create(data).subscribe({
            next: () => {
              Swal.fire({ icon: 'success', title: '¡Creado!', text: 'El usuario fue creado correctamente.', timer: 2000, showConfirmButton: false })
                .then(() => this.router.navigate(['/admin/usuarios']));
            },
            error: () => Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo crear el usuario.' })
          });
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/usuarios']);
  }
}
