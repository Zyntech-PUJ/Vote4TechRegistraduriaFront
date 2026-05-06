import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { VerificacionPartidoService, ResponsePartidoDTO } from '../../services/verificacion-partido.service';
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

  // Toast
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  // Estados para los botones
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
      this.idPartido = params['id'];
      this.cargarPartido();
    });
  }

  /**
   * Cargar datos del partido
   */
  cargarPartido(): void {
    this.loading = true;
    this.error = false;
    this.cdr.detectChanges();

    this.verificacionService.obtenerPartidoPorId(this.idPartido).subscribe({
      next: (data) => {
        queueMicrotask(() => {
          this.partido = data;
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        console.error('Error al cargar partido:', err);
        queueMicrotask(() => {
          this.error = true;
          this.errorMessage = 'Error al cargar el partido. Intenta de nuevo.';
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
    });
  }

  /**
   * Obtener estado del partido
   */
  obtenerEstado(): string {
    if (!this.partido) return 'Desconocido';
    return this.partido.activo ? 'APROBADO' : 'PENDIENTE';
  }

  /**
   * Obtener color del estado
   */
  getColorEstado(): string {
    if (!this.partido) return '#facc15';
    return this.partido.activo ? '#10b981' : '#facc15';
  }

  /**
   * Aprobar solicitud del partido (pone activo en true)
   */
  aprobarSolicitud(): void {
    if (!this.partido) return;

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
   * Rechazar solicitud del partido (pone activo en false)
   */
  rechazarSolicitud(): void {
    if (!this.partido) return;

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
   * Volver al dashboard
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