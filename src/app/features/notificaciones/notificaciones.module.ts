import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificacionesRoutingModule } from './notificaciones-routing.module';
import { NotificacionesMultasComponent } from './pages/notificaciones-multas/notificaciones-multas.component';

@NgModule({
  imports: [CommonModule, NotificacionesRoutingModule, NotificacionesMultasComponent],
})
export class NotificacionesModule {}
