import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { VerificacionCandidatosRoutingModule } from './verificacion-candidatos-routing.module';

// Pages
import { DashboardCandidatosComponent } from './pages/dashboard-candidatos/dashboard-candidatos.component';
import { DetalleCandidatoComponent } from './pages/detalle-candidato/detalle-candidato.component';

// Components
import { TarjetaCandidatoComponent } from './components/tarjeta-candidato.component';
import { VisorDocumentosCandidatoComponent } from './components/visor-documentos-candidato.component';

/**
 * Módulo de feature: Verificación de Candidatos
 *
 * Proporciona la lógica, componentes y servicios relacionados con la
 * verificación de candidatos en el sistema electoral.
 *
 * Estructura:
 * - pages/: Componentes contenedores (dashboard, detalle)
 * - components/: Componentes reutilizables (tarjetas, visores)
 * - services/: Servicios de lógica de negocio
 *
 * Este módulo está preparado para lazy loading desde el routing principal.
 */
@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    VerificacionCandidatosRoutingModule,

    // Pages
    DashboardCandidatosComponent,
    DetalleCandidatoComponent,

    // Components
    TarjetaCandidatoComponent,
    VisorDocumentosCandidatoComponent,
  ],
})
export class VerificacionCandidatosModule {}