import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, forkJoin } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CandidatoService {
  private apiUrl = '/api/candidato';
  private partidoUrl = '/api/partido';

  constructor(private http: HttpClient) {}

  getCandidatos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/candidatos`).pipe(
      catchError((error) => {
        console.error('Error getCandidatos:', error);
        return throwError(() => error);
      }),
    );
  }

  // Obtiene partidos aprobados para el dropdown del formulario
  getPartidosAprobados(): Observable<any[]> {
    return this.http.get<any[]>(`${this.partidoUrl}/partidos`).pipe(
      map((partidos) => partidos.filter((p) => p.estado === 'APROBADO' || p.activo === true)),
      catchError((error) => {
        console.error('Error getPartidos:', error);
        return throwError(() => error);
      }),
    );
  }

  /**
   * NUEVO FLUJO:
   * 1. POST candidato sin archivos → obtiene idCandidato
   * 2. Retorna el objeto con el ID
   */
  crearCandidato(data: any): Observable<any> {
    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));

    return this.http.post(`${this.apiUrl}/add`, formData).pipe(
      catchError((error) => {
        console.error('Error crearCandidato:', error);
        return throwError(() => error);
      }),
    );
  }

  /**
   * PATCH archivo individual
   * Sube un archivo específico para un candidato ya creado
   */
  subirArchivoCandidato(idCandidato: number, campo: string, archivo: File): Observable<any> {
    const formData = new FormData();
    formData.append(campo, archivo);

    return this.http.patch(`${this.apiUrl}/${idCandidato}/${campo}`, formData).pipe(
      catchError((error) => {
        console.error(`Error subiendo ${campo}:`, error);
        return throwError(() => error);
      }),
    );
  }

  /**
   * Sube TODOS los archivos secuencialmente
   * Espera a que se cree el candidato, luego sube cada archivo
   */
  subirTodosLosArchivos(idCandidato: number, archivos: { [key: string]: File }): Observable<any> {
    const requests: Observable<any>[] = [];

    Object.entries(archivos).forEach(([campo, archivo]) => {
      requests.push(this.subirArchivoCandidato(idCandidato, campo, archivo));
    });

    // forkJoin espera a que todos terminen
    return forkJoin(requests).pipe(
      catchError((error) => {
        console.error('Error en carga de archivos:', error);
        return throwError(() => error);
      }),
    );
  }
}
