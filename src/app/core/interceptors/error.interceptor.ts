import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError(error => {
      switch (error.status) {
        case 401:
          // Solo redirige a login si NO es la petición de login misma
          if (!req.url.includes('/auth/login')) {
            if (typeof localStorage !== 'undefined') {
              localStorage.removeItem('access_token');
              localStorage.removeItem('current_user');
            }
            router.navigate(['/login']);
          }
          break;
        case 403:
          // No redirigir — dejar que cada servicio maneje su propio 403
          console.warn('[Interceptor] 403 Acceso denegado:', req.url);
          break;
        case 429:
          console.warn('[Interceptor] Rate limit alcanzado:', req.url);
          break;
        case 500:
          console.error('[Interceptor] Error interno del servidor:', req.url);
          break;
      }
      return throwError(() => error);
    })
  );
};
