import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { VerificacionPartidoService } from '../services/verificacion-partido.service';

interface Documento {
  tipo: 'logo' | 'estatutos' | 'plataforma' | 'certificado' | 'registro';
  label: string;
  icono: string;
  nombreDescarga: string;
}

@Component({
  selector: 'app-visor-documentos-partido',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './visor-documentos-partido.component.html',
  styleUrls: ['./visor-documentos-partido.component.scss'],
})
export class VisorDocumentosPartidoComponent {
  @Input() idPartido!: number;

  documentos: Documento[] = [
    { tipo: 'logo', label: 'Logo-Símbolo', icono: '🏛️', nombreDescarga: 'logo.pdf' },
    { tipo: 'estatutos', label: 'Estatutos', icono: '📋', nombreDescarga: 'estatutos.pdf' },
    {
      tipo: 'plataforma',
      label: 'Plataforma Ideológica',
      icono: '📄',
      nombreDescarga: 'plataforma.pdf',
    },
    {
      tipo: 'certificado',
      label: 'Certificado de Representatividad',
      icono: '✅',
      nombreDescarga: 'certificado.pdf',
    },
    {
      tipo: 'registro',
      label: 'Registro de Afiliados y Directivos',
      icono: '📑',
      nombreDescarga: 'registro.pdf',
    },
  ];

  cargando: { [key: string]: boolean } = {};
  documentoUrl: { [key: string]: string } = {};
  documentoUrlSanitizada: { [key: string]: SafeResourceUrl } = {};
  documentoError: { [key: string]: string } = {};

  constructor(
    private verificacionService: VerificacionPartidoService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
  ) {}

  // Solo carga cuando el usuario hace click
  verDocumento(documento: Documento): void {
    if (this.documentoUrl[documento.tipo] || this.cargando[documento.tipo]) return;

    this.cargando[documento.tipo] = true;
    this.documentoError[documento.tipo] = '';
    this.cdr.detectChanges();

    let request$;
    switch (documento.tipo) {
      case 'logo':
        request$ = this.verificacionService.obtenerLogo(this.idPartido);
        break;
      case 'estatutos':
        request$ = this.verificacionService.obtenerEstatutos(this.idPartido);
        break;
      case 'plataforma':
        request$ = this.verificacionService.obtenerPlataforma(this.idPartido);
        break;
      case 'certificado':
        request$ = this.verificacionService.obtenerCertificado(this.idPartido);
        break;
      case 'registro':
        request$ = this.verificacionService.obtenerRegistro(this.idPartido);
        break;
      default:
        return;
    }

    request$.subscribe({
      next: (blob: Blob) => {
        queueMicrotask(() => {
          const url = URL.createObjectURL(blob);
          this.documentoUrl[documento.tipo] = url;
          this.documentoUrlSanitizada[documento.tipo] =
            this.sanitizer.bypassSecurityTrustResourceUrl(url);
          this.cargando[documento.tipo] = false;
          this.cdr.detectChanges();
        });
      },
      error: () => {
        queueMicrotask(() => {
          this.cargando[documento.tipo] = false;
          this.documentoError[documento.tipo] = 'No se pudo cargar el documento';
          this.cdr.detectChanges();
        });
      },
    });
  }

  descargarDocumento(documento: Documento): void {
    let request$;
    switch (documento.tipo) {
      case 'logo':
        request$ = this.verificacionService.obtenerLogo(this.idPartido);
        break;
      case 'estatutos':
        request$ = this.verificacionService.obtenerEstatutos(this.idPartido);
        break;
      case 'plataforma':
        request$ = this.verificacionService.obtenerPlataforma(this.idPartido);
        break;
      case 'certificado':
        request$ = this.verificacionService.obtenerCertificado(this.idPartido);
        break;
      case 'registro':
        request$ = this.verificacionService.obtenerRegistro(this.idPartido);
        break;
      default:
        return;
    }
    request$.subscribe({
      next: (blob: Blob) =>
        this.verificacionService.descargarArchivo(blob, documento.nombreDescarga),
      error: (err) => console.error(`Error al descargar ${documento.label}:`, err),
    });
  }

  estaCargado(tipo: string): boolean {
    return !!this.documentoUrl[tipo];
  }
  esCargando(tipo: string): boolean {
    return !!this.cargando[tipo];
  }
  hayError(tipo: string): boolean {
    return !!this.documentoError[tipo];
  }
  getMensajeError(tipo: string): string {
    return this.documentoError[tipo] || '';
  }
}
