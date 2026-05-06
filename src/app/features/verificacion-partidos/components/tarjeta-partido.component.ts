import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ResponsePartidoDTO } from '../services/verificacion-partido.service';
import { VerificacionPartidoService } from '../services/verificacion-partido.service';

@Component({
  selector: 'app-tarjeta-partido',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tarjeta-partido.component.html',
  styleUrls: ['./tarjeta-partido.component.scss'],
})
export class TarjetaPartidoComponent implements OnInit {
  @Input() partido!: ResponsePartidoDTO;
  @Input() estado: 'pendiente' | 'aprobado' = 'pendiente';
  @Output() verDetalles = new EventEmitter<number>();

  logoPdfUrl: SafeResourceUrl | null = null;
  cargandoLogo = false;
  errorLogo = false;

  constructor(
    private verificacionService: VerificacionPartidoService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cargarLogo();
  }

  /**
   * Cargar logo (PDF) del partido
   */
  private cargarLogo(): void {
    this.cargandoLogo = true;
    this.cdr.detectChanges();

    this.verificacionService.obtenerLogo(this.partido.idPartido).subscribe({
      next: (blob: Blob) => {
        queueMicrotask(() => {
          const url = this.verificacionService.obtenerURLBlob(blob);
          this.logoPdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
          this.cargandoLogo = false;
          this.errorLogo = false;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        console.error('Error al cargar logo:', err);
        queueMicrotask(() => {
          this.cargandoLogo = false;
          this.errorLogo = true;
          this.cdr.detectChanges();
        });
      },
    });
  }

  onVerDetalles(): void {
    this.verDetalles.emit(this.partido.idPartido);
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