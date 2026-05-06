import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { VerificacionPartidoService, ResponsePartidoDTO } from '../../services/verificacion-partido.service';
import { TarjetaPartidoComponent } from '../../components/tarjeta-partido.component';

@Component({
  selector: 'app-dashboard-partidos',
  standalone: true,
  imports: [CommonModule, FormsModule, TarjetaPartidoComponent],
  templateUrl: './dashboard-partidos.component.html',
  styleUrls: ['./dashboard-partidos.component.scss'],
})
export class DashboardPartidosComponent implements OnInit {
  partidos: ResponsePartidoDTO[] = [];
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
    private verificacionService: VerificacionPartidoService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cargarPartidos();
  }

  /**
   * Cargar partidos del backend
   */
  cargarPartidos(): void {
    this.loading = true;
    this.error = false;
    this.cdr.detectChanges();

    this.verificacionService.obtenerPartidos().subscribe({
      next: (data) => {
        queueMicrotask(() => {
          this.partidos = data;
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        console.error('Error al cargar partidos:', err);
        queueMicrotask(() => {
          this.error = true;
          this.errorMessage = 'Error al cargar los partidos. Intenta de nuevo.';
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
    });
  }

  /**
   * Obtener estado del partido basado en el atributo 'activo'
   * activo = false → pendiente
   * activo = true → aprobado
   */
  obtenerEstado(partido: ResponsePartidoDTO): 'pendiente' | 'aprobado' {
    return partido.activo ? 'aprobado' : 'pendiente';
  }

  /**
   * Filtrar partidos según búsqueda y estado
   */
  get partidosFiltrados(): ResponsePartidoDTO[] {
    return this.partidos.filter((partido) => {
      const coincideBusqueda =
        partido.nombre.toLowerCase().includes(this.busqueda.toLowerCase()) ||
        partido.sigla.toLowerCase().includes(this.busqueda.toLowerCase());

      const coincideEstado =
        this.filtroEstado === 'todos' ||
        (this.filtroEstado === 'pendiente' && !partido.activo) ||
        (this.filtroEstado === 'aprobado' && partido.activo);

      return coincideBusqueda && coincideEstado;
    });
  }

  /**
   * Navegar al detalle del partido
   */
  verDetalles(idPartido: number): void {
    this.router.navigate(['/verificacion-partidos', idPartido]);
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
    this.cargarPartidos();
  }

  /**
   * Volver a la landing
   */
  volverALanding(): void {
    this.router.navigate(['/']);
  }
}