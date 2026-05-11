import { Component, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CandidatoFormComponent } from '../../components/candidato-form/candidato-form.component';
import { CandidatoService } from '../../service/candidato.service';
import { ToastComponent } from '../../../../shared/components/toast/toast.component';

@Component({
  selector: 'app-crear-candidato',
  standalone: true,
  imports: [CommonModule, CandidatoFormComponent, ToastComponent],
  templateUrl: './crear-candidato.component.html',
})
export class CrearCandidatoComponent {
  @ViewChild(CandidatoFormComponent)
  candidatoFormComponent!: CandidatoFormComponent;

  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  showToast = false;
  procesando = false;

  constructor(
    private candidatoService: CandidatoService,
    private cdr: ChangeDetectorRef,
  ) {}

  /**
   * NUEVO FLUJO:
   * 1. Recibe { data, archivos }
   * 2. POST candidato → obtiene idCandidato
   * 3. PATCH cada archivo
   */
  onCrearCandidato(payload: { data: any; archivos: any }) {
    this.procesando = true;
    this.cdr.detectChanges();

    // PASO 1: Crear candidato sin archivos
    this.candidatoService.crearCandidato(payload.data).subscribe({
      next: (respuesta) => {
        const idCandidato = respuesta.idCandidato; // Obtenemos el ID

        console.log('Candidato creado con ID:', idCandidato);

        // PASO 2: Subir todos los archivos
        this.subirArchivos(idCandidato, payload.archivos);
      },
      error: (err) => {
        console.error('Error al crear candidato:', err);
        this.procesando = false;
        this.toastMessage = 'Error al crear el candidato';
        this.toastType = 'error';
        this.showToast = true;
        this.cdr.detectChanges();
      },
    });
  }

  /**
   * Subir todos los archivos secuencialmente
   */
  private subirArchivos(idCandidato: number, archivos: any) {
    const archivosMap: { [key: string]: File } = {};

    Object.entries(archivos).forEach(([key, value]: [string, any]) => {
      if (value?.file) {
        archivosMap[key] = value.file;
      }
    });

    this.candidatoService.subirTodosLosArchivos(idCandidato, archivosMap).subscribe({
      next: () => {
        this.procesando = false;
        this.toastMessage = 'Candidato registrado correctamente (pendiente de aprobación)';
        this.toastType = 'success';
        this.showToast = true;

        this.candidatoFormComponent.resetForm();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al subir archivos:', err);
        this.procesando = false;
        this.toastMessage = 'Candidato creado pero hubo error al subir documentos';
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
