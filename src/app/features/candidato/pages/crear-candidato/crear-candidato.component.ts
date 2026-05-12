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
  isLoading = false;

  constructor(
    private candidatoService: CandidatoService,
    private cdr: ChangeDetectorRef,
  ) {}

  /**
   * NUEVO: Recibe datos + archivos por separado
   */
  onCrearCandidato(payload: { datos: any; archivos: { [key: string]: File } }) {
    this.isLoading = true;
    this.cdr.detectChanges();

    // Llamar al servicio con el flujo correcto
    this.candidatoService.crearCandidatoConDocumentos(payload.datos, payload.archivos).subscribe({
      next: (response) => {
        queueMicrotask(() => {
          this.isLoading = false;
          this.toastMessage = 'Candidato registrado exitosamente con todos sus documentos';
          this.toastType = 'success';
          this.showToast = true;

          // Limpiar formulario después de 2 segundos
          setTimeout(() => {
            this.candidatoFormComponent.resetForm();
          }, 2000);

          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        queueMicrotask(() => {
          this.isLoading = false;
          this.toastMessage =
            err?.error?.message || 'Error al registrar el candidato o subir documentos';
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
