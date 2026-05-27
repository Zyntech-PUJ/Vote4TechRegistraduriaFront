import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface CiudadanoMultado {
  id: number;
  nombreCompleto: string;
  cedula: string;
  email: string;
  nombreEleccion: string;
  fechaEleccion: string;
  estadoNotificacion: 'Pendiente' | 'Entregado';
  enviadoACorreo: 'Pendiente' | 'Entregado';
  fechaFinalizacionEleccionActiva: string;
}

@Injectable({
  providedIn: 'root',
})
export class NotificacionesService {
  // Servicio .NET en la VM de backend
  private apiUrl = '/api-multas/Multas';

  constructor(private http: HttpClient) {}

  getMultas(): Observable<CiudadanoMultado[]> {
    return this.http.get<CiudadanoMultado[]>(this.apiUrl).pipe(
      catchError((error) => {
        console.error('Error getMultas:', error);
        return throwError(() => error);
      }),
    );
  }

  getMultasPendientes(): Observable<CiudadanoMultado[]> {
    return this.http.get<CiudadanoMultado[]>(`${this.apiUrl}/pendientes`).pipe(
      catchError((error) => {
        console.error('Error getMultasPendientes:', error);
        return throwError(() => error);
      }),
    );
  }

  notificar(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/notificar`, {}).pipe(
      catchError((error) => {
        console.error('Error notificar:', error);
        return throwError(() => error);
      }),
    );
  }
}
