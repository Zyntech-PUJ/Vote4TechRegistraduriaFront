import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthStateService } from '../../services/auth-state.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  userName: string | null = null;
  userType: string | null = null;
  userRole: string = 'Usuario'; // Agregar esto
  private subscription: Subscription | null = null;
  private authChangeHandler: (() => void) | null = null;

  constructor(
    private authService: AuthStateService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.subscription = this.authService.user$.subscribe((user) => {
      this.isAuthenticated = !!user;
      this.userName = user?.usuario || user?.username || null;
      this.userType = user?.tipo || null;
      this.userRole = this.getTypeLabel(); // Actualizar role aquí
      console.log('👤 Usuario actualizado:', {
        userName: this.userName,
        userType: this.userType,
        userRole: this.userRole,
      }); // DEBUG
      this.cdr.markForCheck();
    });

    this.authChangeHandler = () => this.updateAuthState();
    window.addEventListener('authChange', this.authChangeHandler);
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.authChangeHandler) {
      window.removeEventListener('authChange', this.authChangeHandler);
    }
  }

  private updateAuthState() {
    const user = this.authService.currentUser();
    this.isAuthenticated = !!user;
    this.userName = user?.usuario || user?.username || null;
    this.userType = user?.tipo || null;
    this.userRole = this.getTypeLabel(); // Actualizar role aquí también
    console.log('👤 Estado de auth actualizado:', {
      userName: this.userName,
      userType: this.userType,
      userRole: this.userRole,
    }); // DEBUG
    this.cdr.markForCheck();
  }

  onLogout() {
    if (confirm('¿Desea cerrar sesión?')) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }

  /**
   * Mapear todos los tipos de usuario posibles
   */
  getTypeLabel(): string {
    if (!this.userType) return 'Usuario';

    const typeMap: { [key: string]: string } = {
      registrador: 'Registrador',
      REGISTRADOR: 'Registrador',
      consejo: 'Consejo Nacional',
      CONSEJO: 'Consejo Nacional',
      admin: 'Administrador Electoral',
      ADMIN: 'Administrador Electoral',
      administrador: 'Administrador Electoral',
      ADMINISTRADOR: 'Administrador Electoral',
    };

    return typeMap[this.userType] || this.userType;
  }

  /**
   * Navegación desde los dropdowns
   */
  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}
