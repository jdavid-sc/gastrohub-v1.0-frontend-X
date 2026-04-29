# GastroHub - Frontend

Sistema de gestión de restaurantes desarrollado con Angular 21. Permite administrar mesas, pedidos, productos, usuarios y pagos mediante roles diferenciados (Administrador, Mesero, Cocina).

---

## Requisitos previos

Asegúrate de tener instaladas las siguientes herramientas antes de correr el proyecto:

| Herramienta | Versión requerida |
|-------------|-------------------|
| Node.js     | >= 20.x (LTS recomendado) |
| npm         | >= 11.9.0         |
| Angular CLI | ^21.2.2           |
| TypeScript  | ~5.9.2            |

> Verifica tu versión de Node con `node -v` y npm con `npm -v`.

Para instalar Angular CLI globalmente:

```bash
npm install -g @angular/cli@21
```

---

## Instalación

1. **Clona el repositorio:**

```bash
git clone <url-del-repositorio>
cd gastrohub-v1.0-frontend-X
```

2. **Instala las dependencias:**

```bash
npm install
```

---

## Variables de entorno

El proyecto usa archivos de entorno ubicados en `src/environments/`.

### `environment.ts` (desarrollo)

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',         // URL del backend en desarrollo
  recaptchaSiteKey: 'TU_SITE_KEY_RECAPTCHA'
};
```

### `environment.prod.ts` (producción)

```typescript
export const environment = {
  production: true,
  apiUrl: 'http://localhost:8000',         // URL del backend en producción
  recaptchaSiteKey: 'TU_SITE_KEY_RECAPTCHA'
};
```

> Ajusta `apiUrl` según la URL donde esté corriendo el backend de GastroHub.

---

## Comandos disponibles

| Comando | Descripción |
|---------|-------------|
| `npm start` | Inicia el servidor de desarrollo en `http://localhost:4200` |
| `npm run build` | Compila el proyecto para producción en `/dist` |
| `npm run watch` | Compila en modo desarrollo con watch (recarga automática) |
| `npm test` | Ejecuta las pruebas unitarias con Vitest |
| `npm run serve:ssr:gastrohub-1.1` | Sirve la aplicación con Server-Side Rendering (SSR) |

---

## Correr en desarrollo

```bash
npm start
```

La aplicación estará disponible en: [http://localhost:4200](http://localhost:4200)

---

## Compilar para producción

```bash
npm run build
```

Los archivos compilados se generan en `dist/gastrohub-1.1/`.

## Correr con SSR (producción)

```bash
npm run build
npm run serve:ssr:gastrohub-1.1
```

---

## Dependencias principales

| Paquete | Versión |
|---------|---------|
| `@angular/core` | ^21.2.0 |
| `@angular/router` | ^21.2.0 |
| `@angular/forms` | ^21.2.0 |
| `@angular/ssr` | ^21.2.2 |
| `rxjs` | ~7.8.0 |
| `jwt-decode` | ^4.0.0 |
| `sweetalert2` | ^11.26.24 |
| `express` | ^5.1.0 |

---

## Estructura del proyecto

```
src/
├── app/
│   ├── core/
│   │   ├── guards/         # authGuard, roleGuard
│   │   ├── interceptors/   # authInterceptor, errorInterceptor
│   │   ├── models/         # Interfaces y enums (Usuario, Pedido, Mesa, Producto...)
│   │   └── services/       # Servicios HTTP (auth, pedido, mesa, producto, pago...)
│   └── features/
│       ├── auth/           # Login, recuperación y reset de contraseña
│       ├── admin/          # Dashboard, usuarios, productos, mesas, pagos
│       ├── mesero/         # Vista de mesas, crear/ver pedidos
│       └── cocina/         # Vista de producción de pedidos
├── environments/
│   ├── environment.ts      # Configuración desarrollo
│   └── environment.prod.ts # Configuración producción
└── styles.css              # Estilos globales
```

---

## Roles y rutas protegidas

| Rol | Rutas disponibles |
|-----|-------------------|
| `ADMIN` | `/admin/**` (dashboard, usuarios, productos, mesas, pagos) |
| `MESERO` | `/mesero/**` (mesas, pedidos) |
| `COCINA` | `/cocina/**` (producción) |

La autenticación se maneja mediante JWT. El token se adjunta automáticamente en cada petición HTTP a través del `authInterceptor`.

---

## Notas adicionales

- El proyecto requiere que el **backend de GastroHub** esté corriendo y accesible en la URL configurada en `environment.ts`.
- reCAPTCHA está integrado en el flujo de login; se debe configurar un `recaptchaSiteKey` válido de Google reCAPTCHA v2/v3.
- El modo SSR está habilitado por defecto mediante `@angular/ssr` con Express como servidor.
