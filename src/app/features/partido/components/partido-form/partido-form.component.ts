import { Component, EventEmitter, Output, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-partido-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './partido-form.component.html',
  styleUrls: ['./partido-form.component.scss'],
})
export class PartidoFormComponent {
  @Output() formSubmit = new EventEmitter<any>();

  partidoForm: FormGroup;
  archivos: any = {};

  fileTypes = [
    { key: 'logo', label: 'Logosímbolo' },
    { key: 'estatutos', label: 'Estatutos' },
    { key: 'plataforma', label: 'Plataforma ideológica' },
    { key: 'registro', label: 'Registro de afiliados y directivos' },
    { key: 'certificado', label: 'Certificado de representatividad electoral' },
  ];

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
  ) {
    this.partidoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      sigla: ['', Validators.required],
    });
  }

  onFileChange(event: any, tipo: string) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Solo se permiten archivos PDF');
      event.target.value = '';
      return;
    }

    this.archivos = { ...this.archivos, [tipo]: { file, name: file.name } };
    this.cdr.detectChanges();
  }

  removeFile(tipo: string) {
    delete this.archivos[tipo];
    this.cdr.detectChanges();
  }

  onSubmit() {
    if (this.partidoForm.invalid) {
      this.partidoForm.markAllAsTouched();
      this.cdr.detectChanges();
      return;
    }

    const faltantes = this.fileTypes.filter((f) => !this.archivos[f.key]);
    if (faltantes.length > 0) {
      alert('Debes subir todos los documentos requeridos');
      return;
    }

    // PASO 1: Enviar solo JSON (sin archivos)
    const datosPartido = {
      nombre: this.partidoForm.value.nombre,
      sigla: this.partidoForm.value.sigla,
      idRegistrador: 1, // Ajustar cuando haya sesión real
      activo: false,
    };

    // PASO 2: Mapear archivos correctamente
    const archivosFormato: { [key: string]: File } = {
      logo: this.archivos['logo']?.file,
      estatutos: this.archivos['estatutos']?.file,
      plataforma: this.archivos['plataforma']?.file,
      registro: this.archivos['registro']?.file,
      certificado: this.archivos['certificado']?.file,
    };

    // Emitir ambos parámetros al componente padre
    this.formSubmit.emit({
      datos: datosPartido,
      archivos: archivosFormato,
    });
  }

  resetForm() {
    this.partidoForm.reset();
    this.archivos = {};
    this.cdr.detectChanges();
  }

  goBack() {
    window.history.back();
  }
}
