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
  progresoArchivos = '';

  constructor(
    private candidatoService: CandidatoService,
    private cdr: ChangeDetectorRef,
  ) {}

  onCrearCandidato(payload: { datos: any; archivos: { [key: string]: File } }) {
    this.isLoading = true;
    this.progresoArchivos = 'Creando candidato...';
    this.cdr.detectChanges();

    // Paso 1: POST con JSON puro
    this.candidatoService.crearCandidato(payload.datos).subscribe({
      next: (candidatoCreado) => {
        queueMicrotask(() => {
          const idCandidato = candidatoCreado.idCandidato;
          this.subirArchivosSecuencial(idCandidato, payload.archivos);
        });
      },
      error: (err) => {
        queueMicrotask(() => {
          this.isLoading = false;
          this.progresoArchivos = '';
          this.toastMessage = err?.error?.message || 'Error al crear el candidato';
          this.toastType = 'error';
          this.showToast = true;
          this.cdr.detectChanges();
        });
      },
    });
  }

  private subirArchivosSecuencial(idCandidato: number, archivos: any): void {
    // Mapeo clave del form → campo del back
    const campos: { campo: string; archivo: File }[] = [
      { campo: 'foto', archivo: archivos['foto'] },
      { campo: 'formulario-e6', archivo: archivos['e6'] },
      { campo: 'certificado', archivo: archivos['cert'] },
      { campo: 'cedula', archivo: archivos['cedula'] },
      { campo: 'aval', archivo: archivos['aval'] },
    ];

    let indice = 0;

    const subirSiguiente = () => {
      if (indice >= campos.length) {
        this.isLoading = false;
        this.progresoArchivos = '';
        this.toastMessage = 'Candidato registrado. Queda pendiente de aprobación.';
        this.toastType = 'success';
        this.showToast = true;
        this.candidatoFormComponent.resetForm();
        this.cdr.detectChanges();
        return;
      }

      const { campo, archivo } = campos[indice];
      this.progresoArchivos = `Subiendo ${campo} (${indice + 1}/${campos.length})...`;
      this.cdr.detectChanges();

      this.candidatoService.subirArchivo(idCandidato, campo, archivo).subscribe({
        next: () => {
          queueMicrotask(() => {
            indice++;
            subirSiguiente();
          });
        },
        error: () => {
          queueMicrotask(() => {
            this.isLoading = false;
            this.progresoArchivos = '';
            this.toastMessage = `Candidato creado pero falló la subida de "${campo}".`;
            this.toastType = 'error';
            this.showToast = true;
            this.cdr.detectChanges();
          });
        },
      });
    };

    subirSiguiente();
  }

  onCloseToast() {
    this.showToast = false;
    this.cdr.detectChanges();
  }
}
