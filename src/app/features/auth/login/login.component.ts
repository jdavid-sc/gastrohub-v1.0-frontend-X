import { Component, signal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { RecaptchaService } from '../../../core/services/recaptcha.service';
import { UserRole } from '../../../core/models/enums';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private recaptchaService = inject(RecaptchaService);
  private router = inject(Router);

  email = '';
  password = '';
  loading = signal(false);
  errorMessage = signal('');

  async onLogin(): Promise<void> {
    if (this.loading()) return; // prevenir doble envío
    this.loading.set(true);
    this.errorMessage.set('');

    const startTime = Date.now();

    const ensureMinDelay = async () => {
      const elapsed = Date.now() - startTime;
      if (elapsed < 1000) await new Promise(r => setTimeout(r, 1000 - elapsed));
    };

    let recaptchaToken: string;
    try {
      recaptchaToken = await this.recaptchaService.execute('login');
      console.log('[Login] ✅ reCAPTCHA token obtenido');
    } catch (err) {
      console.error('[Login] ❌ Error obteniendo token reCAPTCHA:', err);
      await ensureMinDelay();
      this.errorMessage.set('No se pudo verificar reCAPTCHA. Recarga la página e intenta de nuevo.');
      this.loading.set(false);
      return;
    }

    const loginRequest = {
      email: this.email,
      password: this.password,
      recaptcha_token: recaptchaToken
    };
    console.log('[Login] Enviando petición:', { email: loginRequest.email, password: '***', recaptcha_token: loginRequest.recaptcha_token?.slice(0, 20) + '...' });

    try {
      // Paso 1: autenticación
      await firstValueFrom(this.authService.login(loginRequest));
      console.log('[Login] ✅ Token recibido y almacenado');

      // Paso 2: obtener perfil del usuario
      await firstValueFrom(this.authService.fetchCurrentUser());
      console.log('[Login] ✅ Perfil cargado. Rol:', this.authService.userRole());

      await ensureMinDelay();
      this.redirectByRole();
    } catch (err: any) {
      console.error('[Login] ❌ Error en el flujo de login:', err);
      console.error('[Login] Status:', err?.status, '| URL:', err?.url);
      await ensureMinDelay();
      if (err?.status === 401) {
        this.errorMessage.set('Credenciales inválidas.');
      } else if (err?.status === 422) {
        this.errorMessage.set('Token reCAPTCHA inválido. Recarga la página.');
      } else if (err?.status === 429) {
        this.errorMessage.set('Demasiados intentos. Espera un momento.');
      } else {
        this.errorMessage.set(`Error al iniciar sesión (${err?.status ?? 'sin conexión'}).`);
      }
    } finally {
      this.loading.set(false);
    }
  }

  private redirectByRole(): void {
    const role = this.authService.userRole();
    switch (role) {
      case UserRole.ADMIN:
        this.router.navigate(['/admin']);
        break;
      case UserRole.MESERO:
        this.router.navigate(['/mesero']);
        break;
      case UserRole.COCINA:
        this.router.navigate(['/cocina']);
        break;
      default:
        this.router.navigate(['/login']);
    }
  }
}

