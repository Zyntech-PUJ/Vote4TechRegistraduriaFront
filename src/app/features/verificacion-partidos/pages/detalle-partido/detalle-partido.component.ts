import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import {
  VerificacionPartidoService,
  ResponsePartidoDTO,
} from '../../services/verificacion-partido.service';

import { VisorDocumentosPartidoComponent } from '../../components/visor-documentos-partido.component';
import { ToastComponent } from '../../../../shared/components/toast/toast.component';

@Component({
  selector: 'app-detalle-partido',
  standalone: true,
  imports: [CommonModule, VisorDocumentosPartidoComponent, ToastComponent],
  templateUrl: './detalle-partido.component.html',
  styleUrls: ['./detalle-partido.component.scss'],
})
export class DetallePartidoComponent implements OnInit {
  partido: ResponsePartidoDTO | null = null;

  loading = true;
  error = false;
  errorMessage = '';

  idPartido: number = 0;

  /**
   * IMPORTANTE:
   * Controla cuándo montar el visor PDF.
   * Así evitamos que Angular/renderizado intente
   * cargar todos los PDFs inmediatamente.
   */
  mostrarDocumentos = false;

  // Toast
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  // Estados botones
  procesandoAprobacion = false;
  procesandoRechazo = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private verificacionService: VerificacionPartidoService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.idPartido = Number(params['id']);
      this.cargarPartido();
    });
  }

  /**
   * Cargar datos del partido
   */
  cargarPartido(): void {
    this.loading = true;
    this.error = false;

    /**
     * Reseteamos el visor para que no monte
     * los PDFs mientras aún carga la data.
     */
    this.mostrarDocumentos = false;

    this.cdr.detectChanges();

    this.verificacionService.obtenerPartidoPorId(this.idPartido).subscribe({
      next: (data) => {
        queueMicrotask(() => {
          this.partido = data;

          this.loading = false;

          /**
           * Esperamos un ciclo del render para montar
           * el visor después del detalle.
           *
           * Esto evita cargas masivas simultáneas.
           */
          setTimeout(() => {
            this.mostrarDocumentos = true;
            this.cdr.detectChanges();
          }, 0);

          this.cdr.detectChanges();
        });
      },

      error: (err) => {
        console.error('Error al cargar partido:', err);

        queueMicrotask(() => {
          this.error = true;
          this.errorMessage = 'Error al cargar el partido. Intenta de nuevo.';

          this.loading = false;
          this.mostrarDocumentos = false;

          this.cdr.detectChanges();
        });
      },
    });
  }

  /**
   * Obtener estado
   */
  obtenerEstado(): string {
    if (!this.partido) {
      return 'DESCONOCIDO';
    }

    return this.partido.activo ? 'APROBADO' : 'PENDIENTE';
  }

  /**
   * Obtener color estado
   */
  getColorEstado(): string {
    if (!this.partido) {
      return '#facc15';
    }

    return this.partido.activo ? '#10b981' : '#facc15';
  }

  /**
   * Aprobar partido
   */
  aprobarSolicitud(): void {
    if (!this.partido) {
      return;
    }

    this.procesandoAprobacion = true;
    this.cdr.detectChanges();

    this.verificacionService.aprobarPartido(this.partido).subscribe({
      next: (datosActualizados) => {
        queueMicrotask(() => {
          this.partido = datosActualizados;

          this.toastMessage = 'Partido aprobado correctamente';

          this.toastType = 'success';
          this.showToast = true;

          this.procesandoAprobacion = false;

          this.cdr.detectChanges();
        });
      },

      error: (err) => {
        console.error('Error al aprobar partido:', err);

        queueMicrotask(() => {
          this.toastMessage = 'Error al aprobar el partido';

          this.toastType = 'error';
          this.showToast = true;

          this.procesandoAprobacion = false;

          this.cdr.detectChanges();
        });
      },
    });
  }

  /**
   * Rechazar partido
   */
  rechazarSolicitud(): void {
    if (!this.partido) {
      return;
    }

    this.procesandoRechazo = true;
    this.cdr.detectChanges();

    this.verificacionService.rechazarPartido(this.partido).subscribe({
      next: (datosActualizados) => {
        queueMicrotask(() => {
          this.partido = datosActualizados;

          this.toastMessage = 'Partido rechazado';
          this.toastType = 'success';
          this.showToast = true;

          this.procesandoRechazo = false;

          this.cdr.detectChanges();
        });
      },

      error: (err) => {
        console.error('Error al rechazar partido:', err);

        queueMicrotask(() => {
          this.toastMessage = 'Error al rechazar el partido';

          this.toastType = 'error';
          this.showToast = true;

          this.procesandoRechazo = false;

          this.cdr.detectChanges();
        });
      },
    });
  }

  /**
   * Volver
   */
  volverAtras(): void {
    this.router.navigate(['/verificacion-partidos']);
  }

  /**
   * Cerrar toast
   */
  onCloseToast(): void {
    this.showToast = false;
    this.cdr.detectChanges();
  }
}
