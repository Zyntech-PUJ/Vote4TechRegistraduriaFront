import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardCandidatosComponent } from './pages/dashboard-candidatos/dashboard-candidatos.component';
import { DetalleCandidatoComponent } from './pages/detalle-candidato/detalle-candidato.component';

/**
 * Rutas de la feature: Verificación de Candidatos
 *
 * Define las rutas internas para la verificación de candidatos.
 * Estas rutas se cargan de forma perezosa (lazy loading).
 *
 * Estructura de rutas:
 * - '' → DashboardCandidatosComponent (lista de candidatos)
 * - ':id' → DetalleCandidatoComponent (detalle de un candidato)
 *
 * Ejemplo en app.routes.ts:
 * {
 *   path: 'verificacion-candidatos',
 *   loadChildren: () => import('./features/verificacion-candidatos/verificacion-candidatos.module').then(m => m.VerificacionCandidatosModule),
 *   canActivate: [AuthGuard]
 * }
 */
const routes: Routes = [
  {
    path: '',
    component: DashboardCandidatosComponent,
  },
  {
    path: ':id',
    component: DetalleCandidatoComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VerificacionCandidatosRoutingModule {}