import { Routes } from '@angular/router';
import { AuthGuard } from './features/auth/guards/auth.guard';

export const routes: Routes = [
  /**
   * LANDING (Registrador)
   * Se carga como módulo lazy
   */
  {
    path: '',
    loadChildren: () =>
      import('./features/landing/registrador/landing-routing.module').then((m) => m.LANDING_ROUTES),
    canActivate: [AuthGuard], // ← PROTEGIDA
  },

  // AUTH (LOGIN) - SIN PROTECCIÓN
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login/login.component').then((m) => m.LoginComponent),
  },

  /**
   * CANDIDATOS
   */
  {
    path: 'candidato',
    loadChildren: () =>
      import('./features/candidato/candidato.module').then((m) => m.CandidatoModule),
    canActivate: [AuthGuard], // ← PROTEGIDA
  },

  /**
   * PARTIDOS
   */
  {
    path: 'partidos',
    loadChildren: () => import('./features/partido/partido.module').then((m) => m.PartidoModule),
    canActivate: [AuthGuard], // ← PROTEGIDA
  },

  /**
   * ELECCIONES
   */
  {
    path: 'eleccion',
    loadChildren: () => import('./features/eleccion/eleccion.module').then((m) => m.EleccionModule),
    canActivate: [AuthGuard], // ← PROTEGIDA
  },

  /**
   * JURADOS
   */
  {
    path: 'jurado',
    loadChildren: () => import('./features/jurado/jurado.module').then((m) => m.JuradoModule),
    canActivate: [AuthGuard], // ← PROTEGIDA
  },

  /**
   * VERIFICACIÓN DE CANDIDATOS
   */
  {
    path: 'verificacion-candidatos',
    loadChildren: () => import('./features/verificacion-candidatos/verificacion-candidatos.module').then(m => m.VerificacionCandidatosModule),
    canActivate: [AuthGuard],
  },

  /**
   * VERIFICACIÓN DE PARTIDOS
   */
  {
    path: 'verificacion-partidos',
    loadChildren: () => import('./features/verificacion-partidos/verificacion-partidos.module').then(m => m.VerificacionPartidosModule),
    canActivate: [AuthGuard],
  },

  /**
   * cambio de centro
   */
  {
    path: 'cambio-centro',
    loadChildren: () =>
      import('./features/cambio-centro/cambio-centro.module').then((m) => m.CambioCentroModule),
    canActivate: [AuthGuard], // ← PROTEGIDA
  },

  /**
   * RUTA FALLBACK (si escriben mal la URL)
   */
  {
    path: '**',
    redirectTo: '',
  },
];
