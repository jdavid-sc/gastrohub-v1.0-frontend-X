import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-request-reset',
  imports: [FormsModule, RouterLink],
  templateUrl: './request-reset.component.html',
  styleUrl: './request-reset.component.css'
})
export class RequestResetComponent {
  private authService = inject(AuthService);

  email = '';
  loading = signal(false);
  message = signal('');

  onSubmit(): void {
    this.loading.set(true);
    this.authService.requestPasswordReset({ email: this.email }).subscribe({
      next: () => {
        this.message.set('Si el email existe, recibirás un enlace de recuperación.');
        this.loading.set(false);
      },
      error: () => {
        this.message.set('Si el email existe, recibirás un enlace de recuperación.');
        this.loading.set(false);
      }
    });
  }
}
