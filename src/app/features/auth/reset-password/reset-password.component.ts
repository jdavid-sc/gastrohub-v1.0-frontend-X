import { Component, signal, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  imports: [FormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private router = inject(Router);

  private token = '';
  newPassword = '';
  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!this.token) {
      this.errorMessage.set('Token inválido o faltante.');
    }
  }

  onSubmit(): void {
    if (this.newPassword.length < 8) {
      this.errorMessage.set('La contraseña debe tener mínimo 8 caracteres.');
      return;
    }
    this.loading.set(true);
    this.errorMessage.set('');

    this.authService.resetPassword({
      token: this.token,
      new_password: this.newPassword
    }).subscribe({
      next: () => {
        this.successMessage.set('Contraseña restablecida. Redirigiendo al login...');
        this.loading.set(false);
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: () => {
        this.errorMessage.set('Token inválido o expirado.');
        this.loading.set(false);
      }
    });
  }
}
