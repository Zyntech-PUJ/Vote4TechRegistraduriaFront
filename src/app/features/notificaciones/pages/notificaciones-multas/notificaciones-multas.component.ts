import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificacionesService, CiudadanoMultado } from '../../services/notificaciones.service';

@Component({
  selector: 'app-notificaciones-multas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notificaciones-multas.component.html',
  styleUrls: ['./notificaciones-multas.component.scss'],
})
export class NotificacionesMultasComponent implements OnInit {
  multas: CiudadanoMultado[] = [];
  loading = true;
  error = false;

  constructor(
    private notificacionesService: NotificacionesService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cargarMultas();
  }

  cargarMultas(): void {
    this.loading = true;
    this.error = false;
    this.cdr.detectChanges();

    this.notificacionesService.getMultas().subscribe({
      next: (data) => {
        queueMicrotask(() => {
          this.multas = data;
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: () => {
        queueMicrotask(() => {
          this.error = true;
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
    });
  }

  formatFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
}
