import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardPartidosComponent } from './pages/dashboard-partidos/dashboard-partidos.component';
import { DetallePartidoComponent } from './pages/detalle-partido/detalle-partido.component';

/**
 * Rutas de la feature: Verificación de Partidos
 *
 * Define las rutas internas para la verificación de partidos.
 * Estas rutas se cargan de forma perezosa (lazy loading).
 *
 * Estructura de rutas:
 * - '' → DashboardPartidosComponent (lista de partidos)
 * - ':id' → DetallePartidoComponent (detalle de un partido)
 *
 * Ejemplo en app.routes.ts:
 * {
 *   path: 'verificacion-partidos',
 *   loadChildren: () => import('./features/verificacion-partidos/verificacion-partidos.module').then(m => m.VerificacionPartidosModule),
 *   canActivate: [AuthGuard]
 * }
 */
const routes: Routes = [
  {
    path: '',
    component: DashboardPartidosComponent,
  },
  {
    path: ':id',
    component: DetallePartidoComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VerificacionPartidosRoutingModule {}