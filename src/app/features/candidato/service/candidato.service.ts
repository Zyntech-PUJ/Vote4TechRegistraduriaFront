import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, forkJoin } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

interface CandidatoResponse {
  idCandidato: number;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root',
})
export class CandidatoService {
  private apiUrl = '/api/candidato';

  constructor(private http: HttpClient) {}

  /**
   * Obtener partidos aprobados
   */
  getPartidosAprobados(): Observable<any[]> {
    return this.http.get<any[]>('/api/partido/partidos').pipe(
      catchError((error) => {
        console.error('Error getPartidos:', error);
        return throwError(() => error);
      }),
    );
  }

  /**
   * FLUJO CORRECTO:
   * 1. POST crear candidato (solo JSON)
   * 2. PATCH para cada documento (secuencial)
   */
  crearCandidatoConDocumentos(
    datosCandidato: any,
    archivos: { [key: string]: File },
  ): Observable<any> {
    // PASO 1: Convertir datos a FormData (NO JSON)
    const formDataPost = new FormData();
    formDataPost.append('data', JSON.stringify(datosCandidato));

    return this.http.post<CandidatoResponse>(`${this.apiUrl}/add`, formDataPost).pipe(
      // PASO 2: Una vez creado, obtener el ID y subir archivos
      switchMap((response: CandidatoResponse) => {
        const idCandidato = response.idCandidato;
        console.log('Candidato creado con ID:', idCandidato);

        // Mapear archivos a observables de PATCH
        const patchRequests$: Observable<any>[] = [];

        if (archivos['foto']) {
          patchRequests$.push(this.subirArchivoCandidato(idCandidato, 'foto', archivos['foto']));
        }
        if (archivos['e6']) {
          patchRequests$.push(
            this.subirArchivoCandidato(idCandidato, 'formularioE6', archivos['e6']),
          );
        }
        if (archivos['cert']) {
          patchRequests$.push(
            this.subirArchivoCandidato(idCandidato, 'certificado', archivos['cert']),
          );
        }
        if (archivos['cedula']) {
          patchRequests$.push(
            this.subirArchivoCandidato(idCandidato, 'cedula', archivos['cedula']),
          );
        }
        if (archivos['aval']) {
          patchRequests$.push(this.subirArchivoCandidato(idCandidato, 'aval', archivos['aval']));
        }

        // Ejecutar todos los PATCH en secuencia (uno tras otro)
        return patchRequests$.length > 0
          ? forkJoin(patchRequests$)
          : throwError(() => new Error('No hay archivos para subir'));
      }),
      catchError((error) => {
        console.error('Error en crearCandidatoConDocumentos:', error);
        return throwError(() => error);
      }),
    );
  }

  /**
   * PATCH para subir cada documento individualmente
   * Corresponde a: PATCH /candidato/{idCandidato}/{campo}
   */
  private subirArchivoCandidato(
    idCandidato: number,
    campo: string,
    archivo: File,
  ): Observable<any> {
    const formData = new FormData();
    formData.append(campo, archivo);

    console.log(`📤 Subiendo ${campo} para candidato ${idCandidato}...`);

    return this.http.patch(`${this.apiUrl}/${idCandidato}/${campo}`, formData).pipe(
      catchError((error) => {
        console.error(`Error subiendo ${campo}:`, error);
        return throwError(() => error);
      }),
    );
  }

  /**
   * Obtener todos los candidatos
   */
  getCandidatos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/candidatos`).pipe(
      catchError((error) => {
        console.error('Error getCandidatos:', error);
        return throwError(() => error);
      }),
    );
  }
}
