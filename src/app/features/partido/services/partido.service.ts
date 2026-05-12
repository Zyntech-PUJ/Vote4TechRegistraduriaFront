import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, forkJoin } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

interface PartidoResponse {
  idPartido: number;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root',
})
export class PartidoService {
  private apiUrl = '/api/partido';

  constructor(private http: HttpClient) {}

  /**
   * FLUJO CORRECTO:
   * 1. POST crear partido (solo JSON)
   * 2. PATCH para cada documento (secuencial)
   */
  crearPartidoConDocumentos(datosPartido: any, archivos: { [key: string]: File }): Observable<any> {
    // PASO 1: Crear el partido (POST con JSON)
    return this.http.post<PartidoResponse>(`${this.apiUrl}/add`, datosPartido).pipe(
      // PASO 2: Una vez creado, obtener el ID y subir archivos
      switchMap((response: PartidoResponse) => {
        const idPartido = response.idPartido;
        console.log('Partido creado con ID:', idPartido);

        // Mapear archivos a observables de PATCH
        const patchRequests$: Observable<any>[] = [];

        if (archivos['logo']) {
          patchRequests$.push(this.subirArchivoPartido(idPartido, 'logo', archivos['logo']));
        }
        if (archivos['estatutos']) {
          patchRequests$.push(
            this.subirArchivoPartido(idPartido, 'estatutos', archivos['estatutos']),
          );
        }
        if (archivos['plataforma']) {
          patchRequests$.push(
            this.subirArchivoPartido(idPartido, 'plataforma', archivos['plataforma']),
          );
        }
        if (archivos['registro']) {
          patchRequests$.push(
            this.subirArchivoPartido(idPartido, 'registro', archivos['registro']),
          );
        }
        if (archivos['certificado']) {
          patchRequests$.push(
            this.subirArchivoPartido(idPartido, 'certificado', archivos['certificado']),
          );
        }

        // Ejecutar todos los PATCH en secuencia (uno tras otro)
        return patchRequests$.length > 0
          ? forkJoin(patchRequests$)
          : throwError(() => new Error('No hay archivos para subir'));
      }),
      catchError((error) => {
        console.error('Error en crearPartidoConDocumentos:', error);
        return throwError(() => error);
      }),
    );
  }

  /**
   * PATCH para subir cada documento individualmente
   * Corresponde a: PATCH /partido/{idPartido}/{campo}
   */
  private subirArchivoPartido(idPartido: number, campo: string, archivo: File): Observable<any> {
    const formData = new FormData();
    formData.append(campo, archivo);

    console.log(`📤 Subiendo ${campo} para partido ${idPartido}...`);

    return this.http.patch(`${this.apiUrl}/${idPartido}/${campo}`, formData).pipe(
      catchError((error) => {
        console.error(`Error subiendo ${campo}:`, error);
        return throwError(() => error);
      }),
    );
  }

  /**
   * Obtener todos los partidos
   */
  listarPartidos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/partidos`).pipe(
      catchError((error) => {
        console.error('Error listarPartidos:', error);
        return throwError(() => error);
      }),
    );
  }
}
