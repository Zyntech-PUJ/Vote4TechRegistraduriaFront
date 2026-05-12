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
  progresoArchivos = '';

  constructor(
    private partidoService: PartidoService,
    private cdr: ChangeDetectorRef,
  ) {}

  onCrearPartido(payload: { datos: any; archivos: { [key: string]: File } }) {
    this.isLoading = true;
    this.progresoArchivos = 'Creando partido...';
    this.cdr.detectChanges();

    this.partidoService.crearPartido(payload.datos).subscribe({
      next: (partidoCreado) => {
        queueMicrotask(() => {
          const idPartido = partidoCreado.idPartido;
          this.subirArchivosSecuencial(idPartido, payload.archivos);
        });
      },
      error: (err) => {
        queueMicrotask(() => {
          this.isLoading = false;
          this.progresoArchivos = '';
          this.toastMessage = err?.error?.message || 'Error al crear el partido';
          this.toastType = 'error';
          this.showToast = true;
          this.cdr.detectChanges();
        });
      },
    });
  }

  private subirArchivosSecuencial(idPartido: number, archivos: any): void {
    const campos: { campo: string; archivo: File }[] = [
      { campo: 'logo', archivo: archivos['logo'] },
      { campo: 'estatutos', archivo: archivos['estatutos'] },
      { campo: 'plataforma', archivo: archivos['plataforma'] },
      { campo: 'registro', archivo: archivos['registro'] },
      { campo: 'certificado', archivo: archivos['certificado'] },
    ];

    let indice = 0;

    const subirSiguiente = () => {
      if (indice >= campos.length) {
        this.isLoading = false;
        this.progresoArchivos = '';
        this.toastMessage = 'Partido registrado. Queda pendiente de aprobación.';
        this.toastType = 'success';
        this.showToast = true;
        this.partidoFormComponent.resetForm();
        this.cdr.detectChanges();
        return;
      }

      const { campo, archivo } = campos[indice];
      this.progresoArchivos = `Subiendo ${campo} (${indice + 1}/${campos.length})...`;
      this.cdr.detectChanges();

      this.partidoService.subirArchivo(idPartido, campo, archivo).subscribe({
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
            this.toastMessage = `Partido creado pero falló la subida de "${campo}".`;
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
