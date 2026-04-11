import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, throwError } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../../environments/environment';
import { LoginRequest, TokenResponse, PasswordResetRequest, PasswordResetConfirm } from '../models/auth.model';
import { Usuario } from '../models/usuario.model';
import { UserRole } from '../models/enums';

interface JwtPayload {
  sub: string;
  exp: number;
  type: string;
  [key: string]: unknown; // permite campos extra del backend
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private apiUrl = environment.apiUrl;

  private readonly INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minutos
  private inactivityTimer: ReturnType<typeof setTimeout> | null = null;

  private _currentUser = signal<Usuario | null>(null);

  readonly user = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this.getToken() && !this.isTokenExpired());
  readonly userRole = computed(() => this._currentUser()?.rol ?? null);
  // Alias para mantener compatibilidad con código existente
  readonly currentUser = this._currentUser.asReadonly();

  constructor() {
    this.restoreSession();
    if (isPlatformBrowser(this.platformId)) {
      this.startInactivityTimer();
    }
  }

  // ── Sesión persistente ────────────────────────────────────────────────────

  private restoreSession(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      const decoded = jwtDecode<JwtPayload>(token);
      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('current_user');
        return;
      }
      const stored = localStorage.getItem('current_user');
      if (stored) {
        this._currentUser.set(JSON.parse(stored));
      }
    } catch {
      localStorage.removeItem('access_token');
      localStorage.removeItem('current_user');
    }
  }

  private persistUser(user: Usuario): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('current_user', JSON.stringify(user));
    }
  }

  // ── Inactividad ───────────────────────────────────────────────────────────

  private startInactivityTimer(): void {
    const reset = () => {
      if (this.inactivityTimer) clearTimeout(this.inactivityTimer);
      if (!this.isAuthenticated()) return;
      this.inactivityTimer = setTimeout(() => this.logout(), this.INACTIVITY_LIMIT);
    };
    ['mousemove', 'keydown', 'click', 'touchstart'].forEach(event => {
      window.addEventListener(event, reset, { passive: true });
    });
    reset();
  }

  // ── Auth ──────────────────────────────────────────────────────────────────

  login(credentials: LoginRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(response => this.setToken(response.access_token))
    );
  }

  /**
   * Obtiene el perfil del usuario autenticado usando GET /usuarios/{id}.
   * Busca el ID en el campo "user_id" del JWT, o en "sub" si es numérico.
   */
  fetchCurrentUser(): Observable<Usuario> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No hay token de sesión.'));
    }

    let decoded: JwtPayload;
    try {
      decoded = jwtDecode<JwtPayload>(token);
      console.log('[Auth] JWT payload:', decoded);
    } catch {
      return throwError(() => new Error('Token inválido.'));
    }

    // Intentar obtener el ID del usuario desde el JWT
    const userId = decoded['user_id'] ?? decoded['id'] ?? decoded.sub;
    const numericId = typeof userId === 'number' ? userId : parseInt(String(userId), 10);

    if (isNaN(numericId)) {
      return throwError(() => new Error('No se pudo obtener el ID del usuario desde el token.'));
    }

    console.log('[Auth] Obteniendo usuario por ID:', numericId);
    return this.http.get<Usuario>(`${this.apiUrl}/usuarios/${numericId}`).pipe(
      tap(user => {
        console.log('[Auth] Usuario obtenido:', user);
        this._currentUser.set(user);
        this.persistUser(user);
      })
    );
  }

  requestPasswordReset(data: PasswordResetRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/auth/request-password-reset`, data);
  }

  resetPassword(data: PasswordResetConfirm): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/auth/reset-password`, data);
  }

  logout(): void {
    if (this.inactivityTimer) clearTimeout(this.inactivityTimer);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('current_user');
    }
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }

  // ── Token helpers ─────────────────────────────────────────────────────────

  getToken(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem('access_token');
  }

  setToken(token: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
  }

  setCurrentUser(user: Usuario): void {
    this._currentUser.set(user);
    this.persistUser(user);
  }

  /** Decodifica el sub del JWT como ID numérico de usuario. */
  getUserIdFromToken(): number | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const id = parseInt(decoded.sub, 10);
      return isNaN(id) ? null : id;
    } catch {
      return null;
    }
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }
}

