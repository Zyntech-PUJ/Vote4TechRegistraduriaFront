import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface UserData {
  id?: number;
  usuario?: string;
  username?: string;
  rol?: string;
  roles?: string[];
  tipo?: string;
  exp?: number;
  iat?: number;
  sub?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthStateService {
  private apiUrl = '/api';

  currentUser = signal<UserData | null>(null);
  private userSubject = new BehaviorSubject<UserData | null>(null);
  public user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const stored = localStorage.getItem('authUser');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        this.currentUser.set(user);
        this.userSubject.next(user);
      } catch (e) {
        this.clearAuth();
      }
    }
  }

  // ── Endpoint unificado según el back nuevo ────────────────────
  // POST /usuarios/login → retorna { token, usuario, roles: [...] }
  login(usuario: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/usuarios/login`, { usuario, password }).pipe(
      tap((response: any) => {
        if (!response?.token) throw new Error('Token no recibido');

        // El back retorna roles como array, tomamos el primero
        const rol =
          Array.isArray(response.roles) && response.roles.length > 0
            ? response.roles[0]
            : 'registrador';

        this.saveAuth(response.token, rol, response.usuario);
      }),
    );
  }

  private saveAuth(token: string, rol: string, usuarioNombre?: string): void {
    localStorage.setItem('authToken', token);

    const decoded = this.decodeToken(token);
    const userData: UserData = {
      ...decoded,
      rol,
      tipo: rol,
      usuario: usuarioNombre || decoded.usuario || decoded.sub,
    };

    localStorage.setItem('authUser', JSON.stringify(userData));
    this.currentUser.set(userData);
    this.userSubject.next(userData);
    window.dispatchEvent(new Event('authChange'));
  }

  private decodeToken(token: string): UserData {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) throw new Error('Invalid token format');
      return JSON.parse(atob(parts[1]));
    } catch {
      return {};
    }
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;
    try {
      const decoded = this.decodeToken(token);
      if (!decoded.exp) return false;
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken() && !this.isTokenExpired();
  }

  getUserType(): string | null {
    return this.currentUser()?.tipo || null;
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    this.currentUser.set(null);
    this.userSubject.next(null);
    window.dispatchEvent(new Event('authChange'));
  }

  private clearAuth(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    this.currentUser.set(null);
    this.userSubject.next(null);
  }
}
