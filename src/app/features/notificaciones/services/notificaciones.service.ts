import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface CiudadanoMultado {
  cedula: string;
  estadoNotificacion: 'PENDIENTE' | 'ENTREGADO';
  enviadoACorreo: 'PENDIENTE' | 'ENTREGADO';
  fechaFinalizacionEleccionActiva: string;
}

@Injectable({
  providedIn: 'root',
})
export class NotificacionesService {
  // URL del servicio .NET de tu compañero — ajustar cuando lo despliegue
  private apiUrl = '/api-notificaciones/multas';

  constructor(private http: HttpClient) {}

  getCiudadanosMultados(): Observable<CiudadanoMultado[]> {
    return this.http.get<CiudadanoMultado[]>(this.apiUrl).pipe(
      catchError((error) => {
        console.error('Error getCiudadanosMultados:', error);
        return throwError(() => error);
      }),
    );
  }
}
