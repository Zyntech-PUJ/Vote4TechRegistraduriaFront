import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
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

  getPartidosAprobados(): Observable<any[]> {
    return this.http.get<any[]>('/api/partido/partidos').pipe(
      catchError((error) => {
        console.error('Error getPartidos:', error);
        return throwError(() => error);
      }),
    );
  }

  getCandidatos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/candidatos`).pipe(
      catchError((error) => {
        console.error('Error getCandidatos:', error);
        return throwError(() => error);
      }),
    );
  }

  // POST con JSON puro — el back ya no espera multipart
  crearCandidato(datosCandidato: any): Observable<CandidatoResponse> {
    return this.http.post<CandidatoResponse>(`${this.apiUrl}/add`, datosCandidato).pipe(
      catchError((error) => {
        console.error('Error crearCandidato:', error);
        return throwError(() => error);
      }),
    );
  }

  // PATCH por archivo individual — multipart va aquí
  subirArchivo(idCandidato: number, campo: string, archivo: File): Observable<any> {
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
