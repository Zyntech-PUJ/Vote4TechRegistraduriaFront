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

    // Datos básicos (sin archivos en FormData)
    const data = {
      nombre: this.partidoForm.value.nombre,
      sigla: this.partidoForm.value.sigla,
      activo: false, // ESTADO PENDIENTE DESDE EL INICIO
      idRegistrador: 1,
    };

    // Emitir datos + archivos por separado
    this.formSubmit.emit({
      data,
      archivos: this.archivos,
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
