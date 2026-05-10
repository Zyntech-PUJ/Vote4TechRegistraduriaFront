import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
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
      map((partidos) =>
        // Filtramos solo los aprobados según el estado que devuelva el back
        partidos.filter((p) => p.estado === 'APROBADO' || p.activo === true),
      ),
      catchError((error) => {
        console.error('Error getPartidos:', error);
        return throwError(() => error);
      }),
    );
  }

  createCandidato(data: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, data).pipe(
      catchError((error) => {
        console.error('Error createCandidato:', error);
        return throwError(() => error);
      }),
    );
  }

  // PATCH archivo individual — nuevo flujo del back
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
}
