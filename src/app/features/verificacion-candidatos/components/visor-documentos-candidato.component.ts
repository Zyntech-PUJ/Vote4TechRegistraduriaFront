import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { VerificacionCandidatoService } from '../services/verificacion-candidato.service';

interface Documento {
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
export class VisorDocumentosCandidatoComponent {
  @Input() idCandidato!: number;

  documentos: Documento[] = [
    { tipo: 'foto', label: 'Fotografía', icono: '📷', nombreDescarga: 'foto.pdf' },
    {
      tipo: 'formulario-e6',
      label: 'Formulario E-6',
      icono: '📋',
      nombreDescarga: 'formulario-e6.pdf',
    },
    {
      tipo: 'certificado',
      label: 'Certificado Consejo de Estado',
      icono: '📄',
      nombreDescarga: 'certificado.pdf',
    },
    { tipo: 'cedula', label: 'Fotocopia Cédula', icono: '🆔', nombreDescarga: 'cedula.pdf' },
    { tipo: 'aval', label: 'Documento Aval', icono: '✅', nombreDescarga: 'aval.pdf' },
  ];

  // Estado por documento
  cargando: { [key: string]: boolean } = {};
  documentoUrl: { [key: string]: string } = {};
  documentoUrlSanitizada: { [key: string]: SafeResourceUrl } = {};
  documentoError: { [key: string]: string } = {};

  constructor(
    private verificacionService: VerificacionCandidatoService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
  ) {}

  // ✅ Solo carga cuando el usuario hace click — no en ngOnInit
  verDocumento(documento: Documento): void {
    if (this.documentoUrl[documento.tipo] || this.cargando[documento.tipo]) return;

    this.cargando[documento.tipo] = true;
    this.documentoError[documento.tipo] = '';
    this.cdr.detectChanges();

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
