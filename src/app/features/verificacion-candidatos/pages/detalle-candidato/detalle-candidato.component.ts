import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import {
  VerificacionCandidatoService,
  ResponseCandidatoDTO,
} from '../../services/verificacion-candidato.service';

import { VisorDocumentosCandidatoComponent } from '../../components/visor-documentos-candidato.component';

import { ToastComponent } from '../../../../shared/components/toast/toast.component';

@Component({
  selector: 'app-detalle-candidato',
  standalone: true,
  imports: [CommonModule, VisorDocumentosCandidatoComponent, ToastComponent],
  templateUrl: './detalle-candidato.component.html',
  styleUrls: ['./detalle-candidato.component.scss'],
})
export class DetalleCandidatoComponent implements OnInit {
  candidato: ResponseCandidatoDTO | null = null;

  loading = true;
  error = false;
  errorMessage = '';

  idCandidato: number = 0;

  /**
   * Control de carga del visor PDF
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
    private verificacionService: VerificacionCandidatoService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.idCandidato = Number(params['id']);
      this.cargarCandidato();
    });
  }

  /**
   * Cargar candidato
   */
  cargarCandidato(): void {
    this.loading = true;
    this.error = false;

    /**
     * Evita montar PDFs antes de tiempo
     */
    this.mostrarDocumentos = false;

    this.cdr.detectChanges();

    this.verificacionService.obtenerCandidatoPorId(this.idCandidato).subscribe({
      next: (data) => {
        queueMicrotask(() => {
          this.candidato = data;

          this.loading = false;

          /**
           * Monta el visor después
           * del render principal
           */
          setTimeout(() => {
            this.mostrarDocumentos = true;
            this.cdr.detectChanges();
          }, 0);

          this.cdr.detectChanges();
        });
      },

      error: (err) => {
        console.error('Error al cargar candidato:', err);

        queueMicrotask(() => {
          this.error = true;

          this.errorMessage = 'Error al cargar el candidato. Intenta de nuevo.';

          this.loading = false;
          this.mostrarDocumentos = false;

          this.cdr.detectChanges();
        });
      },
    });
  }

  /**
   * Estado
   */
  obtenerEstado(): string {
    if (!this.candidato) {
      return 'DESCONOCIDO';
    }

    return this.candidato.activo ? 'APROBADO' : 'PENDIENTE';
  }

  /**
   * Color estado
   */
  getColorEstado(): string {
    if (!this.candidato) {
      return '#facc15';
    }

    return this.candidato.activo ? '#10b981' : '#facc15';
  }

  /**
   * Aprobar candidato
   */
  aprobarSolicitud(): void {
    if (!this.candidato) {
      return;
    }

    this.procesandoAprobacion = true;
    this.cdr.detectChanges();

    this.verificacionService.aprobarCandidato(this.candidato).subscribe({
      next: (datosActualizados) => {
        queueMicrotask(() => {
          this.candidato = datosActualizados;

          this.toastMessage = 'Candidato aprobado correctamente';

          this.toastType = 'success';
          this.showToast = true;

          this.procesandoAprobacion = false;

          this.cdr.detectChanges();
        });
      },

      error: (err) => {
        console.error('Error al aprobar candidato:', err);

        queueMicrotask(() => {
          this.toastMessage = 'Error al aprobar el candidato';

          this.toastType = 'error';
          this.showToast = true;

          this.procesandoAprobacion = false;

          this.cdr.detectChanges();
        });
      },
    });
  }

  /**
   * Rechazar candidato
   */
  rechazarSolicitud(): void {
    if (!this.candidato) {
      return;
    }

    this.procesandoRechazo = true;
    this.cdr.detectChanges();

    this.verificacionService.rechazarCandidato(this.candidato).subscribe({
      next: (datosActualizados) => {
        queueMicrotask(() => {
          this.candidato = datosActualizados;

          this.toastMessage = 'Candidato rechazado';

          this.toastType = 'success';
          this.showToast = true;

          this.procesandoRechazo = false;

          this.cdr.detectChanges();
        });
      },

      error: (err) => {
        console.error('Error al rechazar candidato:', err);

        queueMicrotask(() => {
          this.toastMessage = 'Error al rechazar el candidato';

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
    this.router.navigate(['/verificacion-candidatos']);
  }

  /**
   * Cerrar toast
   */
  onCloseToast(): void {
    this.showToast = false;
    this.cdr.detectChanges();
  }
}
