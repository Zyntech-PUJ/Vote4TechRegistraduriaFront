import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface ResponseCandidatoDTO {
  idCandidato: number;
  nombre: string;
  numero: string;
  fotoUrl: string;
  activo: boolean;
  idLista: number;
  idPartido: number;
  idRegistrador: number;
}

@Injectable({
  providedIn: 'root',
})
export class VerificacionCandidatoService {
  private apiUrl = '/api/candidato';

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los candidatos
   */
  obtenerCandidatos(): Observable<ResponseCandidatoDTO[]> {
    return this.http.get<ResponseCandidatoDTO[]>(`${this.apiUrl}/candidatos`).pipe(
      catchError((error) => {
        console.error('Error obtenerCandidatos:', error);
        return throwError(() => error);
      }),
    );
  }

  /**
   * Obtiene un candidato específico por ID
   */
  obtenerCandidatoPorId(idCandidato: number): Observable<ResponseCandidatoDTO> {
    return this.http.get<ResponseCandidatoDTO>(`${this.apiUrl}/${idCandidato}`).pipe(
      catchError((error) => {
        console.error('Error obtenerCandidatoPorId:', error);
        return throwError(() => error);
      }),
    );
  }

  /**
   * Obtiene la foto del candidato
   */
  obtenerFoto(idCandidato: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${idCandidato}/foto`, { responseType: 'blob' }).pipe(
      catchError((error) => {
        console.error('Error obtenerFoto:', error);
        return throwError(() => error);
      }),
    );
  }

  /**
   * Obtiene el formulario E6 del candidato
   */
  obtenerFormularioE6(idCandidato: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${idCandidato}/formulario-e6`, { responseType: 'blob' }).pipe(
      catchError((error) => {
        console.error('Error obtenerFormularioE6:', error);
        return throwError(() => error);
      }),
    );
  }

  /**
   * Obtiene el certificado del candidato
   */
  obtenerCertificado(idCandidato: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${idCandidato}/certificado`, { responseType: 'blob' }).pipe(
      catchError((error) => {
        console.error('Error obtenerCertificado:', error);
        return throwError(() => error);
      }),
    );
  }

  /**
   * Obtiene la cédula del candidato
   */
  obtenerCedula(idCandidato: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${idCandidato}/cedula`, { responseType: 'blob' }).pipe(
      catchError((error) => {
        console.error('Error obtenerCedula:', error);
        return throwError(() => error);
      }),
    );
  }

  /**
   * Obtiene el documento aval del candidato
   */
  obtenerAval(idCandidato: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${idCandidato}/aval`, { responseType: 'blob' }).pipe(
      catchError((error) => {
        console.error('Error obtenerAval:', error);
        return throwError(() => error);
      }),
    );
  }

  /**
   * Aprueba un candidato (pone activo en true)
   * Necesita enviar el candidato completo
   */
  aprobarCandidato(candidato: ResponseCandidatoDTO): Observable<ResponseCandidatoDTO> {
    const payload = {
      ...candidato,
      activo: true,
    };
    return this.http.put<ResponseCandidatoDTO>(`${this.apiUrl}/${candidato.idCandidato}`, payload).pipe(
      catchError((error) => {
        console.error('Error aprobarCandidato:', error);
        return throwError(() => error);
      }),
    );
  }

  /**
   * Rechaza un candidato (pone activo en false)
   * Necesita enviar el candidato completo
   */
  rechazarCandidato(candidato: ResponseCandidatoDTO): Observable<ResponseCandidatoDTO> {
    const payload = {
      ...candidato,
      activo: false,
    };
    return this.http.put<ResponseCandidatoDTO>(`${this.apiUrl}/${candidato.idCandidato}`, payload).pipe(
      catchError((error) => {
        console.error('Error rechazarCandidato:', error);
        return throwError(() => error);
      }),
    );
  }

  /**
   * Descarga un archivo
   */
  descargarArchivo(blob: Blob, nombre: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombre;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Obtiene URL de blob para visualizar
   */
  obtenerURLBlob(blob: Blob): string {
    return window.URL.createObjectURL(blob);
  }
}