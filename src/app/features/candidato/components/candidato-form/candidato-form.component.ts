import { Component, EventEmitter, Output, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CandidatoService } from '../../service/candidato.service';

@Component({
  selector: 'app-candidato-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './candidato-form.component.html',
  styleUrls: ['./candidato-form.component.scss'],
})
export class CandidatoFormComponent implements OnInit {
  @Output() formSubmit = new EventEmitter<any>();

  candidatoForm: FormGroup;
  archivos: any = {};

  // Partidos cargados desde la BD
  partidos: any[] = [];
  loadingPartidos = false;
  errorPartidos = '';

  fileTypes = [
    { key: 'foto', label: 'Fotografía' },
    { key: 'e6', label: 'Formulario E-6' },
    { key: 'cert', label: 'Certificado Consejo de Estado' },
    { key: 'cedula', label: 'Fotocopia Cédula' },
    { key: 'aval', label: 'Aval' },
  ];

  // Tipos de elección — lista fija igual que en crear-eleccion
  elecciones = [
    { value: 'CONGRESO', label: 'Elecciones de Congreso' },
    { value: 'PRESIDENCIAL', label: 'Elecciones de Presidencia' },
    { value: 'GOBERNADORES', label: 'Elecciones de Gobernadores' },
    { value: 'ALCALDES', label: 'Elecciones de Alcaldes' },
    { value: 'CONCEJOS', label: 'Elecciones de Concejos Municipales' },
    { value: 'ASAMBLEA', label: 'Elecciones de Asambleas Departamentales' },
    { value: 'JUNTAS', label: 'Elecciones de Juntas Administradoras Locales' },
    { value: 'JUVENIL', label: 'Consejos de Juventud' },
    { value: 'INDIGENA', label: 'Elecciones de Resguardos Indígenas' },
  ];

  cargosMap: any = {
    CONGRESO: ['Senador', 'Representante a la Cámara'],
    PRESIDENCIAL: ['Presidente', 'Vicepresidente'],
    GOBERNADORES: ['Gobernador'],
    ALCALDES: ['Alcalde'],
    CONCEJOS: ['Concejal'],
    ASAMBLEA: ['Diputado'],
    JUNTAS: ['Edil'],
    JUVENIL: ['Representante Juvenil'],
    INDIGENA: ['Autoridad Indígena'],
  };

  cargosDisponibles: string[] = [];

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private candidatoService: CandidatoService,
  ) {
    this.candidatoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      idPartido: ['', Validators.required],
      eleccion: ['', Validators.required],
      cargo: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.cargarPartidos();
  }

  cargarPartidos(): void {
    this.loadingPartidos = true;
    this.errorPartidos = '';
    this.cdr.detectChanges();

    this.candidatoService.getPartidosAprobados().subscribe({
      next: (data) => {
        queueMicrotask(() => {
          this.partidos = data;
          this.loadingPartidos = false;
          this.cdr.detectChanges();
        });
      },
      error: () => {
        queueMicrotask(() => {
          this.errorPartidos = 'No se pudieron cargar los partidos. Intente nuevamente.';
          this.loadingPartidos = false;
          this.cdr.detectChanges();
        });
      },
    });
  }

  onEleccionChange() {
    const eleccion = this.candidatoForm.get('eleccion')?.value;
    this.cargosDisponibles = this.cargosMap[eleccion] || [];
    this.candidatoForm.get('cargo')?.reset();
    this.cdr.detectChanges();
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
    if (this.archivos[tipo]?.preview) {
      URL.revokeObjectURL(this.archivos[tipo].preview);
    }
    delete this.archivos[tipo];
    this.cdr.detectChanges();
  }

  onSubmit() {
    if (this.candidatoForm.invalid) {
      this.candidatoForm.markAllAsTouched();
      this.cdr.detectChanges();
      return;
    }

    const faltantes = this.fileTypes.filter((f) => !this.archivos[f.key]);
    if (faltantes.length > 0) {
      alert('Debes subir todos los documentos requeridos');
      return;
    }

    const formData = new FormData();

    const data = {
      nombre: this.candidatoForm.value.nombre,
      numero: '1',
      activo: true,
      idLista: 1,
      idPartido: Number(this.candidatoForm.value.idPartido),
      idRegistrador: 1,
    };

    formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));

    formData.append('foto', this.archivos['foto'].file);
    formData.append('formularioE6', this.archivos['e6'].file);
    formData.append('certificado', this.archivos['cert'].file);
    formData.append('cedula', this.archivos['cedula'].file);
    formData.append('aval', this.archivos['aval'].file);

    this.formSubmit.emit(formData);
  }

  resetForm() {
    Object.keys(this.archivos).forEach((key) => {
      if (this.archivos[key]?.preview) URL.revokeObjectURL(this.archivos[key].preview);
    });
    this.candidatoForm.reset();
    this.cargosDisponibles = [];
    this.archivos = {};
    this.cdr.detectChanges();
  }

  goBack() {
    window.history.back();
  }
}
