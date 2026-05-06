import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { VerificacionPartidosRoutingModule } from './verificacion-partidos-routing.module';

// Pages
import { DashboardPartidosComponent } from './pages/dashboard-partidos/dashboard-partidos.component';
import { DetallePartidoComponent } from './pages/detalle-partido/detalle-partido.component';

// Components
import { TarjetaPartidoComponent } from './components/tarjeta-partido.component';
import { VisorDocumentosPartidoComponent } from './components/visor-documentos-partido.component';

/**
 * Módulo de feature: Verificación de Partidos
 *
 * Proporciona la lógica, componentes y servicios relacionados con la
 * verificación de partidos políticos en el sistema electoral.
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
    VerificacionPartidosRoutingModule,

    // Pages
    DashboardPartidosComponent,
    DetallePartidoComponent,

    // Components
    TarjetaPartidoComponent,
    VisorDocumentosPartidoComponent,
  ],
})
export class VerificacionPartidosModule {}