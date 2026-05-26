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
  ciudadanos: CiudadanoMultado[] = [];
  loading = true;
  error = false;

  constructor(
    private notificacionesService: NotificacionesService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cargarMultados();
  }

  cargarMultados(): void {
    this.loading = true;
    this.error = false;
    this.cdr.detectChanges();

    this.notificacionesService.getCiudadanosMultados().subscribe({
      next: (data) => {
        queueMicrotask(() => {
          this.ciudadanos = data;
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
}
