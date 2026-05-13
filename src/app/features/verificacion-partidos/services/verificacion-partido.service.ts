import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface ResponsePartidoDTO {
  idPartido: number;
  nombre: string;
  sigla: string;
  activo: boolean;
  idRegistrador: number;
}

@Injectable({
  providedIn: 'root',
})
export class VerificacionPartidoService {
  private apiUrl = '/api/partido';

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los partidos
   */
  obtenerPartidos(): Observable<ResponsePartidoDTO[]> {
    return this.http.get<ResponsePartidoDTO[]>(`${this.apiUrl}/partidos`).pipe(
      catchError((error) => {
        console.error('Error obtenerPartidos:', error);
        return throwError(() => error);
      }),
    );
  }

  /**
   * Obtiene un partido específico por ID
   */
  obtenerPartidoPorId(idPartido: number): Observable<ResponsePartidoDTO> {
    return this.http.get<ResponsePartidoDTO>(`${this.apiUrl}/${idPartido}`).pipe(
      catchError((error) => {
        console.error('Error obtenerPartidoPorId:', error);
        return throwError(() => error);
      }),
    );
  }

  /**
   * Obtiene el logo del partido
   */
  obtenerLogo(idPartido: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${idPartido}/logo`, { responseType: 'blob' }).pipe(
      catchError((error) => {
        console.error('Error obtenerLogo:', error);
        return throwError(() => error);
      }),
    );
  }

  /**
   * Obtiene los estatutos del partido
   */
  obtenerEstatutos(idPartido: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${idPartido}/estatutos`, { responseType: 'blob' }).pipe(
      catchError((error) => {
        console.error('Error obtenerEstatutos:', error);
        return throwError(() => error);
      }),
    );
  }

  /**
   * Obtiene la plataforma ideológica del partido
   */
  obtenerPlataforma(idPartido: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${idPartido}/plataforma`, { responseType: 'blob' }).pipe(
      catchError((error) => {
        console.error('Error obtenerPlataforma:', error);
        return throwError(() => error);
      }),
    );
  }

  /**
   * Obtiene el certificado de representatividad del partido
   */
  obtenerCertificado(idPartido: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${idPartido}/certificado`, { responseType: 'blob' }).pipe(
      catchError((error) => {
        console.error('Error obtenerCertificado:', error);
        return throwError(() => error);
      }),
    );
  }

  /**
   * Obtiene el registro de afiliados y directivos del partido
   */
  obtenerRegistro(idPartido: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${idPartido}/registro`, { responseType: 'blob' }).pipe(
      catchError((error) => {
        console.error('Error obtenerRegistro:', error);
        return throwError(() => error);
      }),
    );
  }

  /**
   * Aprueba un partido (pone activo en true)
   */
  aprobarPartido(partido: ResponsePartidoDTO): Observable<ResponsePartidoDTO> {
    const payload = {
      ...partido,
      activo: true,
    };
    return this.http.patch<ResponsePartidoDTO>(`${this.apiUrl}/${partido.idPartido}`, payload).pipe(
      catchError((error) => {
        console.error('Error aprobarPartido:', error);
        return throwError(() => error);
      }),
    );
  }

  /**
   * Rechaza un partido (pone activo en false)
   */
  rechazarPartido(partido: ResponsePartidoDTO): Observable<ResponsePartidoDTO> {
    const payload = {
      ...partido,
      activo: false,
    };
    return this.http.patch<ResponsePartidoDTO>(`${this.apiUrl}/${partido.idPartido}`, payload).pipe(
      catchError((error) => {
        console.error('Error rechazarPartido:', error);
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
