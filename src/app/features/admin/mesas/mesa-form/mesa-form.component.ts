import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { MesaService } from '../../../../core/services/mesa.service';
import { MesaCreate } from '../../../../core/models/mesa.model';

@Component({
  selector: 'app-mesa-form',
  imports: [FormsModule],
  templateUrl: './mesa-form.component.html',
  styleUrl: './mesa-form.component.css'
})
export class MesaFormComponent implements OnInit {
  private router = inject(Router);
  private mesaService = inject(MesaService);

  numero = 0;
  capacidad = 0;
  loading = signal(false);

  ngOnInit(): void {}

  onSubmit(): void {
    // Validación de número de mesa duplicado
    this.mesaService.getAll().subscribe({
      next: mesas => {
        const existe = mesas.some(m => m.numero === this.numero);
        if (existe) {
          Swal.fire({ icon: 'warning', title: 'Mesa ya existe', text: `La mesa número ${this.numero} ya está registrada.` });
          return;
        }
        const data: MesaCreate = { numero: this.numero, capacidad: this.capacidad };
        this.mesaService.create(data).subscribe({
          next: () => {
            Swal.fire({ icon: 'success', title: '¡Creada!', text: 'La mesa fue creada correctamente.', timer: 2000, showConfirmButton: false })
              .then(() => this.router.navigate(['/admin/mesas']));
          },
          error: () => Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo crear la mesa.' })
        });
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/admin/mesas']);
  }
}
