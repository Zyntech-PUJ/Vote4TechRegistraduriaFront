import { Component, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PartidoFormComponent } from '../../components/partido-form/partido-form.component';
import { PartidoService } from '../../services/partido.service';
import { ToastComponent } from '../../../../shared/components/toast/toast.component';

@Component({
  selector: 'app-crear-partido',
  standalone: true,
  imports: [CommonModule, PartidoFormComponent, ToastComponent],
  templateUrl: './crear-partido.component.html',
})
export class CrearPartidoComponent {
  @ViewChild(PartidoFormComponent)
  partidoFormComponent!: PartidoFormComponent;

  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  showToast = false;
  isLoading = false;

  constructor(
    private partidoService: PartidoService,
    private cdr: ChangeDetectorRef,
  ) {}

  /**
   * Recibe datos + archivos por separado
   */
  onCrearPartido(payload: { datos: any; archivos: { [key: string]: File } }) {
    this.isLoading = true;
    this.cdr.detectChanges();

    // Llamar al servicio con el flujo correcto
    this.partidoService.crearPartidoConDocumentos(payload.datos, payload.archivos).subscribe({
      next: (response) => {
        queueMicrotask(() => {
          this.isLoading = false;
          this.toastMessage = 'Partido creado exitosamente con todos sus documentos';
          this.toastType = 'success';
          this.showToast = true;

          // Limpiar formulario después de 2 segundos
          setTimeout(() => {
            this.partidoFormComponent.resetForm();
          }, 2000);

          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        queueMicrotask(() => {
          this.isLoading = false;
          this.toastMessage = err?.error?.message || 'Error al crear el partido o subir documentos';
          this.toastType = 'error';
          this.showToast = true;

          this.cdr.detectChanges();
        });
      },
    });
  }

  onCloseToast() {
    this.showToast = false;
    this.cdr.detectChanges();
  }
}
