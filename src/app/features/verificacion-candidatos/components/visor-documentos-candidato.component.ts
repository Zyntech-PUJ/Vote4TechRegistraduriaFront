import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { VerificacionCandidatoService } from '../services/verificacion-candidato.service';

interface Documento {
  nombre: string;
  tipo: 'foto' | 'formulario-e6' | 'certificado' | 'cedula' | 'aval';
  label: string;
  icono: string;
  nombreDescarga: string;
}

@Component({
  selector: 'app-visor-documentos-candidato',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './visor-documentos-candidato.component.html',
  styleUrls: ['./visor-documentos-candidato.component.scss'],
})
export class VisorDocumentosCandidatoComponent implements OnInit {
  @Input() idCandidato!: number;

  documentos: Documento[] = [
    {
      nombre: 'foto',
      tipo: 'foto',
      label: 'Fotografía',
      icono: '📷',
      nombreDescarga: 'foto.pdf',
    },
    {
      nombre: 'formularioE6',
      tipo: 'formulario-e6',
      label: 'Formulario E-6',
      icono: '📋',
      nombreDescarga: 'formulario-e6.pdf',
    },
    {
      nombre: 'certificado',
      tipo: 'certificado',
      label: 'Certificado Consejo de Estado',
      icono: '📄',
      nombreDescarga: 'certificado.pdf',
    },
    {
      nombre: 'cedula',
      tipo: 'cedula',
      label: 'Fotocopia Cédula',
      icono: '🆔',
      nombreDescarga: 'cedula.pdf',
    },
    {
      nombre: 'aval',
      tipo: 'aval',
      label: 'Documento Aval',
      icono: '✅',
      nombreDescarga: 'aval.pdf',
    },
  ];

  documentoUrl: { [key: string]: string } = {};
  documentoUrlSanitizada: { [key: string]: SafeResourceUrl } = {};
  documentoError: { [key: string]: boolean } = {};

  constructor(
    private verificacionService: VerificacionCandidatoService,
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
      return; // Ya está cargado
    }

    let request$;

    switch (documento.tipo) {
      case 'foto':
        request$ = this.verificacionService.obtenerFoto(this.idCandidato);
        break;
      case 'formulario-e6':
        request$ = this.verificacionService.obtenerFormularioE6(this.idCandidato);
        break;
      case 'certificado':
        request$ = this.verificacionService.obtenerCertificado(this.idCandidato);
        break;
      case 'cedula':
        request$ = this.verificacionService.obtenerCedula(this.idCandidato);
        break;
      case 'aval':
        request$ = this.verificacionService.obtenerAval(this.idCandidato);
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
      case 'foto':
        request$ = this.verificacionService.obtenerFoto(this.idCandidato);
        break;
      case 'formulario-e6':
        request$ = this.verificacionService.obtenerFormularioE6(this.idCandidato);
        break;
      case 'certificado':
        request$ = this.verificacionService.obtenerCertificado(this.idCandidato);
        break;
      case 'cedula':
        request$ = this.verificacionService.obtenerCedula(this.idCandidato);
        break;
      case 'aval':
        request$ = this.verificacionService.obtenerAval(this.idCandidato);
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