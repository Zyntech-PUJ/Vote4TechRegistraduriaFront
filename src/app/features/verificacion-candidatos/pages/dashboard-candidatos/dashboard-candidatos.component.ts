import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { VerificacionCandidatoService, ResponseCandidatoDTO } from '../../services/verificacion-candidato.service';
import { TarjetaCandidatoComponent } from '../../components/tarjeta-candidato.component';

@Component({
  selector: 'app-dashboard-candidatos',
  standalone: true,
  imports: [CommonModule, FormsModule, TarjetaCandidatoComponent],
  templateUrl: './dashboard-candidatos.component.html',
  styleUrls: ['./dashboard-candidatos.component.scss'],
})
export class DashboardCandidatosComponent implements OnInit {
  candidatos: ResponseCandidatoDTO[] = [];
  loading = true;
  error = false;
  errorMessage = '';

  // Filtros
  filtroEstado: 'todos' | 'pendiente' | 'aprobado' = 'todos';
  busqueda = '';

  estadosDisponibles: Array<'todos' | 'pendiente' | 'aprobado'> = [
    'todos',
    'pendiente',
    'aprobado',
  ];

  constructor(
    private verificacionService: VerificacionCandidatoService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cargarCandidatos();
  }

  /**
   * Cargar candidatos del backend
   */
  cargarCandidatos(): void {
    this.loading = true;
    this.error = false;
    this.cdr.detectChanges();

    this.verificacionService.obtenerCandidatos().subscribe({
      next: (data) => {
        queueMicrotask(() => {
          this.candidatos = data;
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        console.error('Error al cargar candidatos:', err);
        queueMicrotask(() => {
          this.error = true;
          this.errorMessage = 'Error al cargar los candidatos. Intenta de nuevo.';
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
    });
  }

  /**
   * Obtener estado del candidato basado en el atributo 'activo'
   * activo = false → pendiente
   * activo = true → aprobado
   */
  obtenerEstado(candidato: ResponseCandidatoDTO): 'pendiente' | 'aprobado' {
    return candidato.activo ? 'aprobado' : 'pendiente';
  }

  /**
   * Filtrar candidatos según búsqueda y estado
   */
  get candidatosFiltrados(): ResponseCandidatoDTO[] {
    return this.candidatos.filter((candidato) => {
      const coincideBusqueda =
        candidato.nombre.toLowerCase().includes(this.busqueda.toLowerCase()) ||
        candidato.numero.toLowerCase().includes(this.busqueda.toLowerCase());

      const coincideEstado =
        this.filtroEstado === 'todos' ||
        (this.filtroEstado === 'pendiente' && !candidato.activo) ||
        (this.filtroEstado === 'aprobado' && candidato.activo);

      return coincideBusqueda && coincideEstado;
    });
  }

  /**
   * Navegar al detalle del candidato
   */
  verDetalles(idCandidato: number): void {
    this.router.navigate(['/verificacion-candidatos', idCandidato]);
  }

  /**
   * Cambiar filtro de estado
   */
  cambiarFiltro(estado: 'todos' | 'pendiente' | 'aprobado'): void {
    this.filtroEstado = estado;
    this.cdr.detectChanges();
  }

  /**
   * Reintentar carga
   */
  reintentar(): void {
    this.cargarCandidatos();
  }

  /**
   * Volver a la landing
   */
  volverALanding(): void {
    this.router.navigate(['/']);
  }
}