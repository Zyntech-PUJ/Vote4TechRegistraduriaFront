import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ResponseCandidatoDTO } from '../services/verificacion-candidato.service';
import { VerificacionCandidatoService } from '../services/verificacion-candidato.service';

@Component({
  selector: 'app-tarjeta-candidato',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tarjeta-candidato.component.html',
  styleUrls: ['./tarjeta-candidato.component.scss'],
})
export class TarjetaCandidatoComponent implements OnInit {
  @Input() candidato!: ResponseCandidatoDTO;
  @Input() estado: 'pendiente' | 'aprobado' = 'pendiente';
  @Output() verDetalles = new EventEmitter<number>();

  fotoPdfUrl: SafeResourceUrl | null = null;
  cargandoFoto = false;
  errorFoto = false;

  constructor(
    private verificacionService: VerificacionCandidatoService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cargarFoto();
  }

  /**
   * Cargar foto (PDF) del candidato
   */
  private cargarFoto(): void {
    this.cargandoFoto = true;
    this.cdr.detectChanges();

    this.verificacionService.obtenerFoto(this.candidato.idCandidato).subscribe({
      next: (blob: Blob) => {
        queueMicrotask(() => {
          const url = this.verificacionService.obtenerURLBlob(blob);
          this.fotoPdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
          this.cargandoFoto = false;
          this.errorFoto = false;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        console.error('Error al cargar foto:', err);
        queueMicrotask(() => {
          this.cargandoFoto = false;
          this.errorFoto = true;
          this.cdr.detectChanges();
        });
      },
    });
  }

  onVerDetalles(): void {
    this.verDetalles.emit(this.candidato.idCandidato);
  }

  /**
   * Obtiene el color del estado
   */
  getColorEstado(): string {
    const colores: Record<string, string> = {
      pendiente: '#facc15',
      aprobado: '#10b981',
    };
    return colores[this.estado] || '#facc15';
  }

  /**
   * Obtiene el texto del estado en mayúscula
   */
  getTextoEstado(): string {
    const textos: Record<string, string> = {
      pendiente: 'PENDIENTE',
      aprobado: 'APROBADO',
    };
    return textos[this.estado] || 'PENDIENTE';
  }
}