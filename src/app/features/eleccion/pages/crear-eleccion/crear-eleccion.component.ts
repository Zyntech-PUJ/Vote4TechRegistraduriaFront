import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { EleccionService, CreateEleccionDTO } from '../../services/eleccion.service';

@Component({
  selector: 'app-crear-eleccion',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './crear-eleccion.component.html',
  styleUrls: ['./crear-eleccion.component.scss'],
})
export class CrearEleccionComponent {
  // ── Formulario ────────────────────────────────────────────────
  eleccionForm: FormGroup;

  // ── Checkboxes fuera del form reactivo ───────────────────────
  votoUrna = false;
  votoDomicilio = false;

  // ── Rangos de fechas para urna y domicilio ───────────────────
  // El back espera fechaInicioUrna / fechaFinalizacionUrna (rango)
  // no días sueltos, así que el calendario selecciona inicio y fin
  fechaInicioUrna = '';
  fechaFinUrna = '';
  fechaInicioDomicilio = '';
  fechaFinDomicilio = '';

  // ── Calendarios (para mostrar días del mes) ───────────────────
  weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  currentMonthUrna: Date = new Date();
  currentMonthDomicilio: Date = new Date();
  calendarDaysUrna: (Date | null)[] = [];
  calendarDaysDomicilio: (Date | null)[] = [];

  // ── Estados ───────────────────────────────────────────────────
  loading = false;
  showSummary = false;
  successMessage = '';
  errorMessage = '';
  errorUrna = '';
  errorDomicilio = '';

  // ── Resumen ───────────────────────────────────────────────────
  summary: any = {};

  // ── Tipos de elección ─────────────────────────────────────────
  tiposEleccion: any = {
    CONGRESO: 'Elecciones de Congreso',
    PRESIDENCIAL: 'Elecciones de Presidencia',
    GOBERNADORES: 'Elecciones de Gobernadores',
    ALCALDES: 'Elecciones de Alcaldes',
    CONCEJOS: 'Elecciones de Concejos Municipales',
    ASAMBLEA: 'Elecciones de Asambleas Departamentales',
    JUNTAS: 'Elecciones de Juntas Administradoras Locales',
    LEGISLATIVA: 'Legislativa',
    CONSULTA: 'Consulta',
  };

  constructor(
    private fb: FormBuilder,
    private eleccionService: EleccionService,
    public cdr: ChangeDetectorRef,
    private router: Router, // AÑADIR
  ) {
    this.eleccionForm = this.fb.group(
      {
        nombre: ['', [Validators.required, Validators.minLength(5)]],
        tipo: ['', Validators.required],
        fechaInicio: ['', Validators.required],
        fechaFinalizacion: ['', Validators.required],
        listaAbierta: [false],
        // ID temporal del administrador electoral — cuando haya login
        // esto vendrá del usuario autenticado en sesión
        idAdministradorElectoral: [1],
      },
      { validators: this.validarFechas },
    );

    this.currentMonthUrna = new Date();
    this.currentMonthDomicilio = new Date();
  }

  // ── Getters ───────────────────────────────────────────────────
  get nombre() {
    return this.eleccionForm.get('nombre');
  }
  get tipo() {
    return this.eleccionForm.get('tipo');
  }
  get fechaInicio() {
    return this.eleccionForm.get('fechaInicio');
  }
  get fechaFinalizacion() {
    return this.eleccionForm.get('fechaFinalizacion');
  }

  // ── Validador de fechas principales ───────────────────────────
  validarFechas(group: AbstractControl) {
    const inicio = group.get('fechaInicio')?.value;
    const fin = group.get('fechaFinalizacion')?.value;
    if (inicio && fin && new Date(fin) <= new Date(inicio)) {
      return { fechasInvalidas: true };
    }
    return null;
  }

  // ── Al cambiar fechas principales, regenerar calendarios ──────
  onFechaChange() {
    if (this.votoUrna) this.buildCalendar('urna');
    if (this.votoDomicilio) this.buildCalendar('domicilio');
    this.cdr.detectChanges();
  }

  onVotoUrnaChange() {
    if (this.votoUrna) {
      this.buildCalendar('urna');
    } else {
      this.fechaInicioUrna = '';
      this.fechaFinUrna = '';
      this.errorUrna = '';
    }
    this.cdr.detectChanges();
  }

  onVotoDomicilioChange() {
    if (this.votoDomicilio) {
      this.buildCalendar('domicilio');
    } else {
      this.fechaInicioDomicilio = '';
      this.fechaFinDomicilio = '';
      this.errorDomicilio = '';
    }
    this.cdr.detectChanges();
  }

  // ── Construir días del mes para el calendario ─────────────────
  buildCalendar(type: 'urna' | 'domicilio') {
    const month = type === 'urna' ? this.currentMonthUrna : this.currentMonthDomicilio;
    const year = month.getFullYear();
    const m = month.getMonth();
    const firstDay = new Date(year, m, 1).getDay();
    const daysInMonth = new Date(year, m + 1, 0).getDate();
    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, m, i));
    if (type === 'urna') this.calendarDaysUrna = days;
    else this.calendarDaysDomicilio = days;
  }

  prevMonth(type: 'urna' | 'domicilio') {
    if (type === 'urna') {
      this.currentMonthUrna = new Date(
        this.currentMonthUrna.getFullYear(),
        this.currentMonthUrna.getMonth() - 1,
        1,
      );
      this.buildCalendar('urna');
    } else {
      this.currentMonthDomicilio = new Date(
        this.currentMonthDomicilio.getFullYear(),
        this.currentMonthDomicilio.getMonth() - 1,
        1,
      );
      this.buildCalendar('domicilio');
    }
    this.cdr.detectChanges();
  }

  nextMonth(type: 'urna' | 'domicilio') {
    if (type === 'urna') {
      this.currentMonthUrna = new Date(
        this.currentMonthUrna.getFullYear(),
        this.currentMonthUrna.getMonth() + 1,
        1,
      );
      this.buildCalendar('urna');
    } else {
      this.currentMonthDomicilio = new Date(
        this.currentMonthDomicilio.getFullYear(),
        this.currentMonthDomicilio.getMonth() + 1,
        1,
      );
      this.buildCalendar('domicilio');
    }
    this.cdr.detectChanges();
  }

  getMonthLabel(type: 'urna' | 'domicilio'): string {
    const month = type === 'urna' ? this.currentMonthUrna : this.currentMonthDomicilio;
    return month
      .toLocaleString('es-CO', { month: 'long', year: 'numeric' })
      .replace(/^\w/, (c) => c.toUpperCase());
  }

  // ── Verifica si el día está dentro del rango de la elección ───
  isInRange(day: Date): boolean {
    const inicio = this.eleccionForm.get('fechaInicio')?.value;
    const fin = this.eleccionForm.get('fechaFinalizacion')?.value;
    if (!inicio || !fin) return true;
    return day >= new Date(inicio + 'T00:00:00') && day <= new Date(fin + 'T00:00:00');
  }

  // ── Verifica si el día es inicio o fin del rango seleccionado ─
  isRangeStart(day: Date, type: 'urna' | 'domicilio'): boolean {
    const fecha = type === 'urna' ? this.fechaInicioUrna : this.fechaInicioDomicilio;
    if (!fecha) return false;
    return day.toDateString() === new Date(fecha + 'T00:00:00').toDateString();
  }

  isRangeEnd(day: Date, type: 'urna' | 'domicilio'): boolean {
    const fecha = type === 'urna' ? this.fechaFinUrna : this.fechaFinDomicilio;
    if (!fecha) return false;
    return day.toDateString() === new Date(fecha + 'T00:00:00').toDateString();
  }

  isInSelectedRange(day: Date, type: 'urna' | 'domicilio'): boolean {
    const inicio = type === 'urna' ? this.fechaInicioUrna : this.fechaInicioDomicilio;
    const fin = type === 'urna' ? this.fechaFinUrna : this.fechaFinDomicilio;
    if (!inicio || !fin) return false;
    return day > new Date(inicio + 'T00:00:00') && day < new Date(fin + 'T00:00:00');
  }

  // ── Selección de rango en el calendario ───────────────────────
  // Primer click = fecha inicio, segundo click = fecha fin
  toggleDay(day: Date, type: 'urna' | 'domicilio') {
    if (!this.isInRange(day)) return;

    const dateStr = day.toISOString().split('T')[0];

    if (type === 'urna') {
      if (!this.fechaInicioUrna || (this.fechaInicioUrna && this.fechaFinUrna)) {
        // Reiniciar selección
        this.fechaInicioUrna = dateStr;
        this.fechaFinUrna = '';
      } else {
        // Segundo click: asignar fin (siempre después del inicio)
        if (new Date(dateStr) < new Date(this.fechaInicioUrna)) {
          this.fechaFinUrna = this.fechaInicioUrna;
          this.fechaInicioUrna = dateStr;
        } else {
          this.fechaFinUrna = dateStr;
        }
      }
      this.errorUrna = '';
    } else {
      if (!this.fechaInicioDomicilio || (this.fechaInicioDomicilio && this.fechaFinDomicilio)) {
        this.fechaInicioDomicilio = dateStr;
        this.fechaFinDomicilio = '';
      } else {
        if (new Date(dateStr) < new Date(this.fechaInicioDomicilio)) {
          this.fechaFinDomicilio = this.fechaInicioDomicilio;
          this.fechaInicioDomicilio = dateStr;
        } else {
          this.fechaFinDomicilio = dateStr;
        }
      }
      this.errorDomicilio = '';
    }
    this.cdr.detectChanges();
  }

  formatDay(dateStr: string): string {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-CO');
  }

  // ── Convierte fecha "YYYY-MM-DD" a "YYYY-MM-DDTHH:mm:ss" ─────
  private toDateTime(date: string, endOfDay = false): string {
    return endOfDay ? `${date}T23:59:59` : `${date}T00:00:00`;
  }

  // ── Submit ────────────────────────────────────────────────────
  onSubmit() {
    this.successMessage = '';
    this.errorMessage = '';
    this.errorUrna = '';
    this.errorDomicilio = '';

    this.eleccionForm.markAllAsTouched();
    this.cdr.detectChanges();

    if (this.eleccionForm.invalid) return;

    // Validar rangos de urna y domicilio si están habilitados
    if (this.votoUrna && (!this.fechaInicioUrna || !this.fechaFinUrna)) {
      this.errorUrna = 'Seleccione el rango de fechas para voto por urna.';
      this.cdr.detectChanges();
      return;
    }

    if (this.votoDomicilio && (!this.fechaInicioDomicilio || !this.fechaFinDomicilio)) {
      this.errorDomicilio = 'Seleccione el rango de fechas para voto por domicilio.';
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();

    const formValue = this.eleccionForm.value;

    // Construir payload según CreateEleccionDTO del back
    const payload: CreateEleccionDTO = {
      nombre: formValue.nombre,
      fechaInicio: this.toDateTime(formValue.fechaInicio),
      fechaFinalizacion: this.toDateTime(formValue.fechaFinalizacion, true),
      tipo: formValue.tipo,
      listaAbierta: formValue.listaAbierta,
      idAdministradorElectoral: formValue.idAdministradorElectoral,
    };

    // Agregar fechas de urna solo si está habilitado
    if (this.votoUrna) {
      payload.fechaInicioUrna = this.toDateTime(this.fechaInicioUrna);
      payload.fechaFinalizacionUrna = this.toDateTime(this.fechaFinUrna, true);
    }

    // Agregar fechas de domicilio solo si está habilitado
    if (this.votoDomicilio) {
      payload.fechaInicioDomicilio = this.toDateTime(this.fechaInicioDomicilio);
      payload.fechaFinalizacionDomicilio = this.toDateTime(this.fechaFinDomicilio, true);
    }

    this.eleccionService.crearEleccion(payload).subscribe({
      next: (response) => {
        queueMicrotask(() => {
          this.loading = false;
          this.showSummary = true;

          this.summary = {
            nombre: formValue.nombre,
            tipo: this.tiposEleccion[formValue.tipo] || formValue.tipo,
            caracter: formValue.listaAbierta ? 'Obligatorio' : 'Voluntario',
            fechas: `${formValue.fechaInicio} al ${formValue.fechaFinalizacion}`,
            urna: this.votoUrna
              ? `${this.formatDay(this.fechaInicioUrna)} al ${this.formatDay(this.fechaFinUrna)}`
              : 'No habilitado',
            domicilio: this.votoDomicilio
              ? `${this.formatDay(this.fechaInicioDomicilio)} al ${this.formatDay(this.fechaFinDomicilio)}`
              : 'No habilitado',
          };

          this.successMessage = `Elección "${formValue.nombre}" creada correctamente.`;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        queueMicrotask(() => {
          this.loading = false;
          this.errorMessage =
            err?.error?.message ||
            'Error al crear la elección. Verifique los datos e intente nuevamente.';
          this.cdr.detectChanges();
        });
      },
    });
  }

  /**
   * Botón volver a inicio
   */
  goHome() {
    this.router.navigate(['/']);
  }
}
