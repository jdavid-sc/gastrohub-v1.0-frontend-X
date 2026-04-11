import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { UserRole } from './core/models/enums';

export const routes: Routes = [
  // --- AUTH (público) ---
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'request-reset',
    loadComponent: () => import('./features/auth/request-reset/request-reset.component').then(m => m.RequestResetComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
  },

  // --- ADMIN ---
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard([UserRole.ADMIN])],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./features/admin/usuarios/usuario-list/usuario-list.component').then(m => m.UsuarioListComponent)
      },
      {
        path: 'usuarios/nuevo',
        loadComponent: () => import('./features/admin/usuarios/usuario-form/usuario-form.component').then(m => m.UsuarioFormComponent)
      },
      {
        path: 'usuarios/editar/:id',
        loadComponent: () => import('./features/admin/usuarios/usuario-form/usuario-form.component').then(m => m.UsuarioFormComponent)
      },
      {
        path: 'productos',
        loadComponent: () => import('./features/admin/productos/producto-list/producto-list.component').then(m => m.ProductoListComponent)
      },
      {
        path: 'productos/nuevo',
        loadComponent: () => import('./features/admin/productos/producto-form/producto-form.component').then(m => m.ProductoFormComponent)
      },
      {
        path: 'productos/editar/:id',
        loadComponent: () => import('./features/admin/productos/producto-form/producto-form.component').then(m => m.ProductoFormComponent)
      },
      {
        path: 'mesas',
        loadComponent: () => import('./features/admin/mesas/mesa-list/mesa-list.component').then(m => m.MesaListComponent)
      },
      {
        path: 'mesas/nueva',
        loadComponent: () => import('./features/admin/mesas/mesa-form/mesa-form.component').then(m => m.MesaFormComponent)
      },
      {
        path: 'pagos',
        loadComponent: () => import('./features/admin/pagos/pago-list/pago-list.component').then(m => m.PagoListComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // --- MESERO ---
  {
    path: 'mesero',
    canActivate: [authGuard, roleGuard([UserRole.MESERO])],
    children: [
      {
        path: 'mesas',
        loadComponent: () => import('./features/mesero/mesas-view/mesas-view.component').then(m => m.MesasViewComponent)
      },
      {
        path: 'pedidos',
        loadComponent: () => import('./features/mesero/pedido-list/pedido-list.component').then(m => m.PedidoListComponent)
      },
      {
        path: 'pedidos/nuevo',
        loadComponent: () => import('./features/mesero/pedido-create/pedido-create.component').then(m => m.PedidoCreateComponent)
      },
      {
        path: 'pedidos/:id',
        loadComponent: () => import('./features/mesero/pedido-detail/pedido-detail.component').then(m => m.PedidoDetailComponent)
      },
      { path: '', redirectTo: 'mesas', pathMatch: 'full' }
    ]
  },

  // --- COCINA ---
  {
    path: 'cocina',
    canActivate: [authGuard, roleGuard([UserRole.COCINA])],
    children: [
      {
        path: 'produccion',
        loadComponent: () => import('./features/cocina/produccion/produccion.component').then(m => m.ProduccionComponent)
      },
      { path: '', redirectTo: 'produccion', pathMatch: 'full' }
    ]
  },

  // --- REDIRECTS ---
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
