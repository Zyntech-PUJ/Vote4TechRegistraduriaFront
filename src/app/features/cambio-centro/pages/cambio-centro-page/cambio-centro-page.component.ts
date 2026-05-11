import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { CitizenCardComponent } from '../../components/citizen-card/citizen-card.component';
import { HistoryCardComponent } from '../../components/history-card/history-card.component';

@Component({
  selector: 'app-cambio-centro-page',
  standalone: true,
  imports: [CommonModule, FormsModule, CitizenCardComponent, HistoryCardComponent],
  templateUrl: './cambio-centro-page.component.html',
  styleUrls: ['./cambio-centro-page.component.scss'],
})
export class CambioCentroPageComponent {
  cedula: string = '';
  selectedCenter: string = '';

  loadingSearch = false;
  loadingSubmit = false;

  citizen: any = null;
  showHistory = false;
  timestamp: string = '';

  successMessage = '';
  errorMessage = '';
  errorCedula = '';
  errorCentro = '';

  MOCK_CITIZENS: any = {
    '1234567890': {
      name: 'Carlos Andrés Martínez Peña',
      center: 'IE Colegio Nacional Camilo Torres · Bogotá',
    },
    '9876543210': {
      name: 'María Fernanda López Rodríguez',
      center: 'IE Liceo Antioqueño · Medellín',
    },
    '1122334455': {
      name: 'José Luis Gómez Vargas',
      center: 'Universidad del Valle — Campus Meléndez',
    },
    '5544332211': {
      name: 'Ana Patricia Sánchez Torres',
      center: 'IE Santa Librada · Cali',
    },
  };

  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {}

  buscarCiudadano() {
    this.clearMessages();
    this.cdr.detectChanges();

    if (!this.cedula || this.cedula.trim() === '') {
      this.errorCedula = 'Ingrese el número de cédula del ciudadano.';
      this.cdr.detectChanges();
      return;
    }

    if (this.cedula.length < 6) {
      this.errorCedula = 'La cédula debe tener al menos 6 dígitos.';
      this.cdr.detectChanges();
      return;
    }

    this.loadingSearch = true;
    this.cdr.detectChanges();

    setTimeout(() => {
      queueMicrotask(() => {
        this.loadingSearch = false;
        const data = this.MOCK_CITIZENS[this.cedula];

        if (!data) {
          this.errorCedula = 'No se encontró ningún ciudadano con esa cédula.';
          this.cdr.detectChanges();
          return;
        }

        this.citizen = { ...data, cedula: this.cedula };
        this.showHistory = true;
        this.cdr.detectChanges();
      });
    }, 1200);
  }

  cambiarCentro() {
    this.clearMessages();
    this.cdr.detectChanges();

    if (!this.selectedCenter || this.selectedCenter === '') {
      this.errorCentro = 'Debe seleccionar un nuevo centro de votación.';
      this.cdr.detectChanges();
      return;
    }

    this.loadingSubmit = true;
    this.cdr.detectChanges();

    setTimeout(() => {
      queueMicrotask(() => {
        this.loadingSubmit = false;

        this.timestamp = new Date().toLocaleString('es-CO', {
          dateStyle: 'medium',
          timeStyle: 'medium',
        });

        this.successMessage =
          `Centro de votación actualizado correctamente para ${this.citizen?.name}. ` +
          `La operación quedó registrada en el log de auditoría.`;

        this.cdr.detectChanges();
      });
    }, 1400);
  }

  resetForm() {
    this.cedula = '';
    this.selectedCenter = '';
    this.citizen = null;
    this.showHistory = false;
    this.timestamp = '';
    this.clearMessages();
    this.cdr.detectChanges();
  }

  clearMessages() {
    this.successMessage = '';
    this.errorMessage = '';
    this.errorCedula = '';
    this.errorCentro = '';
  }

  /**
   * Botón volver a inicio
   */
  goHome() {
    this.router.navigate(['/']);
  }
}
