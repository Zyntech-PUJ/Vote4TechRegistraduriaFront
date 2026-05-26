import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotificacionesMultasComponent } from './pages/notificaciones-multas/notificaciones-multas.component';

const routes: Routes = [{ path: '', component: NotificacionesMultasComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NotificacionesRoutingModule {}
