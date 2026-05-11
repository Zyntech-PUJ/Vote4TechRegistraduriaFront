import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, forkJoin } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PartidoService {
  private apiUrl = '/api/partido';

  constructor(private http: HttpClient) {}

  /**
   * POST partido sin archivos
   */
  crearPartido(data: any): Observable<any> {
    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));

    return this.http.post(`${this.apiUrl}/add`, formData).pipe(
      catchError((error) => {
        console.error('Error crearPartido:', error);
        return throwError(() => error);
      }),
    );
  }

  /**
   * PATCH archivo individual
   */
  subirArchivoPartido(idPartido: number, campo: string, archivo: File): Observable<any> {
    const formData = new FormData();
    formData.append(campo, archivo);

    return this.http.patch(`${this.apiUrl}/${idPartido}/${campo}`, formData).pipe(
      catchError((error) => {
        console.error(`Error subiendo ${campo}:`, error);
        return throwError(() => error);
      }),
    );
  }

  /**
   * Sube TODOS los archivos
   */
  subirTodosLosArchivos(idPartido: number, archivos: { [key: string]: File }): Observable<any> {
    const requests: Observable<any>[] = [];

    Object.entries(archivos).forEach(([campo, archivo]) => {
      requests.push(this.subirArchivoPartido(idPartido, campo, archivo));
    });

    return forkJoin(requests).pipe(
      catchError((error) => {
        console.error('Error en carga de archivos:', error);
        return throwError(() => error);
      }),
    );
  }

  listarPartidos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/partidos`).pipe(
      catchError((error) => {
        console.error('Error listarPartidos:', error);
        return throwError(() => error);
      }),
    );
  }
}
