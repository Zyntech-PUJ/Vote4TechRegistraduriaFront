import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

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

  // POST con JSON puro
  crearPartido(datosPartido: any): Observable<PartidoResponse> {
    return this.http.post<PartidoResponse>(`${this.apiUrl}/add`, datosPartido).pipe(
      catchError((error) => {
        console.error('Error crearPartido:', error);
        return throwError(() => error);
      }),
    );
  }

  // PATCH por archivo individual
  subirArchivo(idPartido: number, campo: string, archivo: File): Observable<any> {
    const formData = new FormData();
    formData.append(campo, archivo);
    return this.http.patch(`${this.apiUrl}/${idPartido}/${campo}`, formData).pipe(
      catchError((error) => {
        console.error(`Error subiendo ${campo}:`, error);
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
