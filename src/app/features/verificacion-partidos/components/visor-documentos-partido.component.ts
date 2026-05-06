import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { VerificacionPartidoService } from '../services/verificacion-partido.service';

interface Documento {
  nombre: string;
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
export class VisorDocumentosPartidoComponent implements OnInit {
  @Input() idPartido!: number;

  documentos: Documento[] = [
    {
      nombre: 'logo',
      tipo: 'logo',
      label: 'Logo-Símbolo',
      icono: '🏛️',
      nombreDescarga: 'logo.pdf',
    },
    {
      nombre: 'estatutos',
      tipo: 'estatutos',
      label: 'Estatutos',
      icono: '📋',
      nombreDescarga: 'estatutos.pdf',
    },
    {
      nombre: 'plataforma',
      tipo: 'plataforma',
      label: 'Plataforma Ideológica',
      icono: '📄',
      nombreDescarga: 'plataforma.pdf',
    },
    {
      nombre: 'certificado',
      tipo: 'certificado',
      label: 'Certificado de Representatividad',
      icono: '✅',
      nombreDescarga: 'certificado.pdf',
    },
    {
      nombre: 'registro',
      tipo: 'registro',
      label: 'Registro de Afiliados y Directivos',
      icono: '📑',
      nombreDescarga: 'registro.pdf',
    },
  ];

  documentoUrl: { [key: string]: string } = {};
  documentoUrlSanitizada: { [key: string]: SafeResourceUrl } = {};
  documentoError: { [key: string]: boolean } = {};

  constructor(
    private verificacionService: VerificacionPartidoService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    // Cargar todos los documentos automáticamente al inicializar
    this.cargarTodosLosDocumentos();
  }

  /**
   * Cargar todos los documentos automáticamente
   */
  private cargarTodosLosDocumentos(): void {
    this.documentos.forEach((documento) => {
      this.cargarDocumento(documento);
    });
  }

  /**
   * Cargar documento y obtener URL para visualización
   */
  cargarDocumento(documento: Documento): void {
    if (this.documentoUrl[documento.tipo]) {
      return;
    }

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
          const url = this.verificacionService.obtenerURLBlob(blob);
          this.documentoUrl[documento.tipo] = url;
          // Sanitizar para embeds PDF
          this.documentoUrlSanitizada[documento.tipo] = this.sanitizer.bypassSecurityTrustResourceUrl(url);
          this.documentoError[documento.tipo] = false;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        console.error(`Error al cargar ${documento.label}:`, err);
        queueMicrotask(() => {
          this.documentoError[documento.tipo] = true;
          this.cdr.detectChanges();
        });
      },
    });
  }

  /**
   * Descargar documento
   */
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
      next: (blob: Blob) => {
        this.verificacionService.descargarArchivo(blob, documento.nombreDescarga);
      },
      error: (err) => {
        console.error(`Error al descargar ${documento.label}:`, err);
      },
    });
  }

  /**
   * Verificar si el documento está cargado
   */
  estaCargado(tipo: string): boolean {
    return !!this.documentoUrl[tipo];
  }

  /**
   * Verificar si hay error
   */
  hayError(tipo: string): boolean {
    return this.documentoError[tipo] || false;
  }
}