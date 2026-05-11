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
  procesando = false;

  constructor(
    private partidoService: PartidoService,
    private cdr: ChangeDetectorRef,
  ) {}

  /**
   * NUEVO FLUJO: POST → PATCH secuencial
   */
  onCrearPartido(payload: { data: any; archivos: any }) {
    this.procesando = true;
    this.cdr.detectChanges();

    // PASO 1: Crear partido sin archivos
    this.partidoService.crearPartido(payload.data).subscribe({
      next: (respuesta) => {
        const idPartido = respuesta.idPartido; // Obtenemos el ID

        console.log('Partido creado con ID:', idPartido);

        // PASO 2: Subir todos los archivos
        this.subirArchivos(idPartido, payload.archivos);
      },
      error: (err) => {
        console.error('Error al crear partido:', err);
        this.procesando = false;
        this.toastMessage = 'Error al crear el partido';
        this.toastType = 'error';
        this.showToast = true;
        this.cdr.detectChanges();
      },
    });
  }

  /**
   * Subir todos los archivos secuencialmente
   */
  private subirArchivos(idPartido: number, archivos: any) {
    const archivosMap: { [key: string]: File } = {};

    Object.entries(archivos).forEach(([key, value]: [string, any]) => {
      if (value?.file) {
        archivosMap[key] = value.file;
      }
    });

    this.partidoService.subirTodosLosArchivos(idPartido, archivosMap).subscribe({
      next: () => {
        this.procesando = false;
        this.toastMessage = 'Partido registrado correctamente (pendiente de aprobación)';
        this.toastType = 'success';
        this.showToast = true;

        this.partidoFormComponent.resetForm();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al subir archivos:', err);
        this.procesando = false;
        this.toastMessage = 'Partido creado pero hubo error al subir documentos';
        this.toastType = 'error';
        this.showToast = true;
        this.cdr.detectChanges();
      },
    });
  }

  onCloseToast() {
    this.showToast = false;
    this.cdr.detectChanges();
  }
}
