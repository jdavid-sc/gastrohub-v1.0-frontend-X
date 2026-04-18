import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Rutas públicas que se pueden pre-renderizar
  {
    path: 'login',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'request-reset',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'reset-password',
    renderMode: RenderMode.Prerender
  },
  // Todas las demás rutas se renderizan en el cliente
  // (las rutas protegidas dependen de localStorage/token)
  {
    path: '**',
    renderMode: RenderMode.Client
  }
];
